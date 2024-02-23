<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LotNumeriPrimi extends Model
{
    use HasFactory;
    use Traits\HasCustomId;

    protected $table = 'lot_numeri_primi';

    protected $primaryKey = 'id';

    public $timestamps = false;

    public $fillable = [
        'IDcompany',
        'comp_code',
        'country_code',
        'type',
        'year_n',
        'incrementale',
    ];

    /**
     * Get the company that owns the Lot
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }
}
