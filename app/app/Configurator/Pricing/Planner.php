<?php

namespace App\Configurator\Pricing;

use App\Configurator\Execution\Plan;
use App\Models\Item;
use App\Models\StandardProduct;
use Illuminate\Contracts\Database\Eloquent\Builder;

class Planner 
{
    public static function getItemPlan(Item $item)
    {
        $plan = $item->standardProduct->salePricingGroups()->with([
            'constraints' => function (Builder $query) {
                $query->orderBy('position');
            }])
            ->orderBy('position')
            ->get()
            ->map(fn($group) => 
                $group->constraints->map(fn($c) => [
                    'group' => $c->standard_product_sale_pricing_group_id,
                    'constraint' => $c->constraint_id
                ])
            )
            ->flatten(1)
            ->toArray();
        
        return new Plan('pricing', $plan);
    }

}