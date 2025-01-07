<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;


class City extends Model
{
    use HasFactory;
    use Traits\HasCustomId;
    use Traits\LogsActivity;

    protected $table = 'cities';

    public $timestamps = false;

    public $fillable = [
        'name',
        'province_id',
        'nation_id'
    ];

    public function nation(): BelongsTo
    {
        return $this->belongsTo(Nation::class, 'nation_id', 'id');
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class, 'province_id', 'id');
    }

    public function zips(): hasMany
    {
        return $this->hasMany(Zip::class, 'city_id', 'id');
    }

    public function scopeByUser(Builder $query, User $user): void 
    {
        $query->where('cities.company_id', $user->IDcompany);
    }
}
