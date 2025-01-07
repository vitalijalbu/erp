<?php

namespace App\Configurator\Routing;

use App\Configurator\Execution\Plan;
use App\Models\Item;

class Planner 
{
    public static function getItemPlan(Item $item)
    {
        $plan = $item->standardProduct->routings()->orderBy('position')
            ->get()
            ->map(fn($r) => [
                'routing_id' => $r->id,
                'process' => $r->process,
                'constraints' => [
                    'activation' => $r->activation_constraint_id,
                ]
            ])
            ->toArray();
        
        return new Plan('routing', $plan);
    }

}