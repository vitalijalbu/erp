<?php

namespace App\Http\Controllers\Api;

use App\DataTables\PaymentTermDataTable;
use App\Http\Controllers\Controller;
use App\Models\PaymentTerm;
use Illuminate\Http\Request;

class PaymentTermController extends Controller
{
    /**
     * @OA\Get(
     *   tags={"Payment terms"},
     *   path="/payment-terms",
     *   summary="Get list of payment terms",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/PaymentTermResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new PaymentTermDataTable(
            PaymentTerm::query()
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
     *   tags={"Payment terms"},
     *   path="/payment-terms/{code}",
     *   summary="Get details of single payment term",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/PaymentTermResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(PaymentTerm $paymentTerm)
    {
        return response()->json($paymentTerm);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PaymentTerm $paymentTerm)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PaymentTerm $paymentTerm)
    {
        //
    }
}
