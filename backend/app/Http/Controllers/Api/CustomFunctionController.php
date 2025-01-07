<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\Request;
use App\Models\CustomFunction;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreCustomFunctionRequest;
use App\Configurator\Execution\EngineClientInterface;


class CustomFunctionController extends ApiController
{

    public function __construct()
    {
        $this->authorizeResource(CustomFunction::class, 'function');
    }


    /**
     * @OA\Get(
     *   tags={"Custom Function"},
     *   path="/functions/",
     *   summary="Get available custom functions",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/CustomFunctionTypeResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new \App\DataTables\CustomFunctionsDataTable(
            CustomFunction::with(['customFunctionCategory'])
        );
        return $datatable->toJson();
    }

    /**
     * @OA\Post(
     *   tags={"Custom Functions"},
     *   path="/functions",
     *   summary="Create new custom function",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "id",
     *          "label",
     *          "arguments",
     *          "body",
     *       },
     *       @OA\Property(property="id", type="string"),
     *       @OA\Property(property="label", type="string"),
     *       @OA\Property(property="description", type="string"),
     *       @OA\Property(property="arguments", type="object"),
     *       @OA\Property(property="body", type="object"),
     *       @OA\Property(property="custom_function_category_id", type="integer"),
     *       example={
     *          "id": "get_price",
     *          "label": "Get Product Price",
     *          "description": "Function for getting product price",
     *          "arguments": "[{""name"": ""productId""}]",
     *          "body": "<blockly json>",
     *          "custom_function_category_id": 1
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/CustomFunctionResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function store(StoreCustomFunctionRequest $request)
    {
        $function = new CustomFunction();
        $function->fill($request->all());

        try {
            $saved = DB::transaction(function() use ($function, $request) {
                return $function->save();
            });
    
            if(!$saved) {
                abort(500);
            }

            return $this->show($function);
        }
        catch (\App\Configurator\Conversion\CodeConversionException $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *   tags={"Custom Functions"},
     *   path="/functions/{id}",
     *   summary="Custom Function show",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/CustomFunctionResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function show(CustomFunction $function)
    {
        return response()->json($function);
    }

    /**
     * @OA\Put(
     *   tags={"Custom Functions"},
     *   path="/functions/{id}",
     *   summary="Update Custom Function",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="id", type="string"),
     *       @OA\Property(property="label", type="string"),
     *       @OA\Property(property="description", type="string"),
     *       @OA\Property(property="arguments", type="object"),
     *       @OA\Property(property="body", type="object"),
     *       @OA\Property(property="custom_function_category_id", type="integer"),
     *       example={
     *          "id": "get_price",
     *          "label": "Get Product Price",
     *          "description": "Function for getting product price",
     *          "arguments": "[{""name"": ""productId""}]",
     *          "body": "<blockly json>",
     *          "custom_function_category_id": 1
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/CustomFunctionResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function update(StoreCustomFunctionRequest $request, CustomFunction $function)
    {
        $function->fill($request->except(['id']));

        try {
            $saved = DB::transaction(function() use ($function, $request) {
                return $function->save();
            });
    
            if(!$saved) {
                abort(500);
            }
        }
        catch (\App\Configurator\Conversion\CodeConversionException $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *   tags={"Custom Function"},
     *   path="/functions/{id}",
     *   summary="Delete Custom Function",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/CustomFunction")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function delete(CustomFunction $function)
    {
        if(!$function->delete()) {
            abort(500);
        }
    }

    /**
     * @OA\Post(
     *   tags={"Custom Function"},
     *   path="/functions/{id}/test",
     *   summary="Test custom function",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={"params"},
     *       @OA\Property(property="params", type="object"),
     *       example={
     *          "params": {
     *              "arg1": "val",
     *              "arg2": "val2"
     *          },
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
    public function test(CustomFunction $function, Request $request, EngineClientInterface $engineClient)
    {
        $this->authorize('update', $function);
        
        $execution = $engineClient->callFunction(
            $function->id, 
            $request->params ?? [], 
            ['user' => auth()->user()], 
            ['debug' => true]
        ); 

        return response()->json([
            'execution' => $execution['data']
        ], $execution['status'] ? 200 : 500);
    }
}
