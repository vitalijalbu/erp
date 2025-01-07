<?php

namespace App\Pricing;

use App\Models\Item;

class RoutingCost
{
    protected Item $item;
    protected $quantity;
    protected $components = [];

    public function __construct(Item $item)
    {
        $this->item = $item;
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

    //unit routing cost without discounts
    public function getCost()
    {
        return array_reduce($this->components, fn($total, $c) => $total + $c->getTotalPriceValue(), 0);
    }

}