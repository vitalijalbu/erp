<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Country extends Model
{
    use HasFactory;

    protected $table = 'country';

    protected $primaryKey = 'IDcountry';

    protected $keyType = 'string';

    public $timestamps = false;

    public $fillable = [
        'IDcompany',
        'desc',
    ];

    public $incrementing = false;

    /**
     * Get the company that owns the Country
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'IDcompany', 'IDcompany');
    }

    public function warehouses(): HasMany
    {
        return $this->hasMany(Warehouse::class, 'IDcountry', 'IDcountry');
    }
}
