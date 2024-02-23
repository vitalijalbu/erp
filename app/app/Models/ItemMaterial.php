<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemMaterial extends Model
{
    use HasFactory;

    public $timestamps = false;

    public $fillable = [
        'position',
        'item_id',
        'quantity',
        'process_id',
        'configured_item_id'
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id', 'IDitem');
    }

    public function process(): BelongsTo
    {
        return $this->belongsTo(Process::class, 'process_id', 'id');
    }                                                                                                                                                           

    public function configuredItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'configured_item_id', 'IDitem');
    }
}
