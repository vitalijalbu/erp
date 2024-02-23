<?php

namespace App\Models;

use App\Models\Traits\HasCustomId;
use App\Pricing\CurrencyConverter;
use App\Pricing\SalePriceComponent;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleRowPriceComponent extends Model
{
    use HasFactory, HasCustomId;

    public $timestamps = false;

    public $guarded = [
        '*'
    ];

    protected $casts = [
        'quantity' => 'double',
        'price' => 'double',
        'total_price' => 'double',
        'discount' => 'double',
        'total_discount' => 'double',
        'total' => 'double',
        'profit' => 'double',
        'profit_perc' => 'double',
        'cost' => 'double',
        'total_cost' => 'double',
        'width' => 'double'
    ];

    public static function createFromSalePriceComponent(SalePriceComponent $component)
    {
        $obj = new static();
        $obj->forceFill([
            'item_id' => $component->getItem()->IDitem,
            'quantity' => $component->getQuantity(),
            'width' => $component->getWidth(),
            'sales_price_list_id' => $component->getPriceListRow()->sales_price_list_id,
            'sales_price_lists_row_id' => $component->getPriceListRow()->id,
            'price' => $component->getUnitPriceValue(),
            'total_price' => $component->getTotalPriceValue(),
            'sale_discount_matrix_id' => $component->getDiscount()?->sale_discount_matrix_id,
            'sale_discount_matrix_row_id' => $component->getDiscount()?->id,
            'discount' => $component->getDiscountValue(),
            'sale_total_discount_matrix_id' => $component->getTotalDiscount()?->sale_total_discount_matrix_id,
            'sale_total_discount_matrix_row_id' => $component->getTotalDiscount()?->id,
            'total_discount' => $component->getTotalDiscountValue(),
            'total' => $component->getTotal(),
            'standard_product_sale_pricing_group_name' => StandardProductSalePricingGroup::find($component->getGroup())?->name,
            'process_id' => $component->getProcess(),
            'note' => $component->getNote()
        ]);

        return $obj;
    }

    public function calculateProfit($cost, Currency $saleCurrency, ?Currency $companyCurrency = null)
    {
        $this->cost = $companyCurrency->detailedRound($cost);
        $this->total_cost = $companyCurrency->detailedRound($cost * $this->quantity);
        $convertedTotal = CurrencyConverter::convert($this->company, $this->total, $saleCurrency, $companyCurrency);
        $this->profit = $companyCurrency->detailedRound($convertedTotal - $this->total_cost);
        $this->profit_perc = $convertedTotal ? round($this->profit / $convertedTotal * 100, 2) : 0;
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id', 'IDcompany');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id', 'IDitem');
    }

    public function salePriceList(): BelongsTo
    {
        return $this->belongsTo(SalePriceList::class, 'sales_price_list_id', 'id');
    }

    public function salePriceListRow(): BelongsTo
    {
        return $this->belongsTo(SalePriceListRow::class, 'sales_price_list_row_id', 'id');
    }

    public function saleDiscountMatrix(): BelongsTo
    {
        return $this->belongsTo(SaleDiscountMatrix::class, 'sale_discount_matrix_id', 'id');
    }

    public function saleDiscountMatrixRow(): BelongsTo
    {
        return $this->belongsTo(SaleDiscountMatrixRow::class, 'sale_discount_matrix_row_id', 'id');
    }

    public function saleTotalDiscountMatrix(): BelongsTo
    {
        return $this->belongsTo(SaleTotalDiscountMatrix::class, 'sale_total_discount_matrix_id', 'id');
    }

    public function saleTotalDiscountMatrixRow(): BelongsTo
    {
        return $this->belongsTo(SaleTotalDiscountMatrixRow::class, 'sale_total_discount_matrix_row_id', 'id');
    }

    public function process(): BelongsTo
    {
        return $this->belongsTo(Process::class, 'process_id', 'id');
    }
}
