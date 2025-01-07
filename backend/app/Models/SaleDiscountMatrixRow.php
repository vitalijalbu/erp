<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use App\Models\Traits\HasCustomId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use App\Models\Traits\CheckOverlappingDates;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SaleDiscountMatrixRow extends Model
{
    use HasFactory, HasCustomId, CheckOverlappingDates;

    public $timestamps = false;

    public $fillable = [
        'position',
        'item_id',
        'item_group_id',
        'item_subfamily_id',
        'quantity',
        'date_from',
        'date_to', 
        'note', 
        'value',
        'is_disabled'
    ];

    protected $casts = [
        'is_disabled' => 'boolean',
        'value' => 'double'
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id', 'IDcompany');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id', 'IDitem');
    }

    public function itemGroup(): BelongsTo
    {
        return $this->belongsTo(ItemGroup::class, 'item_group_id', 'id');
    }

    public function itemSubfamily(): BelongsTo
    {
        return $this->belongsTo(ItemSubfamily::class, 'item_subfamily_id', 'id');
    }

    public function saleDiscountMatrix(): BelongsTo
    {
        return $this->belongsTo(SaleDiscountMatrix::class, 'sale_discount_matrix_id', 'id');
    }

    public function scopeByItem(Builder $query, Item $item): void 
    {
        $query->where(function($sub) use ($item) {
            return $sub->where('item_id', $item->IDitem)
                ->when($item->itemGroup, function($q) use ($item) {
                    return $q->orWhere('item_group_id', $item->itemGroup->id);
                })
                ->when($item->item_subgroup, function($q) use ($item) {
                    return $q->orWhere('item_subfamily_id', $item->item_subgroup);
                });
        });
    }

    public function scopeValid(Builder $query): void 
    {
        $query->where('is_disabled', false)
            ->where(function($sub) {
                return $sub->whereNull('date_from')->orWhereDate('date_from', '<=', Carbon::now());
            })
            ->where(function($sub) {
                return $sub->whereNull('date_to')->orWhereDate('date_to', '>=', Carbon::now());
            });
    }

    protected static function booted(): void
    {
        parent::booted();

        static::saved(function (SaleDiscountMatrixRow $row) {
            $row = $row->refresh();
        });
    }

    public static function exists($companyId, $data, $excludedId = null): Builder
    {
        return 
            SaleDiscountMatrixRow::where([
                'company_id' => $companyId,
                'is_disabled' => false,
                'sale_discount_matrix_id' => $data['sale_discount_matrix_id']
            ])
            ->when(
                isset($data['quantity']), 
                function($q) use ($data){
                    $q->where('quantity', $data['quantity']);
                },
                function($q) {
                    $q->whereNull('quantity');
                }
            )
            ->when(
                isset($data['item_id']), 
                function($q) use ($data){
                    $q->where('item_id', $data['item_id']);
                },
                function($q) {
                    $q->whereNull('item_id');
                }
            )
            ->when(
                isset($data['item_group_id']), 
                function($q) use ($data){
                    $q->where('item_group_id', $data['item_group_id']);
                },
                function($q) {
                    $q->whereNull('item_group_id');
                }
            )
            ->when(
                isset($data['item_subfamily_id']), 
                function($q) use ($data){
                    $q->where('item_subfamily_id', $data['item_subfamily_id']);
                },
                function($q) {
                    $q->whereNull('item_subfamily_id');
                }
            )
            ->when($excludedId, function($q) use ($excludedId){
                $q->where('id', '<>', $excludedId);
            });
    }
}
