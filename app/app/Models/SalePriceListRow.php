<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use App\Models\Traits\HasCustomId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use App\Models\Traits\CheckOverlappingDates;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SalePriceListRow extends Model
{
    use HasFactory, HasCustomId, CheckOverlappingDates;

    protected $table = 'sales_price_lists_rows';

    protected $guarded = [
        // 'id',
        'company_id',
        
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_from' => 'date',
        'date_to' => 'date',
        'price' => 'float',
        'quantity' => 'float',
        'width' => 'float',
        'order' => 'integer',
        'is_disabled' => 'boolean'
    ];
    
    public $timestamps = false;

    /**
     * Get the company that owns the SalePriceListRow
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id', 'IDcompany');
    }

    /**
     * Get the item that owns the SalePriceListRow
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id', 'IDitem');
    }

    /**
     * Get the itemGroup that owns the SalePriceListRow
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function itemGroup(): BelongsTo
    {
        return $this->belongsTo(ItemGroup::class, 'item_group_id', 'id');
    }

    /**
     * Get the itemSubfamily that owns the SalePriceListRow
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function itemSubfamily(): BelongsTo
    {
        return $this->belongsTo(ItemSubfamily::class, 'item_subfamily_id', 'id');
    }

    /**
     * Get the salePriceList that owns the SalePriceListRow
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function salePriceList(): BelongsTo
    {
        return $this->belongsTo(SalePriceList::class, 'sales_price_list_id', 'id');
    }

    protected static function booted(): void
    {
        parent::booted();

        static::saved(function (SalePriceListRow $row) {
            $row = $row->refresh();
        });
    }

    public static function exists($companyId, $data, $excludedId = null): Builder
    {
        return 
            SalePriceListRow::where([
                'company_id' => $companyId,
                'is_disabled' => false,
                'sales_price_list_id' => $data['sales_price_list_id']
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
}
