<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;


class Province extends Model
{
    use HasFactory;
    use Traits\HasCustomId;
    use Traits\LogsActivity;

    protected $table = 'provinces';

    public $timestamps = false;

    public $fillable = [
        'name',
        'code',
        'nation_id'
    ];

    protected static function booted(): void
    {
        static::saving(function (Province $province) {
            if(!DB::transactionLevel()) {
                throw new \Exception("Cannot save province outside of a transaction");
            }

            if($province->isDirty('nation_id')) {
                $province->cities()->update(['nation_id' => $province->nation_id]);
            }
        });

    }

    public function nation(): BelongsTo
    {
        return $this->belongsTo(Nation::class, 'nation_id', 'id');
    }

    public function cities(): HasMany
    {
        return $this->hasMany(City::class, 'province_id', 'id');
    }

    public function scopeByUser(Builder $query, User $user): void 
    {
        $query->where('provinces.company_id', $user->IDcompany);
    }
}
