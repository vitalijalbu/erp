<?php

namespace App\Models;

use Illuminate\Support\Facades\Blade;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Address extends Model
{
    use HasFactory;
    use Traits\HasCustomId;
    use Traits\LogsActivity;

    protected $table = 'addresses';

    protected $with = ['nation', 'province', 'city', 'zip'];

    public $timestamps = false;

    public $fillable = [
        'name',
        'province_id',
        'nation_id',
        'city_id',
        'zip_id',
        'address',
        'street_number',
        'timezone',
        'apartment_unit'
    ];

    protected $appends = ['full_address'];

    public function nation(): BelongsTo
    {
        return $this->belongsTo(Nation::class, 'nation_id', 'id');
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class, 'province_id', 'id');
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class, 'city_id', 'id');
    }

    public function zip(): BelongsTo
    {
        return $this->belongsTo(Zip::class, 'zip_id', 'id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id', 'id');
    }

    public function scopeByUser(Builder $query, User $user): void 
    {
        $query->where('addresses.company_id', $user->IDcompany);
    }

    protected function fullAddress(): Attribute
    {
        return Attribute::make(
            get: fn () => array_values(array_filter(array_map(fn($t) => Blade::render($t, ['address' => $this]), [
                '{{ $address->address }}@if($address->street_number) {{ $address->street_number }}@endif',
                '@if($address->apartment_unit) {{ $address->apartment_unit }}@endif',
                '{{ $address->zip->code }}, {{ $address->city->name }}@if($address->province) ({{ $address->province->name }})@endif',
                '{{ $address->nation->name }}'
            ])
        )));
    }

    /**
     * The bp that belong to the Address
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function bp(): BelongsToMany
    {
        return $this->belongsToMany(BP::class, 'bp_addresses', 'address_id', 'bp_id');
    }
}
