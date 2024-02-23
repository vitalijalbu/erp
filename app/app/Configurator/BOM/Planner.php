<?php

namespace App\Configurator\BOM;

use App\Configurator\Execution\Plan;
use App\Models\Item;
use App\Models\StandardProduct;

class Planner 
{
    public static function getItemPlan(Item $item)
    {
        $plan = $item->standardProduct->BOMRules()->orderBy('position')
            ->get()
            ->map(fn($r) => ['constraint' => $r->constraint_id])
            ->toArray();
        
        return new Plan('bom', $plan);
    }

}