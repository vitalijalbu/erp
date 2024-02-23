<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AdjustmentHistory extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'adjustments_history';

    protected $primaryKey = 'IDadjustments';

    public $timestamps = false;

    public $fillable = [
        'IDcompany',
        'date_adj',
        'IDlot',
        'IDwarehouse',
        'IDlocation',
        'segno',
        'qty',
        'IDadjtype',
        'IDinventory',
        'username'
    ];

    /**
     * Get the adjustmentType that owns the AdjustmentHistory
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function adjustmentType(): BelongsTo
    {
        return $this->belongsTo(AdjustmentType::class, 'IDadjtype', 'IDadjtype');
    }

    /**
     * Get the company that owns the AdjustmentHistory
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get the warehouseLocation that owns the AdjustmentHistory
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function warehouseLocation(): BelongsTo
    {
        return $this->belongsTo(WarehouseLocation::class, 'IDlocation', 'IDlocation');
    }

    /**
     * Get the warehouse that owns the AdjustmentHistory
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'IDwarehouse', 'IDwarehouse');
    }

    /**
     * Get the inventory that owns the AdjustmentHistory
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class, 'IDinventory', 'IDinventory');
    }

    /**
     * Get the lot that owns the AdjustmentHistory
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class, 'IDlot', 'IDlot');
    }

    public static function getAdjustmentInventoryLot($idCompany, $idInventory): Builder
    {
        return 
            AdjustmentHistory::query()
                ->select('IDlot', 'qty', 'segno', 'username', DB::raw('substring(convert(varchar, date_adj, 20),1,16) as date_adj, dbo.getDimByLot (adjustments_history.IDcompany, adjustments_history.IDlot) as dim' ), 'adjustments_history.IDwarehouse', 'adjustments_history.IDlocation')
                ->whereHas('lot')
                ->whereHas('lot.item')
                ->whereHas('warehouse')
                ->whereHas('warehouseLocation')
                ->where([
                    'adjustments_history.IDcompany' => $idCompany,
                    'adjustments_history.IDinventory' => $idInventory 
                ])
                ->with([
                    'lot' => function($q){
                        $q->select('IDlot', 'IDitem')
                            ->selectRaw("substring(convert(varchar, date_lot, 20),1,10) as date_lot")
                            ->with('item', function($q){
                                $q->select('IDitem', 'item', 'item_desc', 'um');
                            });
                    },
                    'warehouse' => function($q){
                        $q->select('IDwarehouse', 'desc');
                    },
                    'warehouseLocation' => function($q){
                        $q->select('IDlocation','desc');
                    }
                ]);
    }

}
