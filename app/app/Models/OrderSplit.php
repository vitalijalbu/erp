<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderSplit extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'order_split';
    
    protected $primaryKey = 'IDord';
    
    protected $fillable = [
        'IDcompany',
        'IDlot',
        'IDstock',
        'IDwarehouse',
        'IDlocation',
        'qty_ori',
        'username',
        'date_creation',
        'date_executed',
        'executed'
    ];

    public $timestamps = false;

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class, 'IDlot', 'IDlot');
    }

    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class, 'IDstock', 'IDstock');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'IDwarehouse', 'IDwarehouse');
    }

    public function warehouseLocation(): BelongsTo
    {
        return $this->belongsTo(WarehouseLocation::class, 'IDlocation', 'IDlocation');
    }

    /**
     * Get all of the splitRows for the OrderSplit
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function splitRows(): HasMany
    {
        return $this->hasMany(OrderSplitRow::class, 'IDord', 'IDord');
    }
}
