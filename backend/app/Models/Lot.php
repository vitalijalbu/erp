<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Query\JoinClause;


class Lot extends Model
{
    use HasFactory;

    protected $table = 'lot';

    protected $primaryKey = 'IDlot';

    protected $keyType = 'string';

    public $timestamps = false;

    public $incrementing = false;

    public $fillable = [
        'IDlot',
        'IDcompany',
        'IDitem',
        'date_ins',
        'date_lot',
        'IDlot_padre',
        'IDlot_origine',
        'IDlot_fornitore',
        'note',
        'IDbp',
        'stepRoll',
        'step_roll_order',
        'checked_value',
        'devaluation',
        'ord_rif',
        'checked_value_date',
        'eur1',
        'conf_item',
        'merged_lot',
    ];

    /**
     * Get the company that owns the Lot
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get the item that owns the Lot
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'IDitem', 'IDitem');
    }

    /**
     * Get the bp that owns the Lot
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function bp(): BelongsTo
    {
        return $this->belongsTo(BP::class, 'IDbp', 'IDbp');
    }

    /**
     * Get all of the adjustmentHistories for the Warehouse
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function adjustmentHistories(): HasMany
    {
        return $this->hasMany(AdjustmentHistory::class, 'IDlot', 'IDlot');
    }

    /**
     * Get all of the cuttingOrderRows for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function cuttingOrderRows(): HasMany
    {
        return $this->hasMany(CuttingOrderRow::class, 'IDlot', 'IDlot');
    }

    /**
     * Get all of the inventoryLotHistories for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function inventoryLotHistories(): HasMany
    {
        return $this->hasMany(InventoryLotHistory::class, 'IDlot', 'IDlot');
    }

    /**
     * Get all of the dimensions for the Lot
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function dimensions(): HasMany
    {
        return $this->hasMany(LotDimension::class, 'IDlot', 'IDlot');
    }

    /**
     * Get all of the trackingOrigin for the Lot
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function trackingOrigin(): HasMany
    {
        return $this->hasMany(LotTrackingOrigin::class, 'IDlot', 'IDlot');
    }

    /**
     * Get all of the values for the Lot
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function values(): HasMany
    {
        return $this->hasMany(LotValue::class, 'IDlot', 'IDlot');
    }

    /**
     * Get all of the stocks for the Lot
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class, 'IDlot', 'IDlot');
    }


    /**
     * Get the latest values for the Lot
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function latestValue(): HasOne
    {
        return $this->hasOne(LotValue::class, 'IDlot', 'IDlot')->ofMany('date_ins', 'max');
    }

    public static function getLotValuesToCheck($companyId): \Illuminate\Database\Query\Builder
    {
        return DB::query()
            ->selectRaw("
                IDlot, IDlot_fornitore, item, item_desc, date_ins, date_lot, um, LA, LU, PZ, 
                DE, DI, bpdesc, UnitValue, 
                case when isnull(PZ,0) <> 0 then tval/PZ else 0 end as price_piece
                ,tval, totStock, ord_rif, loadedWhDesc, delivery_note, conf_item
            ")
            ->fromRaw("(
                SELECT l.IDlot,item,item_desc,substring(convert(varchar, l.date_ins, 20),1,16) as date_ins , 
                substring(convert(varchar, l.date_lot, 20),1,16) as date_lot, um, 
                l.IDlot_fornitore, 
                isnull(LA,'') as LA, isnull(LU,'') as LU, isnull(PZ,'') as PZ,  isnull(DE,'') as DE, isnull(DI,'') as DI
                ,isnull(bp.[desc],'') as bpdesc,v.UnitValue 
                ,sum((qty_stock * v.UnitValue)) as tval  
                ,sum(qty_stock) as totStock 
                ,l.ord_rif
                ,[dbo].[getLoadedWarehouseByLot] (l.IDcompany, l.IDlot) as loadedWhDesc
                ,delivery_note
                ,l.conf_item
                FROM dbo.lot l  
                inner join dbo.vw_lot_last_value v on v.IDcompany = l.IDcompany and v.IDlot = l.IDlot  
                inner join dbo.stock s on s.IDcompany = l.IDcompany and l.IDlot = s.IDlot  
                inner join dbo.item i on i.IDitem = l.IDitem  
                inner join dbo.parView_lotDimensionsPivot(?) dim on dim.IDlot = l.IDlot
                left outer join dbo.bp on bp.IDcompany = l.IDcompany and bp.IDbp = l.IDbp  
                left outer join dbo.receptions rc on rc.IDcompany = l.IDcompany and l.IDlot = rc.IDlot and l.IDlot_fornitore = rc.IDlot_fornitore
                where l.IDcompany = ? and checked_value = 0  
                group by l.IDlot,item,item_desc,substring(convert(varchar, l.date_ins, 20),1,16), substring(convert(varchar, l.date_lot, 20),1,16), um,  
                        l.IDlot_fornitore, 
                        isnull(LA,''), isnull(LU,''), isnull(PZ,''),isnull(DE,''), isnull(DI,'')
                        ,isnull(bp.[desc],''),v.UnitValue	,l.IDcompany, l.ord_rif, delivery_note, l.conf_item
                ) GroupedTabled
            ", [$companyId, $companyId]);
    }

    public function addValue($value, $companyId, \App\Models\User $user, $check, $note = null)
    {
        return DB::transaction(function() use ($value, $companyId, $user, $check, $note) {
            $this->values()->create([
                'IDcompany' => $companyId,
                'date_ins' => Carbon::now(),
                'UnitValue' => round($value, 4),
                'username' => $user->username,
                'IDdevaluation' => null,
                'note' => $note
            ]);

            if($check) {
                $this->checked_value = 1;
                $this->checked_value_date = Carbon::now();
                return $this->save();
            }

            return true;
        });
    }

    public function getStockQty($idWarehouse = null, $idLocation = null)
    {
        $q = Stock::where('IDlot', $this->IDlot);

        if($idWarehouse) {
            $q->where('IDwarehouse', $idWarehouse);
        }
        if($idLocation) {
            $q->where('IDlocation', $idLocation);
        }

        return $q->sum('qty_stock');
    }

    public function getStockValue($idWarehouse = null, $idLocation = null)
    {
        $lastValue = $this->latestValue;
        return $lastValue !== null ? 
            $lastValue->UnitValue * $this->getStockQty($idWarehouse, $idLocation)
            : 0;
    }

    public static function numberOfLotWithUncheckedValue($companyId)
    {
        return Stock::query()
            ->join('lot', function (JoinClause $join) {
                $join->on('lot.IDcompany', '=', 'stock.IDcompany')
                    ->on('lot.IDlot', '=', 'stock.IDlot');
            })
            ->where('lot.checked_value', 0)
            ->where('stock.IDcompany', $companyId)
            ->count('lot.IDlot');

    }

    public static function getLotInfoByCompany($company)
    {
        $res = 
            DB::query()
                ->selectRaw("l.IDitem,l.IDlot, l.IDcompany, item, item_desc, 
                isnull(d1.val, 0) as la, isnull(d2.val, 0) as lu, isnull(d3.val, 0) as pz, isnull(d4.val, 0) as di, isnull(d5.val, 0) as de,
                um,  (isnull(d1.val, 0)*isnull(d2.val, 0)*isnull(d3.val, 0)/1000000) as m2 ,
                wh.IDwarehouse as IDwh,
                wh.[desc] as whdesc,
                whlc.[desc] as whlcdesc,
                whlc.IDlocation as IDwhl,
                l.stepRoll,
                l.ord_rif,
                isnull(st.qty_stock,0) as  qty_stock, l.note")
                ->fromRaw("lot l
                inner join item i on i.IDitem = l.IDitem
                left outer join lot_dimension d1 on d1.IDlot = l.IDlot and d1.IDcompany = l.IDcompany and d1.IDcar = 'LA'
                left outer join lot_dimension d2 on d2.IDlot = l.IDlot and d2.IDcompany = l.IDcompany and d2.IDcar = 'LU'
                left outer join lot_dimension d3 on d3.IDlot = l.IDlot and d3.IDcompany = l.IDcompany and d3.IDcar = 'PZ'
                left outer join lot_dimension d4 on d4.IDlot = l.IDlot and d4.IDcompany = l.IDcompany and d4.IDcar = 'DI'
                left outer join lot_dimension d5 on d5.IDlot = l.IDlot and d5.IDcompany = l.IDcompany and d5.IDcar = 'DE'
                left outer join stock st on st.IDlot = l.IDlot and st.IDcompany = l.IDcompany
                left outer join warehouse wh on wh.IDwarehouse = st.IDwarehouse and wh.IDcompany = l.IDcompany
                left outer join warehouse_location whlc on whlc.IDlocation = st.IDlocation and whlc.IDcompany = l.IDcompany");

        if($company->read_alternative_item_code){
            $res->selectRaw("item_en.altv_code, isnull(item_en.altv_desc, '') as altv_desc")
                ->leftJoin(DB::raw('dbo.item_enabled as item_en'), function($join) use ($company){
                    $join->on('i.IDitem', '=', 'item_en.IDitem');
                    $join->whereIn('item_en.IDcompany', [0, $company->IDcompany]);
                });
        }
        
        return $res;
    }

    public static function getAllLotsByStepRollLot($idLot, $company)
    {
        $res = 
            Lot::query()
                ->selectRaw("IDlot, dbo.getM2ByLotLALUPZ(IDcompany, IDlot) as qtyLot, dbo.getDimByLot(IDcompany, IDlot) as dim")
                ->with('dimensions', function($q) use ($company){
                    $q->where('IDcompany', $company->IDcompany)
                        ->where('IDcar', 'LU')
                        ->select(DB::raw('val as lu'), 'IDlot');
                })
                ->with('stocks', function($q){
                    $q->select('qty_stock', 'IDlot');
                })
                ->whereHas('stocks', function($q) use ($company){
                    $q->where('IDcompany', $company->IDcompany);
                })
                ->where('IDlot_padre', function($q) use ($idLot, $company){
                    $q->select('IDlot_padre')
                        ->from('lot')
                        ->where([
                            'IDlot' => $idLot,
                            'IDcompany' => $company->IDcompany
                        ]);
                })
                ->where([
                    'stepRoll' => 1,
                    'IDcompany' => $company->IDcompany
                ])
                ->orderBy('step_roll_order');

        return $res;
    }

}
