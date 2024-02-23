<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Shipment extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'shipments';
    
    protected $primaryKey = 'IDshipments';

    public $timestamps = false;
    
    protected $fillable = [
        'IDcompany',
        'date_ship',
        'IDlot',
        'qty',
        'IDbp',
        'IDdestination',
        'delivery_note'
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class, 'IDlot', 'IDlot');
    }

    public function BP(): BelongsTo
    {
        return $this->belongsTo(BP::class, 'IDbp', 'IDbp');
    }

    public function BPDestination(): BelongsTo
    {
        return $this->belongsTo(BPDestination::class, 'IDdestination', 'IDdestination');
    }

}
