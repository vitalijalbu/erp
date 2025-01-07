<?php

namespace App\Http\Controllers\Api;

use App\Models\Stock;
use App\Models\OrderMerge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\OrderMergeRowsReturn;
use App\Models\OrderMergeRowsPicking;
use App\Http\Requests\StoreOrderLotMerge;
use App\Http\Requests\OrderLotMergeViewRequest;
use App\DataTables\AdditionalLotToMergeDataTable;
use App\Http\Requests\AdditionalLotToMergeRequest;
use App\Http\Requests\ApplyReturnOrderLotMergeRequest;

class OrderLotMergeController extends Controller
{
    /**
     * @OA\GET(
     *   tags={"order-lot-merge"},
     *   path="/order-lot-merge",
     *   summary="List of lot to merge",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idStock"
     *       },
     *       @OA\Property(property="idStock", type="int"),
     *       @OA\Property(property="idMerge", type="int|null"),
     *       example={
     *          "idStock": 186615,
     *          "idMerge" : 0
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error"),
     *   @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function index(OrderLotMergeViewRequest $request)
    {
        $this->authorize('index', OrderMergeRowsPicking::class);
        
        $user = auth()->user();

        $lots = 
            DB::query()
                ->selectRaw("IDmerge,IDmerge_row_picking_id, IDlot, item, item_desc, um, qty, dim, whdesc, lcdesc, 
                stepRoll, IDstock , IDitem, IDlocation, date_lot, IDwarehouse, executed")
                ->fromSub(OrderMergeRowsPicking::getOrderInfo($user->IDcompany, $request->idMerge ?? 0, $request->idStock), 'p')
                ->orderBy('stepRoll')
                ->orderBy('IDlot')
                ->get();

        abort_if($lots->isEmpty() || $lots->first()->um != 'm2', 404);
        
        return response()->json($lots);
    }

    /**
     * @OA\GET(
     *   tags={"order-lot-merge"},
     *   path="/order-lot-merge/additional-lots",
     *   summary="List of additional lots to merge",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idItem", "idWarehouse"
     *       },
     *       @OA\Property(property="idItem", type="int"),
     *       @OA\Property(property="idWarehouse", type="int"),
     *       example={
     *          "idItem": 3543,
     *          "idWarehouse" : 17
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error"),
     *   @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function additionalLotToMerge(AdditionalLotToMergeRequest $request)
    {
        $this->authorize('additionalLotToMerge', OrderMergeRowsPicking::class);

        $user = auth()->user();

        $lots =  
            Stock::query()
                ->select('stock.IDstock', 'stock.IDlot', 'stock.qty_stock', 'stock.IDlocation', 'd.LA', 'd.LU', 'd.PZ',)
                
                ->whereHas('warehouseLocation', function($q) use ($user){
                    $q->where('IDcompany', $user->IDcompany);
                })
                ->whereHas('lot.item', function($q) use ($user, $request){
                    $q->where('IDitem', $request->idItem);
                })
                ->whereHas('lot', function($q) use ($user){
                    $q->where('IDcompany', $user->IDcompany);
                })
                ->join(DB::raw('parView_lotDimensionsPivot (?) d'), 'd.IDlot', '=', 'stock.IDlot')
                ->addBinding($user->IDcompany, 'join')
                ->where('stock.IDwarehouse', $request->idWarehouse)
                ->whereNotIn('IDstock', OrderMergeRowsPicking::select('IDstock'))
                ->with('lot', function($q){
                    $q->selectRaw('IDlot, IDlot_padre, IDitem, stepRoll, substring(convert(varchar, date_lot, 20),1,16) AS date_lot')
                        ->with('item', function($q){
                            $q->select('um', 'IDitem');
                        });
                })
                ->with('warehouseLocation', function($q){
                    $q->select('desc', 'IDlocation');
                })            
                ->withAggregate('lot', 'IDlot_padre');

                $d = 
                    (new AdditionalLotToMergeDataTable($lots))
                        ->order(function($q){
                            $q->orderBy('LU')
                                ->orderBy('LA')
                                ->orderBy('IDlot')
                                ->orderBy('lot_i_dlot_padre');
                        });

            return $d->toJson();
    }

    /**
     * @OA\POST(
     *   tags={"order-lot-merge"},
     *   path="/order-lot-merge",
     *   summary="Create merge order by id stock",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idStock"
     *       },
     *       @OA\Property(property="idStock", type="int"),
     *       @OA\Property(property="idMerge", type="int|null"),
     *       example={
     *          "idStock": 186615,
     *          "idMerge" : 0
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error"),
     *   @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function store(StoreOrderLotMerge $request)
    {
        $this->authorize('store', OrderMergeRowsPicking::class);
        
        $user = auth()->user();

        $order = 
            DB::query()
                ->selectRaw("IDmerge,IDmerge_row_picking_id, IDlot, item, item_desc, um, qty, dim, whdesc, lcdesc, 
                stepRoll, IDstock , IDitem, IDlocation, date_lot, IDwarehouse, executed")
                ->fromSub(OrderMergeRowsPicking::getOrderInfo($user->IDcompany, $request->idMerge ?? 0, $request->idStock), 'p')
                ->orderBy('stepRoll')
                ->orderBy('IDlot')
                ->first();

        abort_if(!$order || $order->um != 'm2' || $order->executed, 400);

        DB::transaction(function () use ($request, $user) {
            DB::statement('exec sp_order_merge_picking_add ?, ?, ?, ?', [
                $user->IDcompany,
                $user->username,
                $request->idStock,
                $request->idMerge ?? 0
            ]);
        });
    }

    /**
     * @OA\Delete(
     *   tags={"order-lot-merge"},
     *   path="/order-lot-merge/{id}",
     *   summary="Delete row",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK"
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function delete(OrderMergeRowsPicking $row)
    {
        $this->authorize('delete', $row);
       
        $user = auth()->user();

        $row->loadMissing('orderMerge');
       
        abort_if($row->orderMerge->executed || $row->orderMerge->IDmerge == 0, 400);

        DB::transaction(function () use ($user, $row) {

            $idMerge = $row->IDmerge;

            $row->delete();

            $Nrows = 
                OrderMergeRowsPicking::where([
                    'IDcompany' => $user->IDcompany,
                    'IDmerge' => $idMerge
                ])
                ->count();

            if($Nrows == 0){
                OrderMerge::where([
                    'IDcompany' => $user->IDcompany,
                    'IDmerge' => $idMerge
                ])
                ->delete();

                OrderMergeRowsPicking::where([
                    'IDcompany' => $user->IDcompany,
                    'IDmerge' => $idMerge
                ])
                ->delete();

                OrderMergeRowsReturn::where([
                    'IDcompany' => $user->IDcompany,
                    'IDmerge' => $idMerge
                ])
                ->delete();
            }
        });
    }

    /**
     * @OA\POST(
     *   tags={"order-lot-merge"},
     *   path="/order-lot-merge/apply-return",
     *   summary="Add dimensions of merged lot",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idMerge", "LA", "LU", "PZ", "idWarehouseLocation"
     *       },
     *       @OA\Property(property="idMerge", type="int"),
     *       @OA\Property(property="LA", type="float"),
     *       @OA\Property(property="LU", type="float"),
     *       @OA\Property(property="PZ", type="int"),
     *       @OA\Property(property="idWarehouseLocation", type="int"),
     *       example={
     *          "idMerge" : 10,
     *          "LA" : 400,
     *          "LU" : 200,
     *          "PZ" : 1,
     *          "idWarehouseLocation" : 375,
     *          
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error"),
     *   @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function applyReturn(ApplyReturnOrderLotMergeRequest $request)
    {
        $this->authorize('applyReturn', OrderMergeRowsPicking::class);

        $user = auth()->user();

        $order = 
            OrderMerge::where([
                'IDcompany' => $user->IDcompany,
                'IDmerge' => $request->idMerge
            ])
            ->with('rowsPicking')
            ->firstOrFail();

        abort_if($order->executed || $order->rowsPicking->count() <= 1, 400);

        DB::transaction(function () use ($request, $user) {
            DB::statement('exec sp_order_merge_return_add ?,?,?,?,?,?,?,?', [
                $user->IDcompany,
                $request->idMerge,
                $request->LA,
                $request->LU,
                $request->PZ,
                $request->ordRef ?? '',
                $user->username,
                $request->idWarehouseLocation
            ]);
        });
    }

    public function confirm()
    {

    }
}
