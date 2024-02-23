<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderMergeRowsPicking extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'order_merge_rows_picking';
    
    protected $primaryKey = 'IDmerge_row_picking_id';
    
    protected $fillable = [
        'IDmerge',
        'IDcompany',
        'IDStock',
        'IDlot',
        'qty',
        'username', 
        'date_ins',
        'date_picked'
    ];
    
    public $timestamps = false;

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }

    public function orderMerge(): BelongsTo
    {
        return $this->belongsTo(OrderMerge::class, 'IDmerge', 'IDmerge');
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class, 'IDlot', 'IDlot');
    }

    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class, 'IDStock', 'IDstock');
    }

    public static function getOrderInfo($idCompany, $idMerge, $idStock)
    {
        return
            DB::query()
                ->selectRaw("r.IDmerge, r.IDmerge_row_picking_id, s.IDlot as IDlot, i.item, i.item_desc, i.um as um, r.qty,
                dbo.getDimByLot (?, r.IDlot) as dim ,wh.[desc] as whdesc, wh_lc.[desc] as lcdesc, stepRoll, s.IDstock, i.IDitem, s.IDlocation, s.IDwarehouse,
                substring(convert(varchar, date_lot, 20),1,16) AS date_lot, h.executed, c.logo_on_prints", [$idCompany])
                ->fromRaw("
                order_merge_rows_picking r
                inner join company c on r.IDcompany = c.IDcompany
                inner join order_merge h on h.IDcompany = r.IDcompany and h.IDmerge = r.IDmerge
                inner join lot l on l.IDlot = r.IDlot and l.IDcompany = r.IDcompany
                inner join item i on i.IDitem = l.IDitem 
                left outer join stock s on r.IDstock = s.IDstock
                left outer join warehouse wh on  wh.IDcompany = s.IDcompany and s.IDwarehouse = wh.IDwarehouse 
                left outer join warehouse_location wh_lc on  wh_lc.IDcompany = s.IDcompany and s.IDlocation = wh_lc.IDlocation")
                ->when($idMerge == 0, function($q) use ($idCompany, $idStock, $idMerge){
                    $q->where('r.IDmerge', function($q) use ($idStock){
                        $q->select('h.IDmerge')
                            ->fromRaw('order_merge h
                            inner join [order_merge_rows_picking] r on h.IDcompany = r.IDcompany and h.IDmerge = r.IDmerge
                            ')
                            ->where('r.IDStock', $idStock);
                    })
                    ->union(function($q) use($idCompany, $idStock){
                        $q->selectRaw('0 as IDmerge,0 as IDmerge_row_id, s.IDlot as IDlot, i.item, i.item_desc, i.um as um, s.qty_stock,
                        dbo.getDimByLot (?, s.IDlot) as dim ,wh.[desc] as whdesc, wh_lc.[desc] as lcdesc, stepRoll, s.IDstock, i.IDitem, s.IDlocation, s.IDwarehouse,
                        substring(convert(varchar, date_lot, 20),1,16) AS date_lot, 0 as executed, c.logo_on_prints', [$idCompany])
                        ->fromRaw('stock s
                        inner join company c on s.IDcompany = c.IDcompany
                        inner join lot l on l.IDlot = s.IDlot and l.IDcompany = s.IDcompany
                        inner join item i on i.IDitem = l.IDitem 
                        inner join warehouse wh on  wh.IDcompany = s.IDcompany and s.IDwarehouse = wh.IDwarehouse 
                        inner join warehouse_location wh_lc on  wh_lc.IDcompany = s.IDcompany and s.IDlocation = wh_lc.IDlocation')
                        ->where([
                            's.IDcompany' => $idCompany,
                            's.IDstock' => $idStock
                        ])
                        ->whereNotIn('s.IDstock', function($q) use ($idCompany){
                            $q->select('IDstock')->from('order_merge_rows_picking')->where('IDcompany', $idCompany);
                        });
                    });
                }, function($q) use ($idMerge){
                    $q->where('r.IDmerge', $idMerge);
                });
    }
}
