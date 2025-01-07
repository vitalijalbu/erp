<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\SaleDiscountMatrix;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\DataTables\SaleDiscountMatrixDataTable;
use App\Http\Requests\CloneSaleDiscountMatrixRequest;
use App\Http\Requests\ToggleSaleDiscountMatrixRequest;
use App\Http\Requests\StoreUpdateSaleDiscountMatrixRequest;

class SaleDiscountMatrixController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(SaleDiscountMatrix::class, 'saleDiscountMatrix');
    }
    /**
     * @OA\Get(
     *   tags={"Sales Discount Matrix"},
     *   path="/sales-discount-matrix",
     *   summary="Get sales discount matrix",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/SaleDiscountMatrixResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new SaleDiscountMatrixDataTable(
            SaleDiscountMatrix::query()
                ->select('*', 'sale_discount_matrices.currency_id')
                ->where('sale_discount_matrices.company_id', auth()->user()->IDcompany)
                ->with(['bp' => function($q){
                    $q->select('IDbp', 'desc');
                }, 'salePriceList'])
        );

        return $datatable->toJson();
    }

    /**
     * @OA\Post(
     *   tags={"Sales Discount Matrix"},
     *   path="/sales-discount-matrix",
     *   summary="Create sales discount matrix",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "priority", "description"
     *       },
     *       @OA\Property(property="priority", type="integer"),
     *       @OA\Property(property="description", type="string"),
     *       example={
     *          "priority" : 1,
     *          "description" : "Matrice 1",
     *          "currency_id" : "EUR",
     *          "bp_id" : "",
     *          "sales_price_list_id" : ""
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
     *         @OA\Items(ref="#/components/schemas/SaleDiscountMatrixResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function store(StoreUpdateSaleDiscountMatrixRequest $request)
    {
        $saleDiscountMatrix = new SaleDiscountMatrix();
        $saleDiscountMatrix->fill($request->validated());
        $saleDiscountMatrix->company_id = auth()->user()->IDcompany;


        if(!$saleDiscountMatrix->save()){
            abort(500);
        }

        return $this->show($saleDiscountMatrix);
    }

    /**
     * @OA\Get(
     *   tags={"Sales Discount Matrix"},
     *   path="/sales-discount-matrix/{id}",
     *   summary="Get details of sales discount matrix",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/SaleDiscountMatrixResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(SaleDiscountMatrix $saleDiscountMatrix)
    {
        $saleDiscountMatrix->loadMissing(['bp', 'currency', 'rows', 'salePriceList']);
        
        return response()->json($saleDiscountMatrix);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreUpdateSaleDiscountMatrixRequest $request, SaleDiscountMatrix $saleDiscountMatrix)
    {
        //
    }

    /**
     * @OA\Delete(
     *   tags={"Sales Discount Matrix"},
     *   path="/sales-discount-matrix/{id}",
     *   summary="Delete sales discount matrix",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/SaleDiscountMatrixResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function destroy(SaleDiscountMatrix $saleDiscountMatrix)
    {
        if(!$saleDiscountMatrix->rows->isEmpty()){
            abort(400, "You cannot delete the sales discount matrix because there are associated rows");
        }
        
        if(!$saleDiscountMatrix->delete()){
            abort(500);
        }
    }

    /**
     * @OA\Put(
     *   tags={"Sales Discount Matrix"},
     *   path="/sales-discount-matrix/{id}/toggle",
     *   summary="Enable/disable sales discount matrix",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "disable"
     *       },
     *       @OA\Property(property="disable", type="boolean"),
     *       example={
     *          "disable" : true
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
     *         @OA\Items(ref="#/components/schemas/SaleDiscountMatrixResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function toggle(ToggleSaleDiscountMatrixRequest $request, SaleDiscountMatrix $saleDiscountMatrix)
    {
        $this->authorize('toggle', $saleDiscountMatrix);

        $saleDiscountMatrix->is_disabled = $request->disable;

        if(!$saleDiscountMatrix->save()){
            abort(500);
        }
    }
}
