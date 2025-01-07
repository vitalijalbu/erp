<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderMergeRowsReturn extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'order_merge_rows_return';
    
    protected $primaryKey = 'IDmerge_row_return_id';
    
    protected $fillable = [
        'IDmerge',
        'IDcompany',
        'PZ',
        'LA',
        'LU',
        'IDlot_new', 
        'ord_ref',
        'step_roll_order',
        'step_roll',
        'IDlocation',
        'date_ins',
        'username'
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

    public function lotNew(): BelongsTo
    {
        return $this->belongsTo(Lot::class, 'IDlot_new', 'IDlot');
    }

    public function warehouseLocation(): BelongsTo
    {
        return $this->belongsTo(WarehouseLocation::class, 'IDlocation', 'IDlocation');
    }
}
