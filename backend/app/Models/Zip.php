<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;


class Zip extends Model
{
    use HasFactory;
    use Traits\HasCustomId;
    use Traits\LogsActivity;
    
    protected $table = 'zips';

    public $timestamps = false;

    public $fillable = [
        'code',
        'description',
        'city_id'
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class, 'city_id', 'id');
    }

    public function scopeByUser(Builder $query, User $user): void 
    {
        $query->where('zips.company_id', $user->IDcompany);
    }
}
