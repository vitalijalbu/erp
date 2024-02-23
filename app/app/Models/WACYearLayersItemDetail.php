<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;


class WACYearLayersItemDetail extends Model
{
    use HasFactory;
    use Traits\HasCustomId;
    
    protected $table = 'WAC_year_layers_item_detail';
    
    protected $primaryKey = 'IDlayer_detail';
    
    protected $fillable = [
        'IDcompany',
        'IDitem',
        'item',
        'year_layer',
        'stock_qty_start_layer',
        'stock_value_start_year',
        'purchasedQty_on_the_year',
        'purchasedItemValue_on_the_year',
        'stock_qty_end_year',
        'stock_value_end_year',
        'wac_avg_cost',
        'conf_item'
    ];
    
    public $timestamps = false;

    protected static function booted(): void
    {
        parent::booted();

    }
    
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }
 
}
