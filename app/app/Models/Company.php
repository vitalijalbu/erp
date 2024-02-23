<?php

namespace App\Models;

use Illuminate\Database\Concerns\ManagesTransactions;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Company extends Model
{
    use HasFactory;
    use Traits\HasCustomId;
    use Traits\LogsActivity;

    protected $table = 'company';

    protected $primaryKey = 'IDcompany';

    public $timestamps = false;

    public $fillable = [
        'desc',
        'curr',
        'lot_code',
        'LN_bpid_code',
        'CSM_bpid_code',
        'logo_on_prints',
        'read_alternative_item_code'
    ];

    /**
     * Get all of the adjustmentHistories for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function adjustmentHistories(): HasMany
    {
        return $this->hasMany(AdjustmentHistory::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the bp for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function bp(): HasMany
    {
        return $this->hasMany(BP::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the bpDestinations for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function bpDestinations(): HasMany
    {
        return $this->hasMany(BPDestination::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the countries for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function countries(): HasMany
    {
        return $this->hasMany(Country::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the cuttingOrders for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function cuttingOrders(): HasMany
    {
        return $this->hasMany(CuttingOrder::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the cuttingOrderRows for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function cuttingOrderRows(): HasMany
    {
        return $this->hasMany(CuttingOrderRow::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the devaluationHistories for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function devaluationHistories(): HasMany
    {
        return $this->hasMany(DevaluationHistory::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the inventory for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function inventory(): HasMany
    {
        return $this->hasMany(Inventory::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the items for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function items(): HasMany
    {
        return $this->hasMany(Item::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the inventoryLotHistories for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function inventoryLotHistories(): HasMany
    {
        return $this->hasMany(InventoryLotHistory::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the itemEnabled for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function itemEnabled(): HasMany
    {
        return $this->hasMany(ItemEnabled::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the itemGroups for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function itemGroups(): HasMany
    {
        return $this->hasMany(ItemGroup::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the itemStockLimits for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function itemStockLimits(): HasMany
    {
        return $this->hasMany(ItemStockLimit::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the lots for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function lots(): HasMany
    {
        return $this->hasMany(Lot::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the logs for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function logs(): HasMany
    {
        return $this->hasMany(Log::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the lotDimensions for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function lotDimensions(): HasMany
    {
        return $this->hasMany(LotDimension::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the lotNumeriPrimi for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function lotNumeriPrimi(): HasMany
    {
        return $this->hasMany(LotNumeriPrimi::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the lotTrackingOrigin for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function lotTrackingOrigin(): HasMany
    {
        return $this->hasMany(LotTrackingOrigin::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the lotValue for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function lotValue(): HasMany
    {
        return $this->hasMany(LotValue::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get all of the lotType for the Company
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function lotType(): HasMany
    {
        return $this->hasMany(LotType::class, 'IDcompany', 'IDcompany');
    }

    
    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'curr', 'id');
    }

}
