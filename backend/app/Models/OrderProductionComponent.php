<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderProductionComponent extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'order_production_components';
    
    protected $primaryKey = 'IDcomp';
    
    protected $fillable = [
        'IDord',
        'IDcompany',
        'IDlot',
        'IDitem',
        'qty_expected',
        'auto_lot', 
        'IDStock',
        'qty',
        'username',
        'executed'
    ];
    
    public $timestamps = false;

    public function orderProduction(): BelongsTo
    {
        return $this->belongsTo(OrderProduction::class, 'IDord', 'IDord');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'IDitem', 'IDitem');
    }

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
}
