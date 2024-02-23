<?php

namespace App\Http\Controllers\Api;

use App\DataTables\OrderTypeDataTable;
use App\Http\Controllers\Controller;
use App\Models\OrderType;
use Illuminate\Http\Request;

class OrderTypeController extends Controller
{
   /**
     * @OA\Get(
     *   tags={"Order types"},
     *   path="/order-types",
     *   summary="Get list of order types",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/OrderTypeResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new OrderTypeDataTable(
            OrderType::query()
        );

        return $datatable->toJson();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

   /**
     * @OA\Get(
     *   tags={"Order types"},
     *   path="/order-types/{id}",
     *   summary="Get details of single order type",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/OrderTypeResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(OrderType $orderType)
    {
        return response()->json($orderType);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, OrderType $orderType)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(OrderType $orderType)
    {
        //
    }
}
