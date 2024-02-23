<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class ExchangeRate extends Model
{
    use HasFactory;

    protected $table = 'exchange_rates';

    public $timestamps = false;

    public $fillable = [
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id', 'IDcompany');
    }

    public function companyCurrency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'company_currency_id', 'id');
    }

    public function foreignCurrency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'foreign_currency_id', 'id');
    }
    
}
