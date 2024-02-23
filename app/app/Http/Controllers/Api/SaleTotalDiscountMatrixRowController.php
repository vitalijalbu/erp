<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\SaleTotalDiscountMatrix;
use App\Models\SaleTotalDiscountMatrixRow;
use App\Http\Controllers\Controller;
use App\DataTables\SaleTotalDiscountMatrixRowDataTable;
use App\Http\Requests\ToggleSaleTotalDiscountMatrixRowRequest;
use App\Http\Requests\StoreUpdateSaleTotalDiscountMatrixRowRequest;

class SaleTotalDiscountMatrixRowController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(SaleTotalDiscountMatrix::class, ['saleTotalDiscountMatrix', 'saleTotalDiscountMatrixRow']);
    }
    /**
     * @OA\Get(
     *   tags={"Sales Total Discount Matrix"},
     *   path="/sales-total-discount-matrix/{id}/rows",
     *   summary="Get sales total discount matrix rows",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/SaleTotalDiscountMatrixRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index(Request $request, SaleTotalDiscountMatrix $saleTotalDiscountMatrix)
    {
        $datatable = new SaleTotalDiscountMatrixRowDataTable(
            SaleTotalDiscountMatrixRow::query()
                ->where('company_id', auth()->user()->IDcompany)
                ->where('sale_total_discount_matrix_id', $saleTotalDiscountMatrix->id)
                ->with(['item' => function($q){
                    $q->select('IDitem', 'item', 'item_desc');
                }])
                ->with(['itemGroup' => function($q){
                    $q->select('id', 'item_group', 'group_desc');
                }])
                ->with(['itemSubfamily' => function($q){
                    $q->select('id', 'code', 'description');
                }])
                ->with(['serviceItem' => function($q){
                    $q->select('IDitem', 'item', 'item_desc');
                }])
                ->with(['bp' => function($q){
                    $q->select('IDbp', 'desc');
                }])
                ->with(['bpGroup' => function($q){
                    $q->select('id', 'name');
                }])
                ->with(['saleTotalDiscountMatrix' => function($q){
                    $q->select('id', 'description');
                }])
        );

        if(!$request->has('position')) {
            $datatable->order(function($query) {
                $query->orderBy('position');
            });
        }

        return $datatable->toJson();
    }

  /**
     * @OA\Post(
     *   tags={"Sales Total Discount Matrix"},
     *   path="/sales-total-discount-matrix/{id}/rows",
     *   summary="Create sales total discount matrix row",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "position", "value", "service_item_id"
     *       },
     *       @OA\Property(property="position", type="integer"),
     *       @OA\Property(property="value", type="float"),
     *       @OA\Property(property="service_item_id", type="string"),
     *       example={
     *          "position" : 1,
     *          "item_id" : "845-10",
     *          "item_group_id" : "",
     *          "item_subfamily_id" : "",
     *          "service_item_id" : "845-1026",
     *          "quantity" : 10,
     *          "width" : "",
     *          "value" : "20",
     *          "bp_id" : "",
     *          "bp_group_id": "",
     *          "note" : "",
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
     *         @OA\Items(ref="#/components/schemas/SaleTotalDiscountMatrixRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function store(StoreUpdateSaleTotalDiscountMatrixRowRequest $request, SaleTotalDiscountMatrix $saleTotalDiscountMatrix)
    {
        $saleTotalDiscountMatrixRow = new SaleTotalDiscountMatrixRow();
        $saleTotalDiscountMatrixRow->fill($request->validated());
        $saleTotalDiscountMatrixRow->company_id = auth()->user()->IDcompany;
        $saleTotalDiscountMatrixRow->sale_total_discount_matrix_id = $saleTotalDiscountMatrix->id;

        if(!$saleTotalDiscountMatrixRow->save()){
            abort(500);
        }

        return $this->show($saleTotalDiscountMatrix, $saleTotalDiscountMatrixRow);
    }

    /**
     * @OA\Get(
     *   tags={"Sales Total Discount Matrix"},
     *   path="/sales-total-discount-matrix/{id}/rows/{idRow}",
     *   summary="Get details of sales total discount matrix row",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/SaleTotalDiscountMatrixRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(SaleTotalDiscountMatrix $saleTotalDiscountMatrix, SaleTotalDiscountMatrixRow $saleTotalDiscountMatrixRow)
    {
        $saleTotalDiscountMatrixRow->loadMissing(['item', 'itemGroup', 'itemSubfamily', 'bp', 'bpGroup', 'serviceItem']);
        
        return response()->json($saleTotalDiscountMatrixRow);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreUpdateSaleTotalDiscountMatrixRowRequest $request, SaleTotalDiscountMatrix $saleTotalDiscountMatrix, SaleTotalDiscountMatrixRow $saleTotalDiscountMatrixRow)
    {
        //
    }

    /**
     * @OA\Delete(
     *   tags={"Sales Total Discount Matrix"},
     *   path="/sales-total-discount-matrix/{id}/rows/{idRow}",
     *   summary="Delete sales total discount matrix row",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/SaleTotalDiscountMatrixRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function destroy(SaleTotalDiscountMatrix $saleTotalDiscountMatrix, SaleTotalDiscountMatrixRow $saleTotalDiscountMatrixRow)
    {
        if(!$saleTotalDiscountMatrixRow->delete()){
            abort(500);
        }
    }

    /**
     * @OA\Put(
     *   tags={"Sales Total Discount Matrix"},
     *   path="/sales-total-discount-matrix/{id}/rows/{idRow}/toggle",
     *   summary="Enable/disable sales total discount matrix row",
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
     *         @OA\Items(ref="#/components/schemas/SaleTotalDiscountMatrixRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function toggle(ToggleSaleTotalDiscountMatrixRowRequest $request, SaleTotalDiscountMatrix $saleTotalDiscountMatrix, SaleTotalDiscountMatrixRow $saleTotalDiscountMatrixRow)
    {
        $this->authorize('toggle', [$saleTotalDiscountMatrix, $saleTotalDiscountMatrixRow]);

        $saleTotalDiscountMatrixRow->is_disabled = $request->disable;

        if(!$saleTotalDiscountMatrixRow->save()){
            abort(500);
        }
    }
}
