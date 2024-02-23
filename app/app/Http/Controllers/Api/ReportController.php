<?php

namespace App\Http\Controllers\Api;

use App\Models\Lot;
use App\Models\Stock;
use App\Models\Company;
use App\Models\Item;
use App\Helpers\Utility;
use Carbon\CarbonPeriod;
use App\Pdf\PrintLabelsPdf;
use App\Models\CuttingOrder;
use Illuminate\Http\Request;
use App\Models\AdjustmentHistory;
use Illuminate\Support\Facades\DB;
use App\Models\InventoryLotHistory;
use App\Exports\ReportLotTrackingExport;
use App\Exports\ReportCuttingWasteExport;
use App\Exports\ReportLotShippedBPExport;
use App\Exports\ReportUnloadedItemExport;
use App\Exports\ReportCuttingActiveExport;
use App\Exports\ReportLotReceivedBPExport;
use App\Http\Controllers\Api\ApiController;
use App\DataTables\ReportStockLimitsDataTable;
use App\Http\Requests\ReportStockLimitRequest;
use App\Http\Requests\ReportUnloadItemRequest;
use App\DataTables\ReportCuttingWasteDataTable;
use App\DataTables\ReportInventoryLotDataTable;
use App\DataTables\ReportLotShippedBPDataTable;
use App\DataTables\ReportStockByWidthDataTable;
use App\DataTables\ReportUnloadedItemDataTable;
use App\Exports\ReportOpenPurchaseBiellaExport;
use App\Exports\ReportTransactionHisotryExport;
use App\Http\Requests\ReportLotTrackingRequest;
use App\DataTables\ReportLotReceivedBPDataTable;
use App\Http\Requests\ReportCuttingWasteRequest;
use App\Http\Requests\ReportInventoryLotRequest;
use App\Http\Requests\ReportLotShippedBPRequest;
use App\DataTables\ReportCuttingHistoryDataTable;
use App\Http\Requests\ReportLotReceivedBPRequest;
use App\Http\Requests\ReportCuttingHistoryRequest;
use App\DataTables\ReportStockValueByItemDataTable;
use App\DataTables\ReportStockValueOnDateDataTable;
use App\Exports\ReportAdjustmentInventoryLotExport;
use App\DataTables\ReportStockValueByGroupDataTable;
use App\Http\Requests\ReportGraphStockAtDateRequest;
use App\Http\Requests\ReportStockValueOnDateRequest;
use App\DataTables\ReportOpenPurchaseBiellaDataTable;
use App\DataTables\ReportStockOnDateDetailsDataTable;
use App\DataTables\ReportTransactionHistoryDataTable;
use App\Http\Requests\ReportTransactionHistoryRequest;
use App\DataTables\ReportAdjustmentInventoryLotDataTable;
use App\Exports\ReportStockLimitsExport;
use App\Http\Requests\ReportAdjustmentInventoryLotRequest;

class ReportController extends ApiController
{
    /**
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/cutting-history",
     *   summary="Get report of cutting history",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "dateFrom", "dateTo"
     *       },
     *       @OA\Property(property="dateFrom", type="date"),
     *       @OA\Property(property="dateTo", type="date"),
     *       example={
     *          "dateFrom": "2020-05-10",
     *          "dateTo": "2023-04-26",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */

    public function cuttingHistory(ReportCuttingHistoryRequest $request)
    {
        $this->authorize('cuttingHistory', 'report');

        $dateFrom = Utility::convertDateFromTimezone($request->dateFrom.' 00:00', auth()->user()->clientTimezoneDB, 'UTC', 'Y-m-d H:i');
        $dateTo = Utility::convertDateFromTimezone($request->dateTo.' 23:59', auth()->user()->clientTimezoneDB, 'UTC', 'Y-m-d H:i');

        $r = CuttingOrder::from(app(CuttingOrder::class)->getTable(), 'c')
            ->selectRaw("c.IDlot, item+' - '+item_desc as chio_code, substring(convert(varchar, date_executed, 20),1,16) AS data_exec, username")
            ->join('lot', function($join){
                $join->on('lot.IDcompany', '=', 'c.IDcompany');
                $join->on('lot.IDlot', '=', 'c.IDlot');
            })
            ->join('item', 'item.IDitem', '=', 'lot.IDitem')
            ->where([
                'executed' => 1,
                'c.IDcompany' => auth()->user()->IDcompany,
            ])
            ->whereBetween('date_executed', [$dateFrom, $dateTo]);

        return (new ReportCuttingHistoryDataTable($r))
            ->order(function($q){
                $q->orderBy('data_exec', 'DESC');
            })  
            ->toJson();        
    }

     /**
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/cutting-waste",
     *   summary="Get report of cutting waste",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "dateFrom", "dateTo"
     *       },
     *       @OA\Property(property="dateFrom", type="date"),
     *       @OA\Property(property="dateTo", type="date"),
     *       example={
     *          "dateFrom": "2020-05-10",
     *          "dateTo": "2023-04-26",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     * 
     *  @OA\Get(
     *   tags={"reports"},
     *   path="/reports/cutting-waste/export",
     *   summary="Export cutting waste XLSX",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "dateFrom", "dateTo"
     *       },
     *       @OA\Property(property="dateFrom", type="date"),
     *       @OA\Property(property="dateTo", type="date"),
     *       example={
     *          "dateFrom": "2020-05-10",
     *          "dateTo": "2023-04-26",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK"
     *   )
     * )
     */

    public function cuttingWaste(ReportCuttingWasteRequest $request, $export = false)
    {
        $this->authorize('cuttingWaste', 'report');

        $dateFrom = Utility::convertDateFromTimezone($request->dateFrom.' 00:00', auth()->user()->clientTimezoneDB, 'UTC', 'Y-m-d H:i');
        $dateTo = Utility::convertDateFromTimezone($request->dateTo.' 23:59', auth()->user()->clientTimezoneDB, 'UTC', 'Y-m-d H:i');

        $r = DB::query()
                ->selectRaw('IDcompany, IDlot, item, item_desc, substring(convert(varchar, date_executed, 20),1,16) AS data_exec, username, dad_qty_sr, sum(son_qty) as son_qty')
                ->fromRaw('(select h.IDcompany, h.IDlot, i.item, i.item_desc, substring(convert(varchar, date_executed, 20),1,16) as date_executed, username, dbo.getM2ByLotLALUPZ(h.IDcompany, h.IDlot) as dad_qty,
                case when l.stepRoll = 0 then
                    dbo.getM2ByLotLALUPZ(h.IDcompany, h.IDlot)
                    else
                    (select sum(dbo.getM2ByLotLALUPZ(lsr.IDcompany, lsr.IDlot))
                    from lot lsr where IDlot_padre = l.IDlot_padre and stepRoll = 1)
                    end as dad_qty_sr
                    , r.LA * r.LU * r.PZ / 1000000 as son_qty
                from  dbo.cutting_order h  
                inner join dbo.cutting_order_row r on h.IDcompany = r.IDcompany and h.IDlot = r.IDlot
                inner join dbo.lot l on l.IDcompany = h.IDcompany and l.IDlot = h.IDlot
                inner join dbo.item i on i.IDitem = l.IDitem
                where executed = 1) p')
                ->where('IDcompany', auth()->user()->IDcompany)
                ->whereBetween('date_executed', [$dateFrom, $dateTo])
                ->groupByRaw('IDcompany, IDlot,item,item_desc, date_executed, username ,dad_qty_sr');

        $d = (new ReportCuttingWasteDataTable($r))
                ->order(function($q){
                    $q->orderBy('date_executed', 'DESC');
                });
                
        if($export){
            return response(
                $d->exportAs('Xlsx', $request->query('paginating', false), ReportCuttingWasteExport::class),
                headers: [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'inline'
                ]
            );
        }
        
        return $d->toJson();
    }

     /**
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/cutting-active",
     *   summary="Get report of cutting active",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     * 
     * @OA\Get(
     *   tags={"reports"},
     *   path="/reports/cutting-active/export",
     *   summary="Export active cutting XLSX",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   )
     * )
     */

    public function cuttingActive($export = false)
    {
        $this->authorize('cuttingActive', 'report');

        $r = DB::query()
                ->selectRaw('IDlot, item, item_desc, qty_stock, um, ord_rif, note, qty_planned, cuts, substring(convert(varchar, date_creation, 20),1,16) as date_creation, substring(convert(varchar, date_planned, 20),1,16) as date_planned')
                ->fromRaw('(select s.IDlot, i.item, i.item_desc, s.qty_stock, i.um, 
                l.ord_rif, l.note,
                c.date_creation, c.date_planned,
                (select isnull(sum((LA*LU*PZ)/1000000),0) from cutting_order_row cr where cr.IDcompany = s.IDcompany and  cr.IDlot = s.IDlot) as qty_planned,
                (select count(cr1.IDlot) from cutting_order_row cr1 where cr1.IDcompany = s.IDcompany and  cr1.IDlot = s.IDlot) as cuts
                from stock s 
                inner join cutting_order c on s.IDlot = c.IDlot and s.IDcompany = c.IDcompany
                inner join lot l on l.IDcompany = s.IDcompany and s.IDlot = l.IDlot	
                inner join item i on i.IDitem = l.IDitem 
                where s.IDcompany = ?) p', [auth()->user()->IDcompany])
                ->orderBy('date_planned')
                ->get();

        if($export){
            return response(
                (new ReportCuttingActiveExport($r))->exportAs('Xlsx'),
                headers: [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'inline'
                ]
            );
        }

        return response()->json($r->toArray());
    }

     /**
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/lot-tracking",
     *   summary="Get report of lot tracking",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idLot"
     *       },
     *       @OA\Property(property="idLot", type="string"),
     *       example={
     *          "idLot": "FRPRF23000004",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     * 
     * @OA\Get(
     *   tags={"reports"},
     *   path="/reports/lot-tracking/export",
     *   summary="Export lot tracking XLSX",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idLot"
     *       },
     *       @OA\Property(property="idLot", type="string"),
     *       example={
     *          "idLot": "FRPRF23000004",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   )
     * )
     */

    public function lotTracking(ReportLotTrackingRequest $request, $export = false)
    {
        $this->authorize('lotTracking', 'report');

        $r = DB::query()
                ->selectRaw("substring(convert(varchar, date_tran, 20),1,16) AS data_exec, t.IDlot, 
                    w.[desc] wdesc, wl.[desc] wldesc, segno, t.qty, t.ord_rif, t.username, dbo.getDimByLot (t.IDcompany, l.IDlot) as dimensions , 
                    l.IDlot_origine, l.IDlot_padre, l.IDlot_fornitore, i.item, i.item_desc, tt.[desc] as ttdesc, 
                    bp.[desc] as bpdesc, i.um, 
                    (select COUNT(*) 
                    from dbo.order_production ord 
                    inner join dbo.order_production_components ordC on ord.IDord = ordC.IDord and ord.IDcompany = ordC.IDcompany 
                    where ord.IDlot = t.IDlot and ord.IDcompany = t.IDcompany
                    ) as NumComp, 
                    (select COUNT(*) 
                    from dbo.cutting_order_row cutR			
                    where cutR.IDlot = t.IDlot and cutR.IDcompany = t.IDcompany
                    ) as NumCut,
                    isnull(OrdPrd.IDlot,'') as  OrdPrdLot")
                ->fromRaw("transactions t inner join transactions_type tt on tt.IDtrantype = t.IDtrantype 
                    inner join lot l  on l.IDcompany = t.IDcompany and	t.IDlot = l.IDlot 
                    inner join item i on i.IDitem = l.IDitem 
                    left outer join bp on bp.IDcompany = t.IDcompany and bp.IDbp = t.IDbp 
                    left outer join order_production OrdPrd on OrdPrd.IDcompany = t.IDcompany and OrdPrd.IDord = t.IDprodOrd
                    inner join warehouse w on t.IDwarehouse = w.IDwarehouse and t.IDcompany = w.IDcompany 
                    inner join warehouse_location wl on t.IDlocation = wl.IDlocation and t.IDcompany = wl.IDcompany 
                    where t.IDcompany = ? and t.IDlot in  
                    (select IDlot from dbo.lot l1 where l1.IDcompany = t.IDcompany and l1.IDlot_origine in 
                    (select case when IDlot_origine = '' then NULL else IDlot_origine end from dbo.lot l2 where l2.IDcompany = t.IDcompany and l2.IDlot = ? ) 
                    /* la union sotto è nel caso inseriscano il lotto di biella */ union
                    (select IDlot from dbo.lot l1 where l1.IDcompany = t.IDcompany and l1.IDlot_origine in 
                    (select case when IDlot_origine = '' then NULL else IDlot_origine end from dbo.lot l2 where l2.IDcompany = t.IDcompany and l2.IDlot_fornitore = ? )))", [auth()->user()->IDcompany, $request->idLot, $request->idLot])
                ->get();

        if($export){
            return response(
                (new ReportLotTrackingExport($r))->exportAs('Xlsx'),
                headers: [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'inline'
                ]
            );
        }

        return response()->json($r->toArray());
    }

     /**
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/stock-by-width",
     *   summary="Get report of stock by width",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */

    public function stockByWidth()
    {
        $this->authorize('stockByWidth', 'report');

        $r = DB::query()
                ->selectRaw("w.[desc] as wdesc, wl.[desc] as wldesc, i.item, i.item_desc, ld.val as larghezza, sum(qty_stock) as m2")
                ->fromRaw("dbo.stock s
                inner join dbo.lot l on l.IDcompany = s.IDcompany and s.IDlot = l.IDlot
                inner join dbo.item i on i.IDitem = l.IDitem
                inner join dbo.lot_dimension ld on s.IDcompany = ld.IDcompany and s.IDlot = ld.IDlot and ld.IDcar = 'LA'
                inner join dbo.warehouse w on w.IDcompany = s.IDcompany and w.IDwarehouse = s.IDwarehouse
                inner join dbo.warehouse_location wl on wl.IDcompany = s.IDcompany and wl.IDlocation = s.IDlocation
                where s.IDcompany = ? and i.um	= 'm2' 
                group by  s.IDcompany , w.[desc], wl.[desc], i.IDitem, i.item, i.item_desc, ld.val", [auth()->user()->IDcompany]);
 
        return (new ReportStockByWidthDataTable($r))
                ->order(function($q){
                    $q->orderBy('larghezza');
                })     
                ->toJson();
    }

    /**
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/transaction-history",
     *   summary="Get report of transaction history",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "dateFrom", "dateTo"
     *       },
     *       @OA\Property(property="dateFrom", type="date"),
     *       @OA\Property(property="dateTo", type="date"),
     *       @OA\Property(property="idTranType", type="int|empty"),
     *       @OA\Property(property="item", type="string|empty"),
     *       example={
     *          "dateFrom": "2020-05-10",
     *          "dateTo": "2023-04-26",
     *          "idTranType" : 2,
     *          "item" : "na30"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     * 
     * @OA\Get(
     *   tags={"reports"},
     *   path="/reports/transaction-history/export",
     *   summary="Export transaction history XLSX",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "dateFrom", "dateTo"
     *       },
     *       @OA\Property(property="dateFrom", type="date"),
     *       @OA\Property(property="dateTo", type="date"),
     *       @OA\Property(property="idTranType", type="int|empty"),
     *       @OA\Property(property="item", type="string|empty"),
     *       example={
     *          "dateFrom": "2020-05-10",
     *          "dateTo": "2023-04-26",
     *          "idTranType" : 2,
     *          "item" : "na30"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   )
     * )
     */

    public function transactionHistory(ReportTransactionHistoryRequest $request, $export = false)
    {
        $this->authorize('transactionHistory', 'report');

        $bind = [
            auth()->user()->IDcompany, 
            Utility::convertDateFromTimezone($request->dateFrom.'00:00', auth()->user()->clientTimezoneDB, 'UTC', 'Y-m-d H:i'),  
            Utility::convertDateFromTimezone($request->dateTo.'23:59', auth()->user()->clientTimezoneDB, 'UTC', 'Y-m-d H:i')
        ];
        
        if($request->idTranType){
            array_push($bind, $request->idTranType);
        }
        if($request->item){
            array_push($bind, $request->item);
        }

        $r = DB::query()
            ->selectRaw("substring(convert(varchar, data_exec, 20),1,16) AS data_exec, IDlot ,item ,item_desc, whdesc, whldesc, segno, qty, um, trdesc, ord_rif, username, bpdesc, dimensions, note, NumComp, la,lu,pz, eur1, OrdPrdLot ")
            ->fromRaw("(select substring(convert(varchar, date_tran, 20),1,16) AS data_exec, t.IDlot ,i.item 
            ,i.item_desc, w.[desc] as whdesc, wl.[desc] as whldesc, segno, t.qty, i.um
            ,tt.[desc] as trdesc, t.ord_rif, t.username, bp.[desc] as bpdesc, dbo.getDimByLot (t.IDcompany, t.IDlot) as dimensions ,l.note,
                        (select COUNT(*) 
                        from dbo.order_production ord 
                        inner join dbo.order_production_components ordC on ord.IDord = ordC.IDord and ord.IDcompany = ordC.IDcompany 
                        where ord.IDlot = t.IDlot and ord.IDcompany = t.IDcompany
                        ) as NumComp,
                        d1.val as la, d2.val as lu, d3.val as pz	
                        ,case when l.eur1 = 0 then 'No' else 'Yes' end as eur1  
                        ,isnull(OrdPrd.IDlot,'') as  OrdPrdLot
            from dbo.transactions t 
            inner join dbo.transactions_type tt on tt.IDtrantype = t.IDtrantype
            inner join dbo.lot l on t.IDcompany = l.IDcompany and t.IDlot = l.IDlot
            
            left outer join lot_dimension d1 on d1.IDlot = l.IDlot and d1.IDcompany = l.IDcompany and d1.IDcar = 'LA'
            left outer join lot_dimension d2 on d2.IDlot = l.IDlot and d2.IDcompany = l.IDcompany and d2.IDcar = 'LU'
            left outer join lot_dimension d3 on d3.IDlot = l.IDlot and d3.IDcompany = l.IDcompany and d3.IDcar = 'PZ'
            inner join dbo.item i on i.IDitem = l.IDitem 
            inner join dbo.warehouse w on w.IDcompany = t.IDcompany and t.IDwarehouse = w.IDwarehouse 
            inner join dbo.warehouse_location wl on wl.IDcompany = t.IDcompany and t.IDlocation = wl.IDlocation 	
                    	
            left outer join dbo.bp bp on bp.IDcompany = t.IDcompany and bp.IDbp = t.IDbp 
                    
            left outer join order_production OrdPrd on OrdPrd.IDcompany = t.IDcompany and OrdPrd.IDord = t.IDprodOrd
            where t.IDcompany = ? and date_tran between ? and ? ".($request->idTranType ? " and t.IDtrantype = ?" : '').($request->item ? " and i.item = ?" : '').") p", $bind);

        $d = (new ReportTransactionHistoryDataTable($r))
            ->order(function($q){
                $q->orderBy('data_exec');
            });
            
        if($export){
            return response(
                $d->exportAs('Xlsx', $request->query('paginating', false), ReportTransactionHisotryExport::class),
                headers: [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'inline'
                ]
            );
        }
        
        return $d->toJson();
    }

     /**
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/unloaded-item",
     *   summary="Get report of unloaded item",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "dateFrom", "dateTo"
     *       },
     *       @OA\Property(property="dateFrom", type="date"),
     *       @OA\Property(property="dateTo", type="date"),
     *       example={
     *          "dateFrom": "2020-05-10",
     *          "dateTo": "2023-04-26",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     * 
     *  @OA\Get(
     *   tags={"reports"},
     *   path="/reports/unloaded-item/export",
     *   summary="Export unloaded item XLSX",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "dateFrom", "dateTo"
     *       },
     *       @OA\Property(property="dateFrom", type="date"),
     *       @OA\Property(property="dateTo", type="date"),
     *       example={
     *          "dateFrom": "2020-05-10",
     *          "dateTo": "2023-04-26",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   )
     * )
     */

    public function unloadedItem(ReportUnloadItemRequest $request, $export = false)
    {
        $this->authorize('unloadedItem', 'report');

        $dateFrom = Utility::convertDateFromTimezone($request->dateFrom.' 00:00', auth()->user()->clientTimezoneDB, 'UTC', 'Y-m-d H:i');
        $dateTo = Utility::convertDateFromTimezone($request->dateTo.' 23:59', auth()->user()->clientTimezoneDB, 'UTC', 'Y-m-d H:i');

        $r = DB::query()
                ->selectRaw("tt.[desc] as ttdesc, item, item_desc, um, SUM(qty) as qtyUnload")
                ->fromRaw("dbo.transactions t
                inner join dbo.transactions_type tt on tt.IDtrantype = t.IDtrantype
                inner join dbo.lot l  on l.IDcompany = t.IDcompany and l.IDlot = t.IDlot
                inner join dbo.item i on i.IDitem = l.IDitem
                where segno = '-' and t.IDcompany = ? and date_tran between ? and ?
                group by tt.[desc], item, item_desc, um", [auth()->user()->IDcompany, $dateFrom, $dateTo]);

        $d = (new ReportUnloadedItemDataTable($r))
                ->order(function($q){
                    $q->orderBy('ttdesc');
                });
                
        if($export){
            return response(
                $d->exportAs('Xlsx', $request->query('paginating', false), ReportUnloadedItemExport::class),
                headers: [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'inline'
                ]
            );
        }
                
        return $d->toJson();
    }

     /**
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/lot-shipped-bp",
     *   summary="Get report of lots shipped to BP",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "dateFrom", "dateTo", "idBP"
     *       },
     *       @OA\Property(property="dateFrom", type="date"),
     *       @OA\Property(property="dateTo", type="date"),
     *       @OA\Property(property="idBP", type="int"),
     *       example={
     *          "dateFrom": "2020-05-10",
     *          "dateTo": "2023-04-26",
     *          "idBP" : 4685
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     * 
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/lot-shipped-bp/export",
     *   summary="Export report of lots shipped to BP",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "dateFrom", "dateTo", "idBP"
     *       },
     *       @OA\Property(property="dateFrom", type="date"),
     *       @OA\Property(property="dateTo", type="date"),
     *       @OA\Property(property="idBP", type="int"),
     *       example={
     *          "dateFrom": "2020-05-10",
     *          "dateTo": "2023-04-26",
     *          "idBP" : 4685
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */

    public function lotShippedBP(ReportLotShippedBPRequest $request, $export = false)
    {
        $this->authorize('lotShippedBP', 'report');

        $dateFrom = Utility::convertDateFromTimezone($request->dateFrom.' 00:00', auth()->user()->clientTimezoneDB, 'UTC', 'Y-m-d H:i');
        $dateTo = Utility::convertDateFromTimezone($request->dateTo.' 23:59', auth()->user()->clientTimezoneDB, 'UTC', 'Y-m-d H:i');

        $r = DB::query()
        ->selectRaw("date_ship as dateShip, s.[IDlot] as idLot , i.item 
        ,i.item_desc as itemDesc, [qty], i.um, dbo.getDimByLot (s.IDcompany, s.IDlot) as dimensions, l.ord_rif as ordRif	 
        ,l.note, bpd.[desc] as bpdDesc,
                    (select COUNT(*) 
                    from dbo.order_production ord 
                    inner join dbo.order_production_components ordC on ord.IDord = ordC.IDord and ord.IDcompany = ordC.IDcompany 
                    where ord.IDlot = s.IDlot and ord.IDcompany = s.IDcompany
                    ) as NumComp 
                    ,case when l.eur1 = 0 then 0 else 1 end as eur1")
        ->fromRaw("dbo.shipments s  
        inner join dbo.lot l on l.IDcompany = s.IDcompany and s.IDlot = l.IDlot 
        inner join dbo.item i on i.IDitem = l.IDitem 
        inner join dbo.bp b on b.IDcompany = s.IDcompany and b.IDbp = s.IDbp 
        left outer join bp_destinations bpd on bpd.IDdestination = s.IDdestination 
        where s.IDcompany = ? and s.IDbp = ? and date_ship between ? and ?", [auth()->user()->IDcompany , $request->idBP, $dateFrom, $dateTo]);

        $d = (new ReportLotShippedBPDataTable($r));

        if($export){
            return response(
                $d->exportAs('Xlsx', $request->query('paginating', false), ReportLotShippedBPExport::class),
                headers: [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'inline'
                ]
            );
        }
                
        return $d->toJson();
    }

    /**
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/lot-received-bp",
     *   summary="Get report of lots received from BP",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "dateFrom", "dateTo", "idBP"
     *       },
     *       @OA\Property(property="dateFrom", type="date"),
     *       @OA\Property(property="dateTo", type="date"),
     *       @OA\Property(property="idBP", type="int"),
     *       example={
     *          "dateFrom": "2020-05-10",
     *          "dateTo": "2023-04-26",
     *          "idBP" : 4685
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     * 
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/lot-received-bp/export",
     *   summary="Export report of lots received from BP",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "dateFrom", "dateTo", "idBP"
     *       },
     *       @OA\Property(property="dateFrom", type="date"),
     *       @OA\Property(property="dateTo", type="date"),
     *       @OA\Property(property="idBP", type="int"),
     *       example={
     *          "dateFrom": "2020-05-10",
     *          "dateTo": "2023-04-26",
     *          "idBP" : 4685
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */

    public function lotReceivedBP(ReportLotReceivedBPRequest $request, $export = false)
    {
        $this->authorize('lotReceivedBP', 'report');

        $dateFrom = Utility::convertDateFromTimezone($request->dateFrom.' 00:00', auth()->user()->clientTimezoneDB, 'UTC', 'Y-m-d H:i');
        $dateTo = Utility::convertDateFromTimezone($request->dateTo.' 23:59', auth()->user()->clientTimezoneDB, 'UTC', 'Y-m-d H:i');

        $r = DB::query()
        ->selectRaw("date_tran as dateTran, t.IDlot, i.item 
        ,i.item_desc as itemDesc, [qty], i.um, l.ord_rif as ordRif	 
        ,l.note, 
                    (select COUNT(*) 
                    from dbo.order_production ord 
                    inner join dbo.order_production_components ordC on ord.IDord = ordC.IDord and ord.IDcompany = ordC.IDcompany 
                    where ord.IDlot = t.IDlot and ord.IDcompany = t.IDcompany
                    ) as numComp 
                    ,case when l.eur1 = 0 then 0 else 1 end as eur1, d.LA, d.LU, d.PZ, d.DE, d.DI")
        ->fromRaw("transactions t
        inner join dbo.lot l on l.IDcompany = t.IDcompany and t.IDlot = l.IDlot 
        inner join dbo.item i on i.IDitem = l.IDitem 
        inner join dbo.bp b on b.IDcompany = t.IDcompany and b.IDbp = t.IDbp
        inner join dbo.vw_lotDimensionsPivot d on d.IDcompany = t.IDcompany and d.IDlot = t.IDlot
        where t.IDcompany = ? and t.IDbp = ? and date_tran between ? and ? and t.IDtrantype = 1", [auth()->user()->IDcompany , $request->idBP, $dateFrom, $dateTo]);

        $d = (new ReportLotReceivedBPDataTable($r));

        if($export){
            return response(
                $d->exportAs('Xlsx', $request->query('paginating', false), ReportLotReceivedBPExport::class),
                headers: [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'inline'
                ]
            );
        }
                
        return $d->toJson();
    }

    /**
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/activity-viewer",
     *   summary="Get report of activity ",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */

     //Ordini di produzione (consumo di componenti)
     //Commesse di taglio 
     //Materiali in trasferimento
     //Materiali in spedizione 
    public function activityViewer()
    {
        $this->authorize('activityViewer', 'report');

        $r = DB::query()
        ->selectRaw("activity, wdesc, substring(convert(varchar, dt, 20),1,16) as dt, item, item_desc, IDlot, dim, ord_rif, note, username, msg")
        ->from(function($q){
            $q->selectRaw("'Production order' as activity, w.[desc] as wdesc,substring(convert(varchar, ord.date_creation, 20),1,16) as dt, i.item, i.item_desc, ord.IDlot, dbo.getDimByLotShortDesc(ord.IDcompany, ord.IDlot) as dim, l.ord_rif, l.note, ord.username,
            ic.item + ' ' + ic.item_desc + ': '  + cast(ordC.qty as nvarchar(max)) + ' ' + ic.um as msg")
            ->fromRaw("dbo.order_production ord 
            inner join dbo.lot l on l.IDcompany = ord.IDcompany and ord.IDlot = l.IDlot
            inner join dbo.item i on i.IDitem = l.IDitem
            inner join dbo.order_production_components ordC on ord.IDord = ordC.IDord and ord.IDcompany = ordC.IDcompany 
            inner join dbo.item ic on ic.IDitem = ordC.IDitem
            inner join dbo.warehouse w on w.IDcompany = ord.IDcompany and w.IDwarehouse = ord.IDwarehouse
            where ord.IDcompany = ? and ord.executed = 0", [auth()->user()->IDcompany])
            ->union(function($q){
                $q->selectRaw("'Cutting order' as activity, w.[desc] as wdesc, substring(convert(varchar, o.date_creation, 20),1,16) as dt, i.item, i.item_desc, o.IDlot, dbo.getDimByLotShortDesc(o.IDcompany, o.IDlot) as dim, l.ord_rif, l.note, o.username, 
                cast(r.LA as nvarchar(max)) + ' x ' + cast(r.LU as nvarchar(max))  + ' x ' + cast(r.PZ as nvarchar(max)) + ': ' + r.ord_rif as msg")
                ->fromRaw("dbo.cutting_order o
                inner join dbo.lot l on l.IDcompany = o.IDcompany and l.IDlot = o.IDlot
                inner join dbo.item i on i.IDitem = l.IDitem
                inner join dbo.cutting_order_row r on r.IDcompany = o.IDcompany and o.IDlot = r.IDlot
                inner join dbo.stock s on s.IDcompany = o.IDcompany and o.IDlot = s.IDlot
                inner join dbo.warehouse w on w.IDcompany = o.IDcompany and w.IDwarehouse = s.IDwarehouse
                where o.IDcompany = ? and o.date_executed is null
                and o.IDlot in (select IDlot from stock s where s.IDcompany = o.IDcompany and s.IDlot = o.IDlot)", [auth()->user()->IDcompany]);
            })
            ->union(function($q){
                $q->selectRaw("'Transfer' as activity, w.[desc] as wdesc, substring(convert(varchar, t.date_ins, 20),1,16) as dt, i.item, i.item_desc, s.IDlot, dbo.getDimByLotShortDesc(s.IDcompany, s.IDlot) as dim, l.ord_rif, l.note, t.username 
                , (w.[desc] + ' - ' + wl.[desc]) as msg")
                ->fromRaw("dbo.material_transfer_temp t
                left outer join dbo.stock s on s.IDcompany = t.IDcompany and t.IDStock = s.IDstock
                left outer join dbo.warehouse w on t.IDcompany = w.IDcompany and w.IDwarehouse = s.IDwarehouse
                left outer join dbo.warehouse_location wl on t.IDcompany = wl.IDcompany and wl.IDlocation = s.IDlocation
                left outer join dbo.lot l on t.IDcompany = l.IDcompany and s.IDlot = l.IDlot
                left outer join dbo.item i on i.IDitem = l.IDitem
                where t.IDcompany = ?", [auth()->user()->IDcompany]);
            })
            ->union(function($q){
                $q->selectRaw("'Shipment' as activity, w.[desc] as wdesc, substring(convert(varchar, t.date_ins, 20),1,16) as dt, i.item, i.item_desc, s.IDlot, dbo.getDimByLotShortDesc(s.IDcompany, s.IDlot) as dim, l.ord_rif, l.note, t.username 
                , (w.[desc] + ' - ' + wl.[desc]) as msg")
                ->fromRaw("dbo.material_issue_temp t
                left outer join dbo.stock s on s.IDcompany = t.IDcompany and t.IDStock = s.IDstock
                left outer join dbo.warehouse w on t.IDcompany = w.IDcompany and w.IDwarehouse = s.IDwarehouse
                left outer join dbo.warehouse_location wl on t.IDcompany = wl.IDcompany and wl.IDlocation = s.IDlocation
                left outer join dbo.lot l on t.IDcompany = l.IDcompany and s.IDlot = l.IDlot
                left outer join dbo.item i on i.IDitem = l.IDitem
                where t.IDcompany = ?", [auth()->user()->IDcompany]);
            });
        }, 'p')
        ->orderBy('wdesc')
        ->get();
            
        return response()->json($r->toArray());
    }

    /**
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/stock-limits",
     *   summary="Get report of stock limits",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idWarehouse"
     *       },
     *       @OA\Property(property="idWarehouse", type="int|empty"),
     *       example={
     *          "idWarehouse" : 1
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     * 
     *  @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/stock-limits/export",
     *   summary="Export stock limits XLSX",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */

    public function stockLimits(ReportStockLimitRequest $request, $export = false)
    {
        $this->authorize('stockLimits', 'report');

        $bind = [auth()->user()->IDcompany];

        if($request->idWarehouse){
            array_push($bind, $request->idWarehouse);
        }

        array_push($bind, auth()->user()->IDcompany);

        if($request->idWarehouse){
            array_push($bind, $request->idWarehouse);
        }

        $r = DB::query()
            ->selectRaw("il.IDwarehouse as idWarehouse, il.wdesc, il.IDitem as idItem, il.item, il.item_desc as itemDesc, il.um, il.qty_min as qtyMin, il.qty_max as qtyMax, isnull(qty_stock_wh,0) as qtyStockWh,
            (select SUM(ss.qty_stock)
            from stock ss 
            inner join lot ll on ss.IDcompany = ll.IDcompany and ss.IDlot = ll.IDlot
            where ss.IDcompany = ? and ll.IDitem = il.IDitem) as qtyStock", [auth()->user()->IDcompany])
            ->fromRaw("(select i.IDitemStockLimits, i.IDcompany, i.IDitem, i.IDwarehouse, i.qty_min, i.qty_max, i.username, 
            substring(convert(varchar, i.date_ins, 20),1,20) as date_ins 
            ,ii.item, ii.item_desc, ii.um,  w.[desc] as wdesc
            from item_stock_limits i
            inner join item ii on ii.IDitem = i.IDitem
            inner join warehouse w on w.IDcompany = i.IDcompany and w.IDwarehouse = i.IDwarehouse
            where i.IDitemStockLimits in 
            (
            select MAX(ismm.IDitemStockLimits) lastRecord
            from item_stock_limits ismm
            group by ismm.IDcompany, ismm.IDitem, ismm.IDwarehouse)) il left outer join
                (
                select stock.IDcompany, stock.IDwarehouse, wh.[desc] as wdesc, lot.IDitem , SUM(stock.qty_stock) as qty_stock_wh
                from dbo.stock 
                inner join lot on lot.IDcompany = stock.IDcompany and lot.IDlot = stock.IDlot 
                inner join warehouse wh on wh.IDcompany = stock.IDcompany and stock.IDwarehouse = wh.IDwarehouse 	
                where stock.IDcompany = ? ".($request->idWarehouse ? " and stock.IDwarehouse = ?" : '')." 
                group by stock.IDcompany, stock.IDwarehouse, wh.[desc], lot.IDitem 
                ) stock_group_by_item_wh
                on il.IDcompany = stock_group_by_item_wh.IDcompany and 
                il.IDitem = stock_group_by_item_wh.IDitem and 
                il.IDwarehouse = stock_group_by_item_wh.IDwarehouse
                where il.IDcompany = ?
                ".($request->idWarehouse ? " and il.IDwarehouse = ?" : '')." 
                and isnull(qty_stock_wh,0) < il.qty_min or  isnull(qty_stock_wh,0) > il.qty_max", $bind);

        $d = (new ReportStockLimitsDataTable($r));

        if($export){
            return response(
                $d->exportAs('Xlsx', $request->query('paginating', false), ReportStockLimitsExport::class),
                headers: [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'inline'
                ]
            );
        }
                
        return $d->toJson();
    }

    /**
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/open-purchase-biella",
     *   summary="Get report of open purchase Biella",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     * 
     *  @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/open-purchase-biella/export",
     *   summary="Export open purchase Biella XLSX",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */

    public function openPurchaseBiella(Request $request, $export = false)
    {
        $this->authorize('openPurchaseBiella', 'report');

        $lastUpdated = DB::query()
                ->select("record_date")
                ->from("zETL_LN_sales_order_open")
                ->take(1)
                ->first();

        $r = DB::query()
        ->selectRaw("t_orno, t_pono, item_std, cfg, UM_LN, UM_CSM, t_qoor, LA, LU, PZ, DE, DI, planned_date, ord_bp_row, substring(convert(varchar, record_date, 20),1,16) as record_date, substring(convert(varchar, t_prdt_c, 20),1,16) as t_prdt_c, boxed_qty_UM_LN, shipping_qty_UM_LN, delivered_qty_UM_LN, leftovery_UM_LN, shipping_qty_UM_CSM, boxed_qty_UM_CSM, delivered_qty_UM_CSM, leftovery_UM_CSM")
        ->fromSub(function($q){
            $q->selectRaw("IDcompany,[t_orno]     
                ,[t_pono]	  
                ,[item_std]
                ,case when [cfg] = 0 then 0 else 1 end as cfg
                ,[UM_CSM]
                ,[UM_LN]
                ,[t_qoor]
                ,[LA]
                ,[LU]
                ,[PZ]
                ,[DE]
                ,[DI]
                ,[boxed_qty_UM_LN]
                ,[shipping_qty_UM_LN]
                ,[delivered_qty_UM_LN]
                ,[leftovery_UM_LN]	
                ,case 
                when UM_LN = UM_CSM then [shipping_qty_UM_LN]
                when UM_LN = 'NUM'  and UM_CSM = 'N'  then [shipping_qty_UM_LN] 
                when UM_LN = 'N'  and UM_CSM = 'm2'  then [shipping_qty_UM_LN]*LA*LU/1000000 --Configurati
                when UM_LN = 'm'  and UM_CSM = 'm'   then [shipping_qty_UM_LN]				--Configurati
                end [shipping_qty_UM_CSM]
                ,case 
                when UM_LN = UM_CSM then [boxed_qty_UM_LN]
                when UM_LN = 'NUM'  and UM_CSM = 'N'  then [boxed_qty_UM_LN] 
                when UM_LN = 'N'  and UM_CSM = 'm2'  then [boxed_qty_UM_LN]*LA*LU/1000000 --Configurati
                when UM_LN = 'm'  and UM_CSM = 'm'   then [boxed_qty_UM_LN]				 --Configurati
                end [boxed_qty_UM_CSM]
                ,case 
                when UM_LN = UM_CSM then [delivered_qty_UM_LN]
                when UM_LN = 'NUM'  and UM_CSM = 'N'  then [delivered_qty_UM_LN]
                when UM_LN = 'N'  and UM_CSM = 'm2'  then [delivered_qty_UM_LN]*LA*LU/1000000 --Configurati
                when UM_LN = 'm'  and UM_CSM = 'm'   then [delivered_qty_UM_LN]				 --Configurati
                end [delivered_qty_UM_CSM]  
                ,case 
                when UM_LN = UM_CSM then [leftovery_UM_LN]
                when UM_LN = 'NUM'  and UM_CSM = 'N'  then [leftovery_UM_LN]
                when UM_LN = 'N'  and UM_CSM = 'm2'  then [leftovery_UM_LN]*LA*LU/1000000 --Configurati
                when UM_LN = 'm'  and UM_CSM = 'm'   then [leftovery_UM_LN]				 --Configurati
                end as leftovery_UM_CSM
                ,[ord_bp_row]
                ,[t_prdt_c]
                ,[t_ddta] as planned_date
                ,[record_date]")
            ->fromRaw('[dbo].[zETL_LN_sales_order_open]')
            ->where('IDcompany', auth()->user()->IDcompany);
        }, 'tmp');

        $d = (new ReportOpenPurchaseBiellaDataTable($r))
                ->editColumn('salesOrder', function($el){
                    return $el->t_orno."-".$el->t_pono;
                })
                ->filterColumn('salesOrder', function($q, $k){                    
                    if(str_contains($k, '-')){
                        list($tOrno, $tPono) = explode('-', $k);
                        $q->where('t_orno', $tOrno)->where('t_pono', $tPono);
                    }else{
                        $q->where('t_orno', 'LIKE', "%$k%");
                    }
                })
                ->with([
                    "lastUpdate" => $lastUpdated ? $lastUpdated->record_date : null
                ])
                ->order(function($q){
                    $q->orderBy('t_prdt_c', 'DESC');
                });
                
        if($export){
            return response(
                $d->exportAs('Xlsx', $request->query('paginating', false), ReportOpenPurchaseBiellaExport::class),
                headers: [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'inline'
                ]
            );
        }
                
        return $d->toJson();
    }

    /**
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/graph-stock-at-date",
     *   summary="Get stock limits dates and quantities to generate graph",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "dateFrom", "dateTo", "idItem"
     *       },
     *       @OA\Property(property="dateFrom", type="date"),
     *       @OA\Property(property="dateTo", type="date"),
     *       @OA\Property(property="idItem", type="int"),
     *       example={
     *          "dateFrom" : "2023-01-01",
     *          "dateTo" : "2023-05-03",
     *          "idItem" : 3042
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */

    public function graphStockAtDate(ReportGraphStockAtDateRequest $request)
    {
        $this->authorize('graphStockAtDate', 'report');

        $dateRange = CarbonPeriod::create(
            Utility::convertDateFromTimezone($request->dateFrom.'00:00', auth()->user()->clientTimezoneDB, 'UTC', 'Y-m-d H:i'),  
            Utility::convertDateFromTimezone($request->dateTo.'23:59', auth()->user()->clientTimezoneDB, 'UTC', 'Y-m-d H:i')
        );

        $stocks = [];

        $item = Item::find($request->idItem);

        $res = [
            'item' => $item
        ];

        foreach($dateRange as $date){
            $d = $date->format('Y-m-d');

            $q = Stock::getStockValueAtDate($d, auth()->user()->IDcompany)
                ->where('i.IDitem', $request->idItem);
            
            $r = DB::query()
                ->selectRaw('qty_stock_stock AS qty')->fromSub($q, 'tmp')
                ->first();

            if($r){
                $stocks[] = [
                    'date' => $date,
                    'qty' => $r->qty ?? 0
                ];
            }
        }

        $res['stockLimits'] = $stocks;

        $r = DB::query()
            ->selectRaw("sum(qty_min) as qty_min, sum(qty_max) as qty_max")
            ->fromSub(function($q){
                $q->selectRaw("i.IDitemStockLimits, i.IDcompany, i.IDitem, i.IDwarehouse, i.qty_min, i.qty_max, i.username, 
                substring(convert(varchar, i.date_ins, 20),1,20) as date_ins 
                ,ii.item, ii.item_desc, ii.um,  w.[desc] as wdesc
                from item_stock_limits i
                inner join item ii on ii.IDitem = i.IDitem
                inner join warehouse w on w.IDcompany = i.IDcompany and w.IDwarehouse = i.IDwarehouse
                where i.IDitemStockLimits in 
                ( /* Ultimo record caricato base company-articolo-magazzino */
                select MAX(ismm.IDitemStockLimits) lastRecord
                from item_stock_limits ismm
                group by ismm.IDcompany, ismm.IDitem, ismm.IDwarehouse)");
            }, 'xx')
            ->where('IDcompany', auth()->user()->IDcompany)
            ->where('IDitem', $request->idItem)
            ->first();
                
        $res['minMaxStockLimits'] = $r;
        
        return response()->json($res);
    }

    /**
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/stock-value-by-group",
     *   summary="Get report of stock value by group",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     * 
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/stock-value-by-group/export",
     *   summary="Get report of stock value by group XLSX",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
    */

    public function stockValueByGroup(Request $request, $export = false)
    {
        $this->authorize('reportStockValue', 'report');
 
        $query = DB::query()
            ->selectRaw("
                um, 
                i.item_group, 
                sum(qty_stock) as qty, 
                sum((qty_stock * (case when checked_value = 0 then 0 else v.UnitValue end))) as tval,
                curr,
                IIF(ig.item_group IS NULL, 1, 0) as ChiorinoItem,
                l.conf_item
            ")
            ->fromRaw("
                dbo.stock s   
                inner join dbo.vw_lot_last_value v on v.IDcompany = s.IDcompany and v.IDlot = s.IDlot  
                inner join dbo.lot l on s.IDcompany = l.IDcompany and l.IDlot = s.IDlot  
                inner join dbo.item i on i.IDitem = l.IDitem  
                inner join dbo.warehouse wh on wh.IDcompany = s.IDcompany and s.IDwarehouse = wh.IDwarehouse 
                inner join dbo.warehouse_location wh_lc on wh_lc.IDcompany = s.IDcompany and s.IDlocation = wh_lc.IDlocation
                inner join dbo.company c on s.IDcompany = c.IDcompany
                left outer join dbo.item_group ig on ig.item_group = i.item_group and ig.IDcompany = s.IDcompany
            ")
            ->where('s.IDcompany', auth()->user()->IDcompany)
            ->groupBy(['um', 'i.item_group', 'curr', DB::raw('IIF(ig.item_group IS NULL, 1, 0)'), 'l.conf_item']);

        $q = DB::query()
            ->fromSub($query, 't');

        $d = (new ReportStockValueByGroupDataTable($q))
            ->with('numberOfLotWithUncheckedValue', Stock::getNumberOfLotWithUncheckedValue(auth()->user()->IDcompany));  

        if(!$request->has('order')) {
            $d->order(function($q){
                $q->orderBy('item_group', 'ASC');
            });
        }

        if($export){
            return response(
                $d->exportAs('Xlsx', $request->query('paginating', false)),
                headers: [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'inline'
                ]
            );
        }
        else {
            $sum = DB::query()
                ->selectRaw('SUM(tval) AS sum, SUM(IIF(ChiorinoItem = 1, tval, 0)) AS sum_chiorino, SUM(IIF(ChiorinoItem = 1, 0, tval)) AS sum_not_chiorino')
                ->fromSub($query, 't')
                ->first();

            $lots_no_value = Lot::numberOfLotWithUncheckedValue(auth()->user()->IDcompany);

            $d
                ->with('sum', $sum->sum)
                ->with('sum_chiorino', $sum->sum_chiorino)
                ->with('sum_not_chiorino', $sum->sum_not_chiorino)
                ->with('lots_no_value', $lots_no_value)
                ->with('currency', Company::find(auth()->user()->IDcompany)->curr);
        }

        return $d->toJson();        
     }


    /**
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/stock-value-by-item",
     *   summary="Get report of stock value by item",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     * 
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/stock-value-by-item/export",
     *   summary="Get report of stock value by item XLSX",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function stockValueByItem(Request $request, $export = false)
    {
        $this->authorize('reportStockValue', 'report');

        $query = DB::query()
            ->selectRaw("
            item,
            item_desc,
                um, 
                i.item_group, 
                sum(qty_stock) as qty, 
                sum((qty_stock * (case when checked_value = 0 then 0 else v.UnitValue end))) as tval,
                curr,
                l.conf_item
            ")
            ->fromRaw("
                dbo.stock s   
                inner join dbo.vw_lot_last_value v on v.IDcompany = s.IDcompany and v.IDlot = s.IDlot  
                inner join dbo.lot l on s.IDcompany = l.IDcompany and l.IDlot = s.IDlot  
                inner join dbo.item i on i.IDitem = l.IDitem  
                inner join dbo.warehouse wh on wh.IDcompany = s.IDcompany and s.IDwarehouse = wh.IDwarehouse 
                inner join dbo.warehouse_location wh_lc on wh_lc.IDcompany = s.IDcompany and s.IDlocation = wh_lc.IDlocation
                inner join dbo.company c on s.IDcompany = c.IDcompany
                left outer join dbo.item_group ig on ig.item_group = i.item_group and ig.IDcompany = s.IDcompany
            ")
            ->where('s.IDcompany', auth()->user()->IDcompany)
            ->groupBy(['um', 'i.item_group', 'curr', 'l.conf_item', 'item', 'item_desc']);

        $q = DB::query()
            ->fromSub($query, 't');

        $d = (new ReportStockValueByItemDataTable($q))
            ->with('numberOfLotWithUncheckedValue', Stock::getNumberOfLotWithUncheckedValue(auth()->user()->IDcompany));  

        if(!$request->has('order')) {
            $d->order(function($q){
                $q->orderBy('item', 'ASC');
            });
        }
        
        if($export){
            return response(
                $d->exportAs('Xlsx', $request->query('paginating', false)),
                headers: [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'inline'
                ]
            );
        }
        else {
            $sum = DB::query()
                ->selectRaw('SUM(tval) AS sum')
                ->fromSub($query, 't')
                ->first();

            $d
                ->with('sum', $sum->sum)
                ->with('currency', Company::find(auth()->user()->IDcompany)->curr);
        }

        return $d->toJson();        
    }

    /**
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/stock-value-on-date",
     *   summary="Get report of stock value on specific date",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     * 
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/stock-value-by-date/export",
     *   summary="Get report of stock value on specific date XLSX",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function stockValueOnDate(ReportStockValueOnDateRequest $request, $export = false)
    {
        $this->authorize('reportStockValue', 'report');
        
        $query = Stock::getStockValueAtDate(
            Utility::convertDateFromTimezone($request->date, auth()->user()->clientTimezoneDB, 'UTC', 'Y-m-d H:i'), 
            auth()->user()->IDcompany
        );

        $q = DB::query()
            ->select([
                'item', 'item_desc', 'item_group', 'um', 'curr',
                'qty_stock_stock', 'qty_stock_trans','qty_stock_qltco', 
                'tval_stock_stock','tval_stock_trans','tval_stock_qltco',	
                'qty_sold_1mm', 'qty_sold_3mm', 'qty_sold_12mm',
                'qty_min', 'qty_max'
            ])
            ->fromSub($query, 't')
            ->where('qty_stock_stock', '<>', 0)
            ->where(function($q){
                $q->orWhere('qty_stock_trans', '<>', 0)
                ->orWhere('qty_stock_qltco', '<>', 0)
                ->orWhere('qty_sold_1mm', '<>', 0)
                ->orWhere('qty_sold_3mm', '<>', 0)
                ->orWhere('qty_sold_12mm', '<>', 0);
            });

        $d = (new ReportStockValueOnDateDataTable($q))
            ->order(function($q){
                $q->orderBy('tval_stock_stock', 'ASC');
            })
            ->with('numberOfLotWithUncheckedValue', Stock::getNumberOfLotWithUncheckedValue(auth()->user()->IDcompany));  

        if($export){
            return response(
                $d->exportAs('Xlsx', $request->query('paginating', false)),
                headers: [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'inline'
                ]
            );
        }
        else {
            
            $sum = DB::query()
                ->selectRaw('
                    SUM(tval_stock_stock) AS sum_value_on_loc_stock,
                    SUM(tval_stock_trans) AS sum_value_on_loc_trans,
                    SUM(tval_stock_qltco) AS sum_value_on_loc_qualc
                ')
                ->fromSub($query, 't')
                ->first();

            $d
                ->with('sum_value_on_loc_stock', $sum->sum_value_on_loc_stock)
                ->with('sum_value_on_loc_trans', $sum->sum_value_on_loc_trans)
                ->with('sum_value_on_loc_qualc', $sum->sum_value_on_loc_qualc)
                ->with('sum', $sum->sum_value_on_loc_stock + $sum->sum_value_on_loc_trans + $sum->sum_value_on_loc_qualc)
                ->with('currency', Company::find(auth()->user()->IDcompany)->curr);
            
        }

        return $d->toJson();        
    }

    /**
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/stock-on-date-details",
     *   summary="Get stock on specific date with item details",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     * 
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/stock-on-date-details/export",
     *   summary="Get stock on specific date with item details XLSX",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function stockOnDateDetails(ReportStockValueOnDateRequest $request, $export = false)
    {
        $this->authorize('reportStockValue', 'report');
        
        $query = Stock::getStockAtDate(
            Utility::convertDateFromTimezone($request->date, auth()->user()->clientTimezoneDB, 'UTC', 'Y-m-d H:i'),  
            auth()->user()->IDcompany
        );

        $q = DB::query()
            ->select([
                'item', 'item_desc', 'IDlot', 'um', 'wdesc',
                'wldesc', 'evaluated','qty', DB::raw('lotVal*qty as lotVal'),
                'dateLotOri'
            ])
            ->fromSub($query, 't');

        $d = (new ReportStockOnDateDetailsDataTable($q))
            ->order(function($q){
                $q->orderBy('item', 'ASC');
            });  

        if($export){
            return response(
                $d->exportAs('Xlsx', $request->query('paginating', false)),
                headers: [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'inline'
                ]
            );
        }

        return $d->toJson();        
    }

    /**
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/inventory-lots",
     *   summary="Get report of inventory lots",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idInventory"
     *       },
     *       @OA\Property(property="idInventory", type="int"),
     *       example={
     *          "idInventory" : 8
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function inventoryLot(ReportInventoryLotRequest $request)
    {
        $this->authorize('inventoryLot', 'report');
        
        $d = (new ReportInventoryLotDataTable(
            InventoryLotHistory::getLotsByCompanyAndInventory(auth()->user()->IDcompany, $request->idInventory)
        ));

        return $d->toJson();

        // $ret = [];
        // return response()->json($ret);

        // ->chunk(2000, function($col) use (&$ret){
        //     $ret = array_merge($ret, $col->toArray());
        // });

        
    }

    /**
     * @OA\GET(
     *   tags={"Reports"},
     *   path="/reports/adjustment-inventory-lots",
     *   summary="Get report of adjustments inventory lots",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idInventory"
     *       },
     *       @OA\Property(property="idInventory", type="int"),
     *       example={
     *          "idInventory" : 8
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function adjustmentInventoryLot(ReportAdjustmentInventoryLotRequest $request, $export = false)
    {
        $this->authorize('adjustmentInventoryLot', 'report');

        $d = (new ReportAdjustmentInventoryLotDataTable(
            AdjustmentHistory::getAdjustmentInventoryLot(auth()->user()->IDcompany, $request->idInventory)
        ));

        if($export){
            return response(
                $d->exportAs('Xlsx', $request->query('paginating', false, ReportAdjustmentInventoryLotExport::class)),
                headers: [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'inline'
                ]
            );
        }

        return $d->toJson();
    }

}
