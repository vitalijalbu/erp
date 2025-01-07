<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;


class Warehouse extends Model
{
    use HasFactory;
    use Traits\HasCustomId;
    
    protected $table = 'warehouse';
    
    protected $primaryKey = 'IDwarehouse';
    
    protected $fillable = [
        'IDcompany',
        'IDcountry',
        'desc',
    ];
    
    public $timestamps = false;

    protected static function booted(): void
    {
        parent::booted();

        static::creating(function (Warehouse $warehouse) {
            if(!DB::transactionLevel()) {
                throw new \Exception("Cannot create warehouse outside of a transaction");
            }

            return true;
        });

        static::created(function (Warehouse $warehouse) {
            $location = new \App\Models\WarehouseLocation();
            $location->forceFill([
                'IDcompany' => $warehouse->IDcompany,
                'desc' => 'Load',
                'note' => 'Default loading location',
                'DefaultLoadLocPerWh' => 1,
                'IDwh_loc_Type' => 1
            ]);
            $warehouse->warehouseLocations()->save($location);
        });
    }
    
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }
    
    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'IDcountry', 'IDcountry');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'IDwarehouse', 'IDwarehouse');
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class, 'IDwarehouse', 'IDwarehouse');
    }

    public function orderSplits(): HasMany
    {
        return $this->hasMany(OrderSplit::class, 'IDwarehouse', 'IDwarehouse');
    }

    public function orderProductions(): HasMany
    {
        return $this->hasMany(OrderProduction::class, 'IDwarehouse', 'IDwarehouse');
    }

    /**
     * Get all of the adjustmentHistories for the Warehouse
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function adjustmentHistories(): HasMany
    {
        return $this->hasMany(AdjustmentHistory::class, 'IDwarehouse', 'IDwarehouse');
    }

    /**
     * Get all of the inventoryLotHistories for the Warehouse
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function inventoryLotHistories(): HasMany
    {
        return $this->hasMany(InventoryLotHistory::class, 'IDwarehouse', 'IDwarehouse');
    }

    /**
     * Get all of the itemStockLimits for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function itemStockLimits(): HasMany
    {
        return $this->hasMany(ItemStockLimit::class, 'IDwarehouse', 'IDwarehouse');
    }

    /**
     * Get all of the warehouseLocations for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function warehouseLocations(): HasMany
    {
        return $this->hasMany(WarehouseLocation::class, 'IDwarehouse', 'IDwarehouse');
    }
}
