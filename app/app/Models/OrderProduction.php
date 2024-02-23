<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;


class OrderProduction extends Model
{
    use HasFactory;
    use Traits\HasCustomId;
    
    protected $table = 'order_production';
    
    protected $primaryKey = 'IDord';
    
    protected $fillable = [
        'IDcompany',
        'IDlot',
        'IDwarehouse',
        'IDlocation',
        'qty', 
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

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'IDwarehouse', 'IDwarehouse');
    }

    public function warehouseLocation(): BelongsTo
    {
        return $this->belongsTo(WarehouseLocation::class, 'IDlocation', 'IDlocation');
    }

    public function orderProductionComponents(): HasMany
    {
        return $this->hasMany(OrderProduction::class, 'IDord', 'IDord');
    }
}
