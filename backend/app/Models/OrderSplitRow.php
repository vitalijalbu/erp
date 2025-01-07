<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderSplitRow extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'order_split_row';
    
    protected $primaryKey = 'IDRowSplit';
    
    protected $fillable = [
        'IDcompany',
        'IDord',
        'qty_split',
        'ord_ref',
        'IDlocation',
        'IDlot_new',
    ];

    public $timestamps = false;

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }

    public function orderSplit(): BelongsTo
    {
        return $this->belongsTo(OrderSplit::class, 'IDord', 'IDord');
    }

    public function warehouseLocation(): BelongsTo
    {
        return $this->belongsTo(WarehouseLocation::class, 'IDlocation', 'IDlocation');
    }

    public function lotNew(): BelongsTo
    {
        return $this->belongsTo(Lot::class, 'IDlot_new', 'IDlot');
    }
}
