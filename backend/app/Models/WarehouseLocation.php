<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;


class WarehouseLocation extends Model
{
    use HasFactory;
    use Traits\HasCustomId;
    
    protected $table = 'warehouse_location';
    
    protected $primaryKey = 'IDlocation';
    
    protected $fillable = [
        'desc',
        'note',
        'DefaultLoadLocPerWh',
        'IDwh_loc_Type'
    ];

    protected $attributes = [
        'IDwh_loc_Type' => 1
    ];
    
    public $timestamps = false;
    
    public function warehouseLocationType(): BelongsTo
    {
        return $this->belongsTo(WarehouseLocationType::class, 'IDwh_loc_Type', 'IDwh_loc_Type');
    }
    
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'IDwarehouse', 'IDwarehouse');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'IDlocation', 'IDlocation');
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class, 'IDlocation', 'IDlocation');
    }

    public function orderSplitRows(): HasMany
    {
        return $this->hasMany(OrderSplitRow::class, 'IDlocation', 'IDlocation');
    }

    public function orderSplits(): HasMany
    {
        return $this->hasMany(OrderSplit::class, 'IDlocation', 'IDlocation');
    }

    public function orderProductions(): HasMany
    {
        return $this->hasMany(OrderProduction::class, 'IDlocation', 'IDlocation');
    }

    public function orderMergeRowsReturns(): HasMany
    {
        return $this->hasMany(orderMergeRowsReturns::class, 'IDlocation', 'IDlocation');
    }

    /**
     * Get all of the adjustmentHistories for the Warehouse
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function adjustmentHistories(): HasMany
    {
        return $this->hasMany(AdjustmentHistory::class, 'IDlocation', 'IDlocation');
    }

    /**
     * Get all of the cuttingOrderRows for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function cuttingOrderRows(): HasMany
    {
        return $this->hasMany(CuttingOrderRow::class, 'IDlocation', 'IDlocation');
    }

    /**
     * Get all of the inventoryLotHistories for the Warehouse
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function inventoryLotHistories(): HasMany
    {
        return $this->hasMany(InventoryLotHistory::class, 'IDlocation', 'IDlocation');
    }

    public function scopeByUser(Builder $query, User $user): void 
    {
        $query->where('warehouse_location.IDcompany', $user->IDcompany);
    }
}
