<?php

namespace App\Http\Controllers\Api;

use App\Broadcasting\BroadcastManager;
use App\Configurator\Execution\EngineClientInterface;
use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\ConfiguratorInitRequest;
use App\Http\Requests\ConfiguratorEventRequest;
use App\Http\Requests\ConfiguratorCompleteRequest;
use App\Models\BP;
use App\Models\StandardProduct;
use App\Services\Configurator\Configuration\ConfigurationEvent;

class ConfiguratorController extends ApiController
{

    /**
     * @OA\Post(
     *   tags={"Configurator"},
     *   path="/configurator/init",
     *   summary="Start product configuration",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={"product", "bp"},
     *       @OA\Property(property="product", type="string"),
     *       @OA\Property(property="bp", type="string"),
     *       example={
     *          "product": "<standard product code>",
     *          "bp": "845-10",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/ConfiguratorResponseTypeResource")
     *       ),
     *     )
     *   ),
     *   
     * )
     */
    public function init(ConfiguratorInitRequest $request)
    {
        $product = StandardProduct::where('code', $request->product)->firstOrFail();
        $bp = BP::find($request->bp);

        $this->authorize('sale', $product);
        $this->authorize('sale', $bp);

        $execution = ConfigurationEvent::initEvent(
            $product, 
            $request->configuration ?? [],
            $bp->IDbp, 
        );

        return response()->json([
            'features' => $product->configurationFeatures()->orderBy('position', 'ASC')->get(),
            'execution' => $execution['data'] ?? []
        ], $execution['status'] ? 200 : 500);
    }

    
    /**
     * @OA\Post(
     *   tags={"Configurator"},
     *   path="/configurator/event",
     *   summary="Send a configuration event in product configuration",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={"product", "bp", "configuration", "event", "event_data"},
     *       @OA\Property(property="product", type="string"),
     *       @OA\Property(property="bp", type="string"),
     *       @OA\Property(property="configuration", type="object"),
     *       @OA\Property(property="event", type="string"),
     *       @OA\Property(property="event_data", type="object"),
     *       example={
     *          "product": "<standard product code>",
     *          "bp": "845-10",
     *          "configuration": {"feature": "feature value", "feature2", "feature2 value"},
     *          "event": "feature_change",
     *          "event_data": {"feature": "changed feature id"}
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/ConfiguratorResponseTypeResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function event(ConfiguratorEventRequest $request)
    {
        $product = StandardProduct::where('code', $request->product)->firstOrFail();
        $bp = BP::find($request->bp);

        $this->authorize('sale', $product);
        $this->authorize('sale', $bp);

        $execution = ConfigurationEvent::eventEvent(
            $product,
            $request->configuration ?? [],
            $request->event,
            $request->event_data,
            $bp->IDbp,
        );

        return response()->json([
            'execution' => $execution['data'] ?? []
        ], $execution['status'] ? 200 : 500);
    }


    /**
     * @OA\Post(
     *   tags={"Configurator"},
     *   path="/configurator/complete",
     *   summary="Complete the product configuration",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={"product", "bp", "configuration"},
     *       @OA\Property(property="product", type="string"),
     *       @OA\Property(property="bp", type="string"),
     *       @OA\Property(property="configuration", type="object"),
     *       example={
     *          "product": "<standard product code>",
     *          "bp": "845-10",
     *          "configuration": {"feature": "feature value", "feature2", "feature2 value"},
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/ConfiguratorResponseTypeResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function complete(ConfiguratorCompleteRequest $request, EngineClientInterface $engineClient)
    {
        $product = StandardProduct::where('code', $request->product)->firstOrFail();
        $bp = BP::find($request->bp);

        $this->authorize('sale', $product);
        $this->authorize('sale', $bp);

        $execution = ConfigurationEvent::completeEvent(
            $product, 
            $request->configuration,
            $bp->IDbp, 
        );

        return response()->json([
            'execution' => $execution['data'] ?? []
        ], $execution['status'] ? 200 : 500);
        
    }

    /**
     * @OA\Post(
     *   tags={"Configurator"},
     *   path="/configurator/authorize-debug",
     *   summary="Authorize the user to receive debug data",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={"socket_id"},
     *       @OA\Property(property="socket_id", type="string"),
     *       example={
     *          "socket_id": "adasaadadffsdf",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array"
     *       ),
     *     )
     *   )
     * )
     */
    public function authorizeDebug(Request $request)
    {
        BroadcastManager::authorizeRoom($request->socket_id, 'debug');

        return response(null, 200);
    }
}
