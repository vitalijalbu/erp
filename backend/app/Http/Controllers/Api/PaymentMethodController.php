<?php

namespace App\Http\Controllers\Api;

use App\DataTables\PaymentMethodDataTable;
use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller
{
    /**
     * @OA\Get(
     *   tags={"Payment methods"},
     *   path="/payment-methods",
     *   summary="Get list of payment methods",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/PaymentMethodResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new PaymentMethodDataTable(
            PaymentMethod::query()
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
     *   tags={"Payment methods"},
     *   path="/payment-methods/{code}",
     *   summary="Get details of single payment method",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/PaymentMethodResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(PaymentMethod $paymentMethod)
    {
        return response()->json($paymentMethod);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PaymentMethod $paymentMethod)
    {
        //
    }
}
