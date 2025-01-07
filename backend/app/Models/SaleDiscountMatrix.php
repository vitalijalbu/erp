<?php

namespace App\Models;

use App\Models\Traits\HasCustomId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SaleDiscountMatrix extends Model
{
    use HasFactory, HasCustomId;
    
    public $timestamps = false;

    public $fillable = [
        'is_disabled',
        'priority',
        'description',
        'currency_id',
        'bp_id',
        'sales_price_list_id'
    ];

    protected $casts = [
        'is_disabled' => 'boolean'
    ];

    protected static function booted(): void
    {
        parent::booted();

        static::saved(function (SaleDiscountMatrix $row) {
            $row = $row->refresh();
        });
    }

    public function rows(): HasMany
    {
        return $this->hasMany(SaleDiscountMatrixRow::class, 'sale_discount_matrix_id', 'id');
    }

    public function salePriceList(): BelongsTo
    {
        return $this->belongsTo(SalePriceList::class, 'sales_price_list_id', 'id');
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency_id', 'id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id', 'IDcompany');
    }

    public function bp(): BelongsTo
    {
        return $this->belongsTo(BP::class, 'bp_id', 'IDbp');
    }

    public static function exists($companyId, $data, $excludedId = null): Builder
    {
        return 
            SaleDiscountMatrix::where([
                'company_id' => $companyId,
                'priority' => $data['priority'],
                'is_disabled' => false
            ])
            ->when(
                isset($data['bp_id']), 
                function($q) use ($data){
                    $q->where('bp_id', $data['bp_id']);
                },
                function($q){
                    $q->whereNull('bp_id');
                },
            )
            ->when(
                isset($data['currency_id']), 
                function($q) use ($data){
                    $q->where('currency_id', $data['currency_id']);
                },
                function($q){
                    $q->whereNull('currency_id');
                },
            )
            ->when(
                isset($data['sales_price_list_id']), 
                function($q) use ($data){
                    $q->where('sales_price_list_id', $data['sales_price_list_id']);
                },
                function($q){
                    $q->whereNull('sales_price_list_id');
                },
            )
            ->when($excludedId, function($q) use ($excludedId){
                $q->where('id', '<>', $excludedId);
            });
    }
}
