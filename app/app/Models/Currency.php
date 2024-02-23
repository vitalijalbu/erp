<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Currency extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $keyType = 'string';

    protected $casts = [
        'rounding' => 'float',
    ];
    
    public function bps(): HasMany
    {
        return $this->hasMany(BP::class, 'currency_id', 'id');
    }

    public function round($value) {
        return round($value, log(1/$this->rounding, 10));
    }

    public function detailedRound($value) {
        return round($value, 4);
    }
}
