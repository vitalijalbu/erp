<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\Request;
use App\Models\Warehouse;
use App\Models\WarehouseLocation;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreWarehouseLocationRequest;
use App\Models\WarehouseLocationType;

class WarehouseLocationController extends ApiController
{

    public function __construct()
    {
        $this->authorizeResource(Warehouse::class, 'warehouse');
    }

    /**
     * @OA\Get(
     *   tags={"Warehouse", "masterdata_warehouse_location.php"},
     *   path="/warehouses/locations",
     *   summary="Warehouse locations list",
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
        $datatable = new \App\DataTables\WarehouseLocationDataTable(
            WarehouseLocation::byUser(auth()->user())->with([
                'warehouse.country',
                'warehouseLocationType'
            ])
        );

        return $datatable->toJson();
    }


    /**
     * @OA\Get(
     *   tags={"Warehouse", "masterdata_warehouse_location.php"},
     *   path="/warehouses/locations/types",
     *   summary="Get warehouse location types list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *       @OA\Property(
     *         type="object",
     *         @OA\Items(ref="#/components/schemas/WarehouseLocationTypeResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function types()
    {
        $this->authorize('viewAny', Warehouse::class);

        $result = WarehouseLocationType::orderBy('tname')->get();

        return response()->json($result);
    }


    /**
     * @OA\Post(
     *   tags={"Warehouse", "masterdata_warehouse_location.php"},
     *   path="/warehouses/{id}/locations",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   summary="Create new Warehouse Location",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "desc",
     *          "IDwarehouse"
     *       },
     *       @OA\Property(property="desc", type="string"),
     *       @OA\Property(property="note", type="string"),
     *       @OA\Property(property="IDwarehouse", type="integer"),
     *       @OA\Property(property="IDwh_loc_Type", type="integer"),
     *       example={
     *          "desc": "Nome destinazione",
     *          "note": "note",
     *          "IDwarehouse": 1,
     *          "IDwh_loc_Type": 1
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/WarehouseLocationResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function store(StoreWarehouseLocationRequest $request, Warehouse $warehouse)
    {
        $warehouseLocation = new WarehouseLocation();
        $warehouseLocation->fill($request->all());
        $warehouseLocation->IDcompany = $warehouse->IDcompany;
        $saved = DB::transaction(function() use ($warehouseLocation, $warehouse) {
            return $warehouse->warehouseLocations()->save($warehouseLocation);
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Get(
     *   tags={"Warehouse", "masterdata_warehouse_location.php"},
     *   path="/warehouses/{id}/locations/{location_id}",
     *   summary="Warehouse Location show",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Parameter(ref="#/components/parameters/location_id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/WarehouseLocationResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function show(Warehouse $warehouse, WarehouseLocation $location)
    {
        return response()->json($location->toArray());
    }

    /**
     * @OA\Put(
     *   tags={"Warehouse", "masterdata_warehouse_location.php"},
     *   path="/warehouses/{id}/locations/{location_id}",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Parameter(ref="#/components/parameters/location_id"),
     *   summary="Update Warehouse Location",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="desc", type="string"),
     *       example={
     *          "desc": "Nome destinazione",
     *          "note": "note",
     *          "IDwh_loc_Type": 1
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/WarehouseLocationResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function update(StoreWarehouseLocationRequest $request, Warehouse $warehouse, WarehouseLocation $location)
    {
        $location->fill($request->only(['desc', 'note', 'IDwh_loc_Type']));
        $saved = DB::transaction(function() use ($location) {
            return $location->save();
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Delete(
     *   tags={"Warehouse","masterdata_warehouse_location.php"},
     *   path="/warehouses/{id}/locations/{location_id}",
     *   summary="Delete BP destination",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Parameter(ref="#/components/parameters/location_id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function destroy(Warehouse $warehouse, WarehouseLocation $location)
    {
        $deleted = DB::transaction(function() use ($location) {
            return $location->delete();
        });

        if(!$deleted) {
            abort(500);
        }
    }
}
