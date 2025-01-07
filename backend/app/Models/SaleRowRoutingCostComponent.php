<?php

namespace App\Models;

use App\Models\Traits\HasCustomId;
use App\Pricing\SalePriceComponent;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleRowRoutingCostComponent extends Model
{
    use HasFactory, HasCustomId;

    public $timestamps = false;

    public $guarded = [
        '*'
    ];

    public static function createFromSalePriceComponent(SalePriceComponent $component)
    {
        $obj = new static();
        $obj->forceFill([
            'item_id' => $component->getItem()->IDitem,
            'quantity' => $component->getQuantity(),
            'sales_price_list_id' => $component->getPriceListRow()->sales_price_list_id,
            'sales_price_lists_row_id' => $component->getPriceListRow()->id,
            'price' => $component->getUnitPriceValue(),
            'total_price' => $component->getTotalPriceValue(),
            'sale_discount_matrix_id' => $component->getDiscount()?->sale_discount_matrix_id,
            'sale_discount_matrix_row_id' => $component->getDiscount()?->id,
            'discount' => $component->getDiscountValue(),
            'total' => $component->getTotal(),
            'process_id' => $component->getProcess(),
            'note' => $component->getNote()
        ]);

        return $obj;
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

    public function process(): BelongsTo
    {
        return $this->belongsTo(Process::class, 'process_id', 'id');
    }
}
