<?php

namespace App\Pricing;

use App\Models\Item;
use App\Models\SaleTotalDiscountMatrixRow;

class SalePrice
{
    protected Item $item;
    protected $quantity;
    protected $components = [];
    protected ?SaleTotalDiscountMatrixRow $totalDiscountMatrixRow = null;

    public function __construct(Item $item, $quantity)
    {
        $this->item = $item;
        $this->quantity = $quantity;
    }

    public function addComponent(SalePriceComponent|array $component) 
    {
        if(!is_array($component)) {
            $component = [$component];
        }
        $this->components = [...$this->components, ...$component];
    }

    public function getComponents() 
    {
        return $this->components;
    }

    public function setUsedTotalDiscount(SaleTotalDiscountMatrixRow $totalDiscount)
    {
        $this->totalDiscountMatrixRow = $totalDiscount;
    }

    public function getUsedTotalDiscount(): ?SaleTotalDiscountMatrixRow
    {
        return $this->totalDiscountMatrixRow;
    }

    //unit price without discounts
    public function getPrice()
    {
        return array_reduce($this->components, fn($total, $c) => $total + $c->getTotalPriceValue(), 0);
    }

    //unit price with discounts
    public function getFinalPrice()
    {
        return array_reduce($this->components, fn($total, $c) => $total + $c->getTotal(), 0);
    }

    //total amount fo discount for single unit
    public function getDiscount()
    {
        return array_reduce($this->components, fn($total, $c) => $total + $c->getDiscountValue() + $c->getTotalDiscountValue(), 0);
    }

    //unit price without discounts
    public function getTotalPrice()
    {
        return $this->getPrice() * $this->quantity;
    }

    //unit price with discounts
    public function getTotalFinalPrice()
    {
        return $this->getFinalPrice() * $this->quantity;
    }

    //total amount fo discount for single unit
    public function getTotalDiscount()
    {
        return $this->getDiscount() * $this->quantity;
    }

}