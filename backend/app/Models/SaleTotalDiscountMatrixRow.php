<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use App\Models\Traits\HasCustomId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SaleTotalDiscountMatrixRow extends Model
{
    use HasFactory, HasCustomId;

    public $timestamps = false;

    public $fillable = [
        'position',
        'bp_id',
        'bp_group_id',
        'item_id',
        'item_group_id',
        'item_subfamily_id',
        'service_item_id',
        'quantity',
        'width',
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

    public function bp(): BelongsTo
    {
        return $this->belongsTo(BP::class, 'bp_id', 'IDbp');
    }

    public function bpGroup(): BelongsTo
    {
        return $this->belongsTo(BPGroup::class, 'bp_group_id', 'id');
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

    public function serviceItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'service_item_id', 'IDitem');
    }

    public function saleTotalDiscountMatrix(): BelongsTo
    {
        return $this->belongsTo(SaleDiscountMatrix::class, 'sale_total_discount_matrix_id', 'id');
    }

    public function scopeByItem(Builder $query, Item $item): void 
    {
        $query->where(function($sub) use ($item) {
            return $sub->where(function($q) use ($item) {
                    $q->where('item_id', $item->IDitem)
                        ->when($item->itemGroup, function($q) use ($item) {
                            return $q->orWhere('item_group_id', $item->itemGroup->id);
                        })
                        ->when($item->item_subgroup, function($q) use ($item) {
                            return $q->orWhere('item_subfamily_id', $item->item_subgroup);
                        });
                })
                ->orWhere(function($q) {
                    $q->whereNull('item_id')->whereNull('item_group_id')->whereNull('item_subfamily_id');
                });
                
        });
    }

    public function scopeByBP(Builder $query, BP $bp): void 
    {
        $query->where(function($sub) use ($bp) {
            $sub->where(function($q) use ($bp) {
                $q->where('bp_id', $bp->IDbp);
                if($bp->bp_group_id) {
                    $q->orWhere('bp_group_id', $bp->bp_group_id);
                }
            })
            ->orWhere(function($q) {
                $q->whereNull('bp_id')->whereNull('bp_group_id');
            });
        });
    }

    public function scopeValid(Builder $query): void 
    {
        $query->where('is_disabled', false);
    }

    protected static function booted(): void
    {
        parent::booted();

        static::saved(function (SaleTotalDiscountMatrixRow $row) {
            $row = $row->refresh();
        });
    }

    public static function exists($companyId, $data, $excludedId = null): Builder
    {
        return 
            SaleTotalDiscountMatrixRow::where([
                'company_id' => $companyId,
                'is_disabled' => false,
                'sale_total_discount_matrix_id' => $data['sale_total_discount_matrix_id']
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
                isset($data['width']), 
                function($q) use ($data){
                    $q->where('width', $data['width']);
                },
                function($q) {
                    $q->whereNull('width');
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
            ->when(
                isset($data['bp_id']), 
                function($q) use ($data){
                    $q->where('bp_id', $data['bp_id']);
                },
                function($q) {
                    $q->whereNull('bp_id');
                }
            )
            ->when(
                isset($data['bp_group_id']), 
                function($q) use ($data){
                    $q->where('bp_group_id', $data['bp_group_id']);
                },
                function($q) {
                    $q->whereNull('bp_group_id');
                }
            )
            ->when(
                isset($data['service_item_id']), 
                function($q) use ($data){
                    $q->where('service_item_id', $data['service_item_id']);
                },
                function($q) {
                    $q->whereNull('service_item_id');
                }
            )
            ->when($excludedId, function($q) use ($excludedId){
                $q->where('id', '<>', $excludedId);
            });
    }
}
