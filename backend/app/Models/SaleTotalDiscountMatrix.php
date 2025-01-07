<?php

namespace App\Models;

use App\Models\Traits\HasCustomId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SaleTotalDiscountMatrix extends Model
{
    use HasFactory, HasCustomId;
    
    public $timestamps = false;

    public $fillable = [
        'is_disabled',
        'priority',
        'description',
        'currency_id',
    ];

    protected $casts = [
        'is_disabled' => 'boolean'
    ];

    public function rows(): HasMany
    {
        return $this->hasMany(SaleTotalDiscountMatrixRow::class, 'sale_total_discount_matrix_id', 'id');
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency_id', 'id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id', 'IDcompany');
    }

    protected static function booted(): void
    {
        parent::booted();

        static::saved(function (SaleTotalDiscountMatrix $row) {
            $row = $row->refresh();
        });
    }

    public static function exists($companyId, $data, $excludedId = null): Builder
    {
        return 
            SaleTotalDiscountMatrix::where([
                'company_id' => $companyId,
                'priority' => $data['priority'],
                'is_disabled' => false
            ])
            ->when(
                isset($data['currency_id']), 
                function($q) use ($data){
                    $q->where('currency_id', $data['currency_id']);
                },
                function($q){
                    $q->whereNull('currency_id');
                },
            )
            ->when($excludedId, function($q) use ($excludedId){
                $q->where('id', '<>', $excludedId);
            });
    }

}
