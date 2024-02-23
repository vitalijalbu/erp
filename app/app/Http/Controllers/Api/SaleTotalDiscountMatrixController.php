<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\SaleTotalDiscountMatrix;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\DataTables\SaleTotalDiscountMatrixDataTable;
use App\Http\Requests\ToggleSaleTotalDiscountMatrixRequest;
use App\Http\Requests\StoreUpdateSaleTotalDiscountMatrixRequest;

class SaleTotalDiscountMatrixController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(SaleTotalDiscountMatrix::class, 'saleTotalDiscountMatrix');
    }
    /**
     * @OA\Get(
     *   tags={"Sales Total Discount Matrix"},
     *   path="/sales-total-discount-matrix",
     *   summary="Get sales total discount matrix",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/SaleTotalDiscountMatrixResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new SaleTotalDiscountMatrixDataTable(
            SaleTotalDiscountMatrix::query()
                ->select('*', 'sale_total_discount_matrices.currency_id')
                ->where('company_id', auth()->user()->IDcompany)
        );

        return $datatable->toJson();
    }

    /**
     * @OA\Post(
     *   tags={"Sales Total Discount Matrix"},
     *   path="/sales-total-discount-matrix",
     *   summary="Create sales total discount matrix",
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
     *         @OA\Items(ref="#/components/schemas/SaleTotalDiscountMatrixResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function store(StoreUpdateSaleTotalDiscountMatrixRequest $request)
    {
        $saleTotalDiscountMatrix = new SaleTotalDiscountMatrix();
        $saleTotalDiscountMatrix->fill($request->validated());
        $saleTotalDiscountMatrix->company_id = auth()->user()->IDcompany;


        if(!$saleTotalDiscountMatrix->save()){
            abort(500);
        }

        return $this->show($saleTotalDiscountMatrix);
    }

    /**
     * @OA\Get(
     *   tags={"Sales Total Discount Matrix"},
     *   path="/sales-total-discount-matrix/{id}",
     *   summary="Get details of sales total discount matrix",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/SaleTotalDiscountMatrixResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(SaleTotalDiscountMatrix $saleTotalDiscountMatrix)
    {
        $saleTotalDiscountMatrix->loadMissing(['currency', 'rows']);
        
        return response()->json($saleTotalDiscountMatrix);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreUpdateSaleTotalDiscountMatrixRequest $request, SaleTotalDiscountMatrix $saleTotalDiscountMatrix)
    {
        //
    }

    /**
     * @OA\Delete(
     *   tags={"Sales Total Discount Matrix"},
     *   path="/sales-total-discount-matrix/{id}",
     *   summary="Delete sales total discount matrix",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/SaleTotalDiscountMatrixResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function destroy(SaleTotalDiscountMatrix $saleTotalDiscountMatrix)
    {
        if(!$saleTotalDiscountMatrix->rows->isEmpty()){
            abort(400, "You cannot delete the sales total discount matrix because there are associated rows");
        }
        
        if(!$saleTotalDiscountMatrix->delete()){
            abort(500);
        }
    }

    /**
     * @OA\Put(
     *   tags={"Sales Total Discount Matrix"},
     *   path="/sales-total-discount-matrix/{id}/toggle",
     *   summary="Enable/disable sales total discount matrix",
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
     *         @OA\Items(ref="#/components/schemas/SaleTotalDiscountMatrixResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function toggle(ToggleSaleTotalDiscountMatrixRequest $request, SaleTotalDiscountMatrix $saleTotalDiscountMatrix)
    {
        $this->authorize('toggle', $saleTotalDiscountMatrix);

        $saleTotalDiscountMatrix->is_disabled = $request->disable;

        if(!$saleTotalDiscountMatrix->save()){
            abort(500);
        }
    }
}
