<?php

namespace App\Pricing;

use App\Models\Item;
use App\Models\Currency;
use App\Models\SaleDiscountMatrixRow;
use App\Models\SalePriceListRow;
use App\Models\SaleTotalDiscountMatrixRow;

class SalePriceComponent
{
    protected SalePriceListRow $priceListRow;
    protected Item $item;
    protected $quantity;
    protected $width;
    protected $unitBasePrice;
    protected $group = null;
    protected $process = null;
    protected ?SaleDiscountMatrixRow $discountMatrixRow = null;
    protected $discount = null;
    protected ?SaleTotalDiscountMatrixRow $totalDiscountMatrixRow = null;
    protected $totalDiscount = null;
    protected $note = null;
    protected Currency $currency;

    public function __construct(Item $item, SalePriceListRow $priceListRow, $quantity, $width, Currency $currency)
    {
        $this->item = $item;
        $this->priceListRow = $priceListRow;
        $this->unitBasePrice = $this->priceListRow->price;
        $this->quantity = $quantity;
        $this->width = $width;
        $this->currency = $currency;
    }

    public function getItem(): Item
    {
        return $this->item;
    }

    public function getPriceListRow(): SalePriceListRow
    {
        return $this->priceListRow;
    }

    public function getUnitPriceValue()
    {
        return $this->unitBasePrice;
    }

    public function getTotalPriceValue()
    {
        return $this->currency->detailedRound($this->getUnitPriceValue() * $this->getQuantity());
    }

    public function getQuantity()
    {
        return $this->quantity;
    }

    public function getWidth()
    {
        return $this->width;
    }

    public function setGroup($groupId) 
    {
        $this->group = $groupId;
    }

    public function getGroup()
    {
        return $this->group;
    }

    public function setProcess($processId) 
    {
        $this->process = $processId;
    }

    public function getProcess()
    {
        return $this->process;
    }

    public function setNote($note) 
    {
        $this->note = $note;
    }

    public function getNote()
    {
        return $this->note;
    }

    public function applyDiscount(SaleDiscountMatrixRow $discount)
    {
        $this->discountMatrixRow = $discount;
        $this->discount = $this->discountMatrixRow->value;
    }

    public function getDiscount(): ?SaleDiscountMatrixRow
    {
        return $this->discountMatrixRow;
    }

    public function getDiscountValue()
    {
        return $this->discount ? $this->currency->detailedRound(($this->getTotalPriceValue() / 100 * $this->discount)) : null;
    }

    public function applyTotalDiscount(float|SaleTotalDiscountMatrixRow $discount)
    {
        if($discount instanceof SaleTotalDiscountMatrixRow) {
            $this->totalDiscountMatrixRow = $discount;
            $this->totalDiscount = $this->totalDiscountMatrixRow->value;
        }
        else {
            $this->totalDiscount = $discount;
        }
    }

    public function getTotalDiscount(): ?SaleTotalDiscountMatrixRow
    {
        return $this->totalDiscountMatrixRow;
    }

    public function getTotalDiscountValue()
    {
        return $this->totalDiscount ? $this->currency->detailedRound(($this->getTotalPriceValue() + $this->getDiscountValue()) / 100 * $this->totalDiscount) : null;
    }

    public function getTotal()
    {
        return $this->currency->detailedRound($this->getTotalPriceValue() + $this->getDiscountValue() + $this->getTotalDiscountValue());
    }
}