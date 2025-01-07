<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemRouting extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'process_id',
        'price_item_id',
        'setup_price_item_id',
        'operator_cost_item_id',
        'machine_cost_item_id',
        'execution_time',
        'setup_time',
        'operation_men_occupation',
        'machine_men_occupation',
        'position',
        'quantity',
        'note'
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id', 'IDitem');
    }

    public function process(): BelongsTo
    {
        return $this->belongsTo(Process::class, 'process_id', 'id');
    }

    public function priceItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'price_item_id', 'IDitem');
    }

    public function setupPriceItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'setup_price_item_id', 'IDitem');
    }

    public function operatorCostItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'operator_cost_item_id', 'IDitem');
    }

    public function machineCostItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'machine_cost_item_id', 'IDitem');
    }
}
