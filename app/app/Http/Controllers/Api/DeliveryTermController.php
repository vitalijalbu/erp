<?php

namespace App\Http\Controllers\Api;

use App\Models\DeliveryTerm;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\DataTables\DeliveryTermDataTable;

class DeliveryTermController extends Controller
{
   /**
     * @OA\Get(
     *   tags={"Delivery terms"},
     *   path="/delivery-terms",
     *   summary="Get list of delivery terms",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/DeliveryTermResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new DeliveryTermDataTable(
            DeliveryTerm::query()
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
     *   tags={"Delivery terms"},
     *   path="/delivery-terms/{id}",
     *   summary="Get details of single delivery term",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/DeliveryTermResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(DeliveryTerm $deliveryTerm)
    {
        return response()->json($deliveryTerm);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DeliveryTerm $deliveryTerm)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DeliveryTerm $deliveryTerm)
    {
        //
    }
}
