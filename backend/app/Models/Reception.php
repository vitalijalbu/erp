<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class Reception extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'receptions';
    
    protected $primaryKey = 'IDreception';
    
    protected $fillable = [
        'IDcompany',
        'IDlot',
        'IDlot_fornitore',
        'date_rec',
        'qty',
        'username',
        'IDbp',
        'ord_rif'
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class, 'IDlot', 'IDlot');
    }

    public function lotFornitore(): BelongsTo
    {
        return $this->belongsTo(Lot::class, 'IDlot_fornitore', 'IDlot');
    }

    public function BP(): BelongsTo
    {
        return $this->belongsTo(BP::class, 'IDbp', 'IDbp');
    }

}
