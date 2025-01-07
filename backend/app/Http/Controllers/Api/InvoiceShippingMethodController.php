<?php

namespace App\Http\Controllers\Api;

use App\DataTables\InvoiceShippingMethodDataTable;
use App\Http\Controllers\Controller;
use App\Models\InvoiceShippingMethod;
use Illuminate\Http\Request;

class InvoiceShippingMethodController extends Controller
{
    /**
     * @OA\Get(
     *   tags={"Invoice shipping methods"},
     *   path="/invoice-shipping-methods",
     *   summary="Get list of invoice shipping method",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/InvoiceShippingMethodResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new InvoiceShippingMethodDataTable(
            InvoiceShippingMethod::query()
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
     *   tags={"Invoice shipping methods"},
     *   path="/invoice-shipping-methods/{code}",
     *   summary="Get details of single invoice shipping method",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/InvoiceShippingMethodResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(InvoiceShippingMethod $invoiceShippingMethod)
    {
        return response()->json($invoiceShippingMethod);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, InvoiceShippingMethod $invoiceShippingMethod)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(InvoiceShippingMethod $invoiceShippingMethod)
    {
        //
    }
}
