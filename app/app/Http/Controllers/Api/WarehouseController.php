<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\Request;
use App\Models\Warehouse;
use App\Models\WarehouseLocation;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreWarehouseRequest;
use App\Models\Country;

class WarehouseController extends ApiController
{

    public function __construct()
    {
        $this->authorizeResource(Warehouse::class, 'warehouse');
    }

    /**
     * @OA\Get(
     *   tags={"Warehouse", "masterdata_warehouse_location.php"},
     *   path="/warehouses",
     *   summary="Warehousec list",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *       @OA\Property(
     *         type="object",
     *         @OA\Items(ref="#/components/schemas/WarehouseLocationResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $result = Warehouse::with('warehouseLocations')
            ->with('Country')
            ->where('IDcompany', auth()->user()->IDcompany)
            ->orderBy('desc')
            ->get();

        return response()->json($result);
    }


    /**
     * @OA\Post(
     *   tags={"Warehouse", "masterdata_warehouse_location.php"},
     *   path="/warehouses",
     *   summary="Create new Warehouse",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "desc", "IDcountry"
     *       },
     *       @OA\Property(property="desc", type="string"),
     *       @OA\Property(property="IDcountry", type="string"),
     *       example={
     *          "desc": "Nome Warehouse",
     *          "IDcountry": "IT"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/WarehouseResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function store(StoreWarehouseRequest $request)
    {
        $warehouse = new Warehouse();
        $warehouse->fill($request->all());
        $warehouse->IDcompany = auth()->user()->IDcompany;
        $saved = DB::transaction(function() use ($warehouse, $request) {
            return $warehouse->save();
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Get(
     *   tags={"Warehouse", "masterdata_warehouse_location.php"},
     *   path="/warehouses/{id}",
     *   summary="Warehouse show",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/WarehouseResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function show(Warehouse $warehouse)
    {
        $warehouse->loadMissing('warehouseLocations');
        return response()->json($warehouse);
    }

    /**
     * @OA\Put(
     *   tags={"Warehouse", "masterdata_warehouse_location.php"},
     *   path="/warehouses/{id}",
     *   summary="Update Warehouse",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={},
     *       @OA\Property(property="desc", type="string"),
     *       example={
     *          "desc": "Nome BP",
     *          "supplier": 1,
     *          "customer": 0
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/BPResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function update(StoreWarehouseRequest $request, Warehouse $warehouse)
    {
        $warehouse->fill($request->only(['desc']));
        $saved = DB::transaction(function() use ($warehouse) {
            return $warehouse->save();
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Delete(
     *   tags={"Warehouse","masterdata_warehouse_location.php"},
     *   path="/warehouses/{id}",
     *   summary="Delete Warehouse",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/Warehouse")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function destroy(Warehouse $warehouse)
    {
        $deleted = DB::transaction(function() use ($warehouse) {
            return $warehouse->delete();
        });

        if(!$deleted) {
            abort(500);
        }
    }

    /**
     * @OA\Get(
     *   tags={"Countries", "masterdata_warehouse_location.php"},
     *   path="/countries",
     *   summary="Countries list",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *       @OA\Property(
     *         type="object",
     *         @OA\Items(ref="#/components/schemas/CountryResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function countries()
    {
        $result = Country::where('IDcompany', auth()->user()->IDcompany)
            ->orderBy('desc')
            ->get();

        return response()->json($result);
    }
}
