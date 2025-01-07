<?php

namespace App\Http\Controllers\Api;

use App\Models\Lot;
use App\Models\Stock;
use Illuminate\Http\Request;
use App\Models\OrderProduction;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\ConfirmOrderProductionRequest;
use App\Http\Requests\OrderProductionViewRequest;
use App\Http\Requests\StoreOrderProductionRequest;
use App\Http\Requests\UpdateOrderProductionRequest;
use App\Models\OrderProductionComponent;

class OrderProductionController extends ApiController
{
    /**
     * @OA\GET(
     *   tags={"orders-production"},
     *   path="/orders-production",
     *   summary="List of order production, lot data and components",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idLot"
     *       },
     *       @OA\Property(property="idLot", type="string"),
     *       example={
     *          "idLot": "FRVIF21000753"
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
    public function index(OrderProductionViewRequest $request)
    {
        $this->authorize('index', OrderProductionComponent::class);

        $user = auth()->user();

        $lotInfo = 
            DB::query()
                ->selectRaw("IDitem, item, item_desc, um, pz, la, lu, m2, IDwh, IDwhl, whdesc, whlcdesc, stepRoll, ord_rif, qty_stock, note, (select substring(convert(varchar, date_planned, 20),1,16) from dbo.cutting_order where IDcompany = l.IDcompany and IDlot = l.IDlot) as date_planned")
                ->when($user->company->read_alternative_item_code, function($q){
                    $q->addSelect(DB::raw("NULLIF(l.altv_code, '') as altv_code, NULLIF(l.altv_desc, '') as altv_desc"));
                }, function($q){
                    $q->addSelect(DB::raw('altv_code = null, altv_desc = null'));
                })
                ->fromSub(Lot::getLotInfoByCompany($user->company), 'l')
                ->where([
                    'l.IDlot' => $request->idLot,
                    'l.IDcompany' => $user->IDcompany
                ])
                ->first();

        $insertedComponents = 
            DB::query()
                ->selectRaw('o.IDord, o.IDcompany, o.IDlot, r.IDStock, r.IDcomp, 
                r.IDitem, item, item_desc, qty_expected, i.um, auto_lot, r.qty, r.executed, u.frazionabile,  
                isnull((select sum(qty_stock) 
                from dbo.stock ss 
                inner join dbo.lot ll on ll.IDcompany = ss.IDcompany and ll.IDlot = ss.IDlot 
                where ss.IDcompany = o.IDcompany and ll.IDitem = r.IDitem and ss.IDwarehouse = ? ),0) as qtyOnStock,
                isnull((select sum(qty_stock) 
                from dbo.stock sss 		 
                where sss.IDcompany = o.IDcompany and sss.IDstock = r.IDStock),0) as qtyOnStockSpecLot,
                isnull((select count(IDStock) from ( 
                    select IDStock
                    from dbo.order_production_components 
                    where IDcompany = o.IDcompany and IDord = o.IDord and IDStock is not null  
                    group by IDStock
                    having COUNT(IDStock) > 1 ) x ),0) as checkDoubleLotSelection
                ', [
                    $lotInfo->IDwh
                ])
                ->fromRaw('order_production o
                inner join dbo.order_production_components r on o.IDcompany = r.IDcompany and o.IDord = r.IDord  
                inner join dbo.item i on i.IDitem = r.IDitem  
                inner join dbo.um u on u.IDdim = i.um')
                ->where([
                    'o.IDcompany' => $user->IDcompany,
                    'o.IDlot' => $request->idLot
                ])
                ->get()
                ->map(function($row) use ($user, $lotInfo){
                    $row->stocks = 
                        DB::query()
                            ->selectRaw('s.IDstock, s.IDlot, qty_stock, w.[desc] as wdesc, wl.[desc] as wldesc, i.um')
                            ->fromRaw('stock s
                            inner join dbo.lot l on l.IDcompany = s.IDcompany and s.IDlot = l.IDlot
                            inner join dbo.item i on i.IDitem = l.IDitem
                            inner join dbo.warehouse w on w.IDcompany = s.IDcompany and w.IDwarehouse = s.IDwarehouse
                            inner join dbo.warehouse_location wl on wl.IDcompany = s.IDcompany and wl.IDlocation = s.IDlocation
                            ')
                            ->where([
                               's.IDcompany' => $user->IDcompany,
                               'i.IDitem' => $row->IDitem,
                               'l.stepRoll' => 0,
                               's.IDwarehouse' => $lotInfo->IDwh 
                            ])
                            ->get();
                    return $row;
                });

        $components = 
            Stock::query()
                ->selectRaw('distinct item.IDitem, item.item, item.item_desc')
                ->join('lot', function($q){
                    $q->on('stock.IDcompany', '=', 'lot.IDcompany');
                    $q->on('stock.IDlot', '=', 'lot.IDlot');
                })
                ->join('item', 'item.IDitem', '=', 'lot.IDitem')
                ->where('stock.IDcompany', $user->IDcompany)
                ->where('stock.IDlot', '<>', $request->idLot)
                ->orderBy('item.item')
                ->get();

        return response()->json([
            'lotInfo' => $lotInfo,
            'insertedComponents' => $insertedComponents,
            'components' => $components
        ]);     
    }

    /**
     * @OA\POST(
     *   tags={"orders-production"},
     *   path="/orders-production",
     *   summary="Add component to order production",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idLot", "idItem"
     *       },
     *       @OA\Property(property="idLot", type="string"),
     *       @OA\Property(property="idItem", type="int"),
     *       example={
     *          "idLot" : "FRVIF21000753",
     *          "idItem" : 3539
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
    public function store(StoreOrderProductionRequest $request)
    {
        $this->authorize('store', OrderProductionComponent::class);

        $user = auth()->user();

        $lotInfo = 
            DB::query()
                ->selectRaw("IDitem, item, item_desc, um, pz, la, lu, m2, IDwh, IDwhl, whdesc, whlcdesc, stepRoll, ord_rif, qty_stock, note, (select substring(convert(varchar, date_planned, 20),1,16) from dbo.cutting_order where IDcompany = l.IDcompany and IDlot = l.IDlot) as date_planned")
                ->when($user->company->read_alternative_item_code, function($q){
                    $q->addSelect(DB::raw("NULLIF(l.altv_code, '') as altv_code, NULLIF(l.altv_desc, '') as altv_desc"));
                }, function($q){
                    $q->addSelect(DB::raw('altv_code = null, altv_desc = null'));
                })
                ->fromSub(Lot::getLotInfoByCompany($user->company), 'l')
                ->where([
                    'l.IDlot' => $request->idLot,
                    'l.IDcompany' => $user->IDcompany
                ])
                ->first();

        abort_if($lotInfo->qty_stock <= 0, 403);

        DB::transaction(function() use ($user, $request){
            DB::statement('exec dbo.sp_order_production_add_component ?,?,?,?', [
                $user->IDcompany,
                $request->idLot,
                $request->idItem,
                $user->username
            ]);
        });
    }

    /**
     * @OA\PUT(
     *   tags={"orders-production"},
     *   path="/orders-production",
     *   summary="Update components row to order production",
     *    @OA\RequestBody(
     *     required=true,
     *      @OA\JsonContent(
     *       type="object",
     *       required={
     *          "components", "idLot"
     *       },
     *       @OA\Property(property="components", type="array"),
     *       @OA\Property(property="idLot", type="string"),
     *       example={
     *          "idLot": "FRNAA21001288", 
     *          "components": {
     *              "13374": {
     *                  "method": 0,
     *                  "qty":0,
     *                  "idStock" : 1315
     *              }
     *          }
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
    public function update(UpdateOrderProductionRequest $request)
    {
        $this->authorize('update', OrderProductionComponent::class);

        $user = auth()->user();

        DB::transaction(function() use ($user, $request){
            $ordProd = 
                OrderProduction::query()
                    ->where([
                        'IDcompany' => $user->IDcompany,
                        'IDlot' => $request->idLot
                    ])
                    ->firstOrFail();

            foreach($request->components as $idComp => $comp){
                $ordComp = 
                    OrderProductionComponent::query()
                        ->where('IDcomp', $idComp)
                        ->with('item')
                        ->first();

                if($ordComp->executed == 1){
                    continue;
                }

                $stock = Stock::select('IDlot', 'qty_stock')->where('IDstock', $comp['idStock'])->first();

                $ordComp->auto_lot = $comp['method'];
                $ordComp->IDStock = $comp['idStock'];
                $ordComp->qty = $ordComp->item->um != 'm2' ? $comp['qty'] : $stock->qty_stock;
                $ordComp->IDlot = $stock->IDlot ?? '';
                
                if(!$ordComp->save()){
                    return false;
                }
            }

            OrderProductionComponent::query()
                ->where([
                    'IDcompany' => $user->IDcompany,
                    'IDord' => $ordProd->IDord,
                    'auto_lot' => 1
                ])
                ->update([
                    'IDstock' => null,
                    'IDlot' => ''
                ]);
        });
    }

    /**
     * @OA\Delete(
     *   tags={"orders-production"},
     *   path="/orders-production/{id}",
     *   summary="Delete order production component",
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
    public function delete(OrderProductionComponent $component)
    {
        $this->authorize('delete', $component);

        abort_if($component->executed == 1, 403);

        $user = auth()->user();

        DB::transaction(function() use ($component, $user){
            $idOrd = $component->IDord;

            $component->delete();

            $Nrows = 
                OrderProductionComponent::where([
                    'IDcompany' => $user->IDcompany,
                    'IDord' => $idOrd
                ])
                ->count();

            if($Nrows == 0){
                OrderProduction::where([
                    'IDcompany' => $user->IDcompany,
                    'IDord' => $idOrd
                ])
                ->delete();
            }
        });
    }

    /**
     * @OA\POST(
     *   tags={"orders-production"},
     *   path="/orders-production/confirm",
     *   summary="Confirm order production",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idLot"
     *       },
     *       @OA\Property(property="idLot", type="string"),
     *       example={
     *          "idLot": "FRLYF20002773"
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
    public function confirm(ConfirmOrderProductionRequest $request)
    {  
        $this->authorize('confirm', OrderProductionComponent::class);

        $user = auth()->user();

        $lot = 
            DB::query()
                ->select('IDitem', 'IDwh')
                ->fromSub(Lot::getLotInfoByCompany($user->company), 'l')
                ->where([
                    'l.IDlot' => $request->idLot,
                    'l.IDcompany' => $user->IDcompany
                ])
                ->first();

        abort_if(!$lot, 404);

        $components = 
            DB::query()
                ->selectRaw('o.IDord, o.IDcompany, o.IDlot, r.IDstock, r.IDcomp, 
                r.IDitem, item, item_desc, qty_expected, i.um, auto_lot, r.qty, r.executed, u.frazionabile,  
                isnull((select sum(qty_stock) 
                from dbo.stock ss 
                inner join dbo.lot ll on ll.IDcompany = ss.IDcompany and ll.IDlot = ss.IDlot 
                where ss.IDcompany = o.IDcompany and ll.IDitem = r.IDitem and ss.IDwarehouse = ? ),0) as qtyOnStock,
                isnull((select sum(qty_stock) 
                from dbo.stock sss 		 
                where sss.IDcompany = o.IDcompany and sss.IDstock = r.IDStock),0) as qtyOnStockSpecLot,
                isnull((select count(IDStock) from ( 
                    select IDStock
                    from dbo.order_production_components 
                    where IDcompany = o.IDcompany and IDord = o.IDord and IDStock is not null  
                    group by IDStock
                    having COUNT(IDStock) > 1 ) x ),0) as checkDoubleLotSelection
                ', [
                    $lot->IDwh
                ])
                ->fromRaw('order_production o
                inner join dbo.order_production_components r on o.IDcompany = r.IDcompany and o.IDord = r.IDord  
                inner join dbo.item i on i.IDitem = r.IDitem  
                inner join dbo.um u on u.IDdim = i.um')
                ->where([
                    'o.IDcompany' => $user->IDcompany,
                    'o.IDlot' => $request->idLot
                ])
                ->get();

        foreach($components as $comp){
            abort_if($comp->auto_lot == 1 && $comp->qty == 0, 400, $comp->item." Automatic lot with 0 quantity.");
            abort_if($comp->auto_lot == 1 && $comp->qty > $comp->qtyOnStock, 400, $comp->item." Automatic lot, warehouse quantity not enough.");
            abort_if($comp->auto_lot == 0 && $comp->IDstock == 0, 400, $comp->item." Specific lot not selected.");
            abort_if($comp->auto_lot == 0 && $comp->qty == 0, 400, $comp->item." Specific lot selected with 0 quantity.");
            abort_if($comp->auto_lot == 0 && $comp->qty > $comp->qtyOnStockSpecLot && $comp->executed == 0, 400, $comp->item."  Specific lot selected with warehouse quantity not enough.");
        }

        DB::transaction(function() use ($request, $user){
            DB::statement('exec dbo.sp_order_production_confirm ?,?,?', [
                $user->IDcompany,
                $request->idLot,
                $user->username
            ]);
        });
    }
}
