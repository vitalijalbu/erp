<?php

namespace App\Models;

use Carbon\Carbon;
use App\Models\Inventory;
use App\Models\MaterialIssueTemp;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Contracts\Database\Query\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Stock extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'stock';
    
    protected $primaryKey = 'IDstock';
    
    protected $fillable = [
        'IDcompany',
        'IDlot',
        'IDwarehouse',
        'IDlocation',
        'qty_stock',
        'IDinventory',
        'invUsername',
        'invDate_ins'
    ];
    
    public $timestamps = false;

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class, 'IDlot', 'IDlot');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'IDwarehouse', 'IDwarehouse');
    }

    public function warehouseLocation(): BelongsTo
    {
        return $this->belongsTo(WarehouseLocation::class, 'IDlocation', 'IDlocation');
    }

    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class, 'IDinventory', 'IDinventory');
    }

    public function orderMergeRowsPickings(): HasMany
    {
        return $this->hasMany(OrderMergeRowsPicking::class, 'IDStock', 'IDstock');
    }

    public function materialTransferTemps(): HasMany
    {
        return $this->hasMany(MaterialTransferTemp::class, 'IDStock', 'IDstock');
    }

    public function materialIssueTemps(): HasMany
    {
        return $this->hasMany(MaterialIssueTemp::class, 'IDStock', 'IDstock');
    }

    public static function getStocks($company) : Builder
    {
        $r = DB::query()
        ->selectRaw("lot.IDlot, lot.IDlot_origine, item.IDitem, item.item, item.item_desc, wh.[desc] as whdesc, wh_lc.[desc] as lcdesc,
        isnull(LA,'') as LA, isnull(LU,'') as LU, isnull(PZ,'') as PZ,  isnull(DE,'') as DE, isnull(DI,'') as DI, 
        isnull(cuts.Ncut,0) as cutNum, qty_stock, item.um,  
        lot.date_lot, year(lotOri.date_lot) as lotOriYear,
        case when lot.stepRoll = 0 then 0 else 1 end as stepRoll,
        lot.ord_rif, stock_b.IDwarehouse, stock_b.IDlocation, lot.note
        ,IDinventory, IDstock, comp.NumComp
        ,case when lot.eur1 = 0 then 0 else 1 end as eur1
        ,case when lot.conf_item = 0 then 0 else 1 end as conf_item
        ,case when lot.merged_lot = 0 then 0 else 1 end as merged_lot")
        ->fromRaw("(
            SELECT stock_base.IDcompany, IDlot, stock_base.IDwarehouse, stock_base.IDlocation, qty_stock, IDinventory, IDstock
            from dbo.stock stock_base 
            
            inner join warehouse swh on swh.IDwarehouse = stock_base.IDwarehouse
            inner join warehouse_location swhl on swhl.IDlocation = stock_base.IDlocation
            where stock_base.IDcompany = ?
            ) stock_b", [$company->IDcompany])
        ->join('dbo.lot', function($join){
            $join->on('lot.IDcompany', '=', 'stock_b.IDcompany');
            $join->on('lot.IDlot', '=', 'stock_b.IDlot');
        })
        ->join(DB::raw('dbo.lot lotOri'), function($join){
            $join->on('lotOri.IDcompany', '=', 'stock_b.IDcompany');
            $join->on('lotOri.IDlot', '=', 'lot.IDlot_origine');
        })
        ->join('dbo.item', 'item.IDitem', '=', 'lot.IDitem');

        if($company->read_alternative_item_code){
            $r->selectRaw("item_en.altv_code, isnull(item_en.altv_desc, '') as altv_desc");
            $r->leftJoin(DB::raw('dbo.item_enabled as item_en'), function($join) use ($company){
                $join->on('item.IDitem', '=', 'item_en.IDitem');
                $join->whereIn('item_en.IDcompany', [0, $company->IDcompany]);
            });
        }

        $r->join(DB::raw('dbo.warehouse wh'), 'stock_b.IDwarehouse', '=', 'wh.IDwarehouse')
        ->join(DB::raw('dbo.warehouse_location wh_lc'), 'stock_b.IDlocation', '=', 'wh_lc.IDlocation')
        ->join(DB::raw("dbo.parView_lotDimensionsPivot(?) dim"), 'dim.IDlot', '=', 'stock_b.IDlot')
        ->addBinding($company->IDcompany)
        ->leftJoin(DB::raw('dbo.vw_cuts_on_cutting_order cuts'), function($join){
            $join->on('cuts.IDcompany', '=', 'stock_b.IDcompany');
            $join->on('cuts.IDlot', '=', 'lot.IDlot');
            $join->on(DB::raw('cuts.IDlot_new'), 'IS', DB::raw('NULL'));
        })
        ->leftJoin(DB::raw('dbo.vw_comp_on_production_order comp'), function($join){
            $join->on('comp.IDcompany', '=', 'stock_b.IDcompany');
            $join->on('comp.IDlot', '=', 'stock_b.IDlot');
        })
        ->where('stock_b.IDcompany', $company->IDcompany);

        $r =  DB::query()
            ->selectRaw('*')
            ->from($r, 'inner');
            
            
            return $r;
    }

    public static function getStockViewer($company): Builder
    {
        return
            DB::query()
                ->selectRaw(
                    "IDlot, IDlot_origine, item, item_desc, item_group, whdesc, lcdesc,
                    LA, LU, PZ, DE, DI, cutNum, qty_stock, um,  date_lot, stepRoll, ord_rif,
                    IDwarehouse, IDlocation, note, IDinventory, IDstock, NumComp, eur1, conf_item, merged_lot,
                    totValue, UnitValue, MaxUnitValue, DiffPercVal, ValueNote, dateLotOri, loc_type, loc_evaluated"
                )
                ->fromRaw("dbo.vw_stock_viewer")
                ->where("IDcompany", $company);
    }

    public static function inventoryAddLot($id_lot, $user, $request): bool
    {
        $inv_code = Inventory::getCodeCurrentlyRunning($user->IDcompany);

        if(!$inv_code){
            return false;
        }

        return Stock::where([
            'IDcompany' => $user->IDcompany,
            'IDlot' => $id_lot,
            'IDwarehouse' => $request->id_warehouse,
            'IDlocation' => $request->id_warehouse_location
        ])
        ->update([
            'IDinventory' => $inv_code,
            'invUsername' => $user->username,
            'invDate_ins' => Carbon::now('UTC')
        ]);        
    }

    public static function inventoryDelLot($id_lot, $user, $request): bool
    {
        return Stock::where([
            'IDcompany' => $user->IDcompany,
            'IDlot' => $id_lot,
            'IDwarehouse' => $request->id_warehouse,
            'IDlocation' => $request->id_warehouse_location
        ])
        ->update([
            'IDinventory' => null,
            'invUsername' => null,
            'invDate_ins' => null
        ]);        
    }

    /*
    public static function getStockAtDate($date, $companyId): Builder
    {
        $q = DB::query()
            ->selectRaw("
                IDitem, item, item_desc, item_group, um, curr, sum([qty]) as qty, sum(lotVal) as tval, 
                isnull(
                    (
                        select sum(tr1.qty)
                        from transactions tr1
                        inner join lot l1 on tr1.IDcompany = l1.IDcompany and tr1.IDlot = l1.IDlot
                        where tr1.IDcompany = ?
                            and tr1.date_tran between DATEADD(day, -30, ?) and ?
                            and tr1.IDtrantype = 3 
                            and l1.IDitem = LotToDateGrpByI.IDitem
                    ),0
                ) as qty_sold_1mm,
                isnull(
                    (
                        select sum(tr1.qty)
                        from transactions tr1
                        inner join lot l1 on tr1.IDcompany = l1.IDcompany and tr1.IDlot = l1.IDlot
                        where tr1.IDcompany = ?
                            and tr1.date_tran between DATEADD(day, -90, ?) and ?  
                            and tr1.IDtrantype = 3 
                            and l1.IDitem = LotToDateGrpByI.IDitem
                    ),0
                ) / 3 as qty_sold_3mm,
                isnull(
                    (
                        select sum(tr12.qty)
                        from transactions tr12
                        inner join lot l12 on tr12.IDcompany = l12.IDcompany and tr12.IDlot = l12.IDlot
                        where tr12.IDcompany = ?
                            and tr12.date_tran between DATEADD(day, -365, ?) and ?
                            and tr12.IDtrantype = 3 
                            and l12.IDitem = LotToDateGrpByI.IDitem
                    ),0
                ) / 12 as qty_sold_12mm
            ")
            ->fromRaw("
                (
                    select LotToDate.IDcompany, LotToDate.IDlot, i.IDitem, i.item, i.item_desc, i.item_group, i.um, c.curr, LotToDate.[qty],
                        LotToDate.[qty] * 
                        case when l.checked_value = 1 and l.checked_value_date <= ?  then 
                            isnull(
                                (
                                    select top 1 UnitValue 
                                    from [dbo].[lot_value] lv 
                                    where lv.IDcompany =  LotToDate.IDcompany and  lv.IDlot = LotToDate.IDlot and lv.date_ins <= ?
                                    order by date_ins desc
                                ),0
                            )
                            else  0 
                        end as lotVal
                    from (
                        SELECT IDcompany, IDlot, sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) as [qty]
                        FROM dbo.transactions
                        where IDcompany = ? 
                        and [date_tran] < = ?
                        group by IDcompany, IDlot
                        having sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) > 0
                    ) LotToDate
                    inner join dbo.company c on c.IDcompany = LotToDate.IDcompany
                    inner join dbo.lot l on l.IDcompany = LotToDate.IDcompany and l.IDlot = LotToDate.IDlot
                    inner join dbo.item i on i.IDitem = l.IDitem
                ) LotToDateGrpByI
            ")
            ->groupByRaw("IDitem, item, item_desc, item_group, um, curr ");

        $q->setBindings([
            $companyId, 
            $date, 
            $date, 
            $companyId, 
            $date, 
            $date, 
            $companyId, 
            $date, 
            $date, 
            $date, 
            $date, 
            $companyId, 
            $date
        ], 'where');

        return $q;
    }*/


    public static function getStockValueAtDate($date, $companyId): Builder
    {

        $qStockValueAtDateLocation = "
            select IDitem, sum([qty]) as qty, sum(lotVal) as tval
            from
            (
                select  IDitem,
                    LotToDate.[qty],
                    LotToDate.[qty] * 
                    case when l.checked_value = 1 and l.checked_value_date <= ?  then
                        isnull((select top 1 UnitValue 
                                from [dbo].[lot_value] lv 
                                where lv.IDcompany =  LotToDate.IDcompany and  lv.IDlot = LotToDate.IDlot and lv.date_ins <= ?
                                order by date_ins desc),0) 		
                        else  0 end as lotVal
                    from
                        (
                            SELECT tr.IDcompany, IDlot, sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) as [qty]
                            FROM dbo.transactions tr
                            inner join dbo.warehouse_location wl on tr.IDcompany = wl.IDcompany and tr.IDlocation = wl.IDlocation
                            where tr.IDcompany = ? 
                            and [date_tran] < = ?
                            and IDwh_loc_Type =  ?					
                            group by tr.IDcompany, IDlot 
                            having sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) > 0
                        ) LotToDate 		  
                    inner join dbo.lot l on l.IDcompany = LotToDate.IDcompany and l.IDlot = LotToDate.IDlot		  					
                ) IDitemToDate
            group by IDitem
        ";

        $q = DB::query()
            ->selectRaw("
                i.IDitem, item, item_desc, item_group, um, 
                (select curr from company where IDcompany = ?) as curr, 
                isnull(stock_stock.qty,0) as qty_stock_stock, 
                isnull(stock_trans.qty,0) as qty_stock_trans,
                isnull(stock_qltco.qty,0) as qty_stock_qltco,
                isnull(stock_stock.tval,0) as tval_stock_stock,
                isnull(stock_trans.tval,0) as tval_stock_trans,
                isnull(stock_qltco.tval,0) as tval_stock_qltco,
                isnull(
                    (
                        select sum(tr1.qty)
                        from transactions tr1
                        inner join lot l1 on tr1.IDcompany = l1.IDcompany and tr1.IDlot = l1.IDlot
                        where tr1.IDcompany = ?
                            and tr1.date_tran between DATEADD(day, -30, ?) and ?
                            and tr1.IDtrantype = 3 /*Sales*/
                            and l1.IDitem = i.IDitem
                    ),0
                ) as qty_sold_1mm,
                isnull(
                    (
                        select sum(tr1.qty)
                        from transactions tr1
                        inner join lot l1 on tr1.IDcompany = l1.IDcompany and tr1.IDlot = l1.IDlot
                        where tr1.IDcompany = ?
                            and tr1.date_tran between DATEADD(day, -90, ?) and ? 
                            and tr1.IDtrantype = 3 /*Sales*/
                            and l1.IDitem = i.IDitem
                    ),0
                ) / 3 as qty_sold_3mm,
                isnull(
                    (
                        select sum(tr12.qty)
                        from transactions tr12
                        inner join lot l12 on tr12.IDcompany = l12.IDcompany and tr12.IDlot = l12.IDlot
                        where tr12.IDcompany = ?
                            and tr12.date_tran between DATEADD(day, -365, ?) and ?
                            and tr12.IDtrantype = 3 /*Sales*/
                            and l12.IDitem = i.IDitem
                    ),0
                ) / 12 as qty_sold_12mm,
                stock_limits.qty_min, stock_limits.qty_max
            ")
            ->fromRaw("
                dbo.item i
                left outer join (".$qStockValueAtDateLocation.") stock_stock on stock_stock.IDitem = i.IDitem
                left outer join (".$qStockValueAtDateLocation.") stock_trans on stock_trans.IDitem = i.IDitem
                left outer join (".$qStockValueAtDateLocation.") stock_qltco on stock_qltco.IDitem = i.IDitem
                left outer join (
                    select IDitem, SUM(qty_min) as qty_min, SUM(qty_max) as qty_max
				    from (
                        select i.IDitemStockLimits, i.IDcompany, i.IDitem, i.IDwarehouse, i.qty_min, i.qty_max, i.username, 
                            substring(convert(varchar, i.date_ins, 20),1,20) as date_ins 
                            ,ii.item, ii.item_desc, ii.um,  w.[desc] as wdesc
                        from item_stock_limits i
                        inner join item ii on ii.IDitem = i.IDitem
                        inner join warehouse w on w.IDcompany = i.IDcompany and w.IDwarehouse = i.IDwarehouse
                        where i.IDitemStockLimits in (
                            select MAX(ismm.IDitemStockLimits) lastRecord
                            from item_stock_limits ismm
                            group by ismm.IDcompany, ismm.IDitem, ismm.IDwarehouse
                        )
                    ) stll where IDcompany = ?
                    group by IDitem) 
                stock_limits on stock_limits.IDitem = i.IDitem
            ");

        $q->setBindings([
            $companyId, 
            $companyId, 
            $date, 
            $date, 
            $companyId, 
            $date, 
            $date, 
            $companyId, 
            $date, 
            $date, 
            $date,
            $date,
            $companyId, 
            $date, 
            1,
            $date,
            $date,
            $companyId, 
            $date, 
            2,
            $date,
            $date,
            $companyId, 
            $date, 
            3,
            $companyId,
        ], 'where');

        return $q;
    }

    public static function getStockAtDate($date, $companyId): Builder
    {

        $sub = DB::query()
            ->selectRaw("
                t.IDlot, l.IDlot_origine, i.item, i.item_desc, i.um, w.[desc] as wdesc, 
                wl.[desc] as wldesc, checked_value, checked_value_date, evaluated, 
                sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) as qty
            ")
            ->from('dbo.transactions', 't')
            ->join(DB::raw('dbo.lot l'), function (JoinClause $join) {
                $join->on('t.IDcompany', '=', 'l.IDcompany')
                    ->on('t.IDlot', '=', 'l.IDlot');
            })
            ->join(DB::raw('dbo.item i'), 'i.IDitem', '=', 'l.IDitem')
            ->join(DB::raw('dbo.warehouse w'), 'w.IDwarehouse', '=', 't.IDwarehouse')
            ->join(DB::raw('dbo.warehouse_location wl'), 'wl.IDlocation', '=', 't.IDlocation')
            ->join(DB::raw('dbo.warehouse_location_type wlt'), 'wl.IDwh_loc_Type', '=', 'wlt.IDwh_loc_Type')
            ->where('t.IDcompany', $companyId)
            ->where('date_tran', '<=', $date)
            ->groupBy([
                't.IDlot', 
                'IDlot_origine',
                'i.item', 
                'i.item_desc', 
                'i.um', 
                'w.desc', 
                'wl.desc', 
                'checked_value', 
                'checked_value_date', 
                'evaluated'
            ])
            ->havingRaw("sum(case  when [segno] = '+' then [qty] when [segno] = '-' then -1*[qty] end) > 0");

        return DB::query()
            ->selectRaw("
                *,
                case when checked_value = 1 and checked_value_date <= ? then
                    isnull(
                        (
                            select top 1 UnitValue 
                            from [dbo].[lot_value] lv 
                            where lv.IDcompany = ? and lv.IDlot = main.IDlot 
                                and lv.date_ins <= ?
                            order by date_ins desc
                        ),
                        0
                    ) 		
                else 0 end as lotVal,
                (select date_lot from dbo.lot lotOri where lotOri.IDcompany = ? and lotOri.IDlot = main.IDlot_origine) as dateLotOri", 
                [$date, $companyId, $date, $companyId]
            )
            ->fromSub($sub, 'main');
    }

    public static function getCountStocksNotInInventoryByCompany($idCompany)
    {
        return
            Stock::query()
                ->whereNull('IDinventory')
                ->where('IDcompany', $idCompany)
                ->count();
    }

    public static function getNumberOfLotWithUncheckedValue($idCompany)
    {
        return
            Stock::query()
                ->whereHas('lot', function($q) use ($idCompany){
                    $q->where([
                        'IDCompany' => $idCompany,
                        'checked_value' => 0
                    ]);
                })
                ->where('IDCompany', $idCompany)
                ->count();
    }
}
