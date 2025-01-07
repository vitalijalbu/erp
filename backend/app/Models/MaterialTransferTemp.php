<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterialTransferTemp extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'material_transfer_temp';
    
    protected $primaryKey = 'IDtrans';
    
    protected $fillable = [
        'IDcompany',
        'username', 
        'qty',
        'IDStock',
        'date_ins'
    ];
    
    public $timestamps = false;

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }

    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class, 'IDStock', 'IDstock');
    }
}
