<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ItemStockLimit extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'item_stock_limits';

    protected $primaryKey = 'IDitemStockLimits';

    public $timestamps = false;

    public $fillable = [
        'IDwarehouse',
        'qty_min',
        'qty_max',
    ];

    public $casts = [
        'qty_min' => 'double',
        'qty_max' => 'double',
        'enabled' => 'integer'
    ];

     /**
     * Get the company that owns the BpDestination
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }

    /**
     * Get the item that owns the ItemStockLimit
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'IDitem', 'IDitem');
    }

    /**
     * Get the warehouse that owns the ItemStockLimit
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'IDwarehouse', 'IDwarehouse');
    }

    public static function getCurrentLimits($companyId, Item $item) {
        return static::select([
            '*'
        ])
            ->with('warehouse')
            ->whereIn(
                'IDitemStockLimits',
                static::selectRaw('MAX(IDitemStockLimits)')
                    ->where('IDitem', $item->IDitem)
                    ->where('IDcompany', $companyId)
                    ->groupBy(['IDwarehouse'])
            )
            ->get();
    }
}
