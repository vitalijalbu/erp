<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\Request;
use App\Models\Um;
use Illuminate\Support\Facades\DB;
use App\Models\ItemGroup;
use Illuminate\Contracts\Database\Eloquent\Builder;

class UmController extends ApiController
{

    /**
     * @OA\Get(
     *   tags={"Um", "masterdata_item_add.php"},
     *   path="/um",
     *   summary="Um list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *       @OA\Property(
     *         type="object",
     *         @OA\Items(ref="#/components/schemas/UmResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $this->authorize('viewAny', Um::class);
        $um = Um::with('umDimensions')->orderBy('IDdim', 'asc')->get();

        return response()->json($um);
    }


    /**
     * @OA\Get(
     *   tags={"Um", "masterdata_item_add.php"},
     *   path="/um/{id}",
     *   summary="Show um",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/UmResource")
     *   )
     * )
     */
    public function show(Um $um)
    {
        $this->authorize('viewAny', Um::class);

        return response()->json($um);
    }

    /**
     * @OA\Get(
     *   tags={"Um dimensions"},
     *   path="/um/{idDim}/dimensions",
     *   summary="Um dimensions list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *       @OA\Property(
     *         type="object",
     *         @OA\Items(ref="#/components/schemas/UmResource")
     *       ),
     *     )
     *   )
     * )
     */

    public function dimensions(Um $um)
    {
        $this->authorize('viewAny', Um::class);

        $um->loadMissing('umDimensions');

        return response()->json($um->umDimensions->toArray());
    }

}
