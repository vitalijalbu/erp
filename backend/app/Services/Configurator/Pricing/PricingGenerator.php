<?php

namespace App\Services\Configurator\Pricing;

use App\Configurator\Debug\DevTools;
use App\Configurator\Exception\ConfiguratorException;
use App\Configurator\Execution\EngineClientInterface;
use App\Models\Item;
use App\Configurator\Pricing\Planner;
use App\Models\BP;
use App\Models\StandardProductSalePricingGroup;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class PricingGenerator
{

    public static function generate(
        Item $item,
        BP $bp,
        $quantity
    ): array
    {
        if(!$item->configured_item) {
            throw new \Exception("Item is not a configured product");
        }
        
        $engineClient = app()->make(EngineClientInterface::class);
        $plan = Planner::getItemPlan($item);
        
        $execution = $engineClient->execute($plan, [
            'product' => $item->standardProduct,
            'configuration' => $item->getConfigurationFeatures(),
            'item' => $item,
            'bp' => $bp,
            'quantity' => $quantity,
            'user' => auth()->user()
        ],  ['debug' => config('engine.debug', true)]); 

        if(!$execution['status'] || !isset($execution['data']['pricing'])) {
            Log::channel('configurator')->error("Cannot generate Pricing");
            Log::channel('configurator')->error($item);
            Log::channel('configurator')->error($execution);
            throw new ConfiguratorException(sprintf("Cannot generate pricing for item %s", $item->standardProduct->name));
        }

        $components = $execution['data']['pricing'];

        $validator = Validator::make($components, [
            '*.item' => [
                'required', 
                'string',
                function($attribute, $value, $fail) use ($components, $item) {
                    [$index, $field] = explode(".", $attribute);
                    $field = $components[$index]['field'] ?? null;
                    if($field == 'code') {
                        $field = 'item';
                    }
                    elseif($field == 'id') {
                        $field = 'IDitem';
                    }
                    else {
                        $fail("Cannot find the item with the provided field");
                    }
                    if(!Item::where($field, $value)->where(function($query) use ($item) {
                        $query->where('IDcompany', $item->IDcompany)
                            ->orWhere('IDcompany', 0);
                    })->first()) {
                        $fail("Cannot find the item {$value} by {$field}");
                    }
                }
            ],
            '*.field' => [
                'required',
                'string',
                Rule::in(['id', 'code']),
            ],
            '*.qty' => [
                'required',
                'decimal:0,4',
            ],
            '*.width' => [
                'sometimes',
                'nullable',
                'decimal:0,4',
            ],
            '*.min_price' => [
                'sometimes',
                'nullable',
                'decimal:0,4',
            ],
            '*.notes' => [
                'sometimes',
                'nullable',
                'string',
            ],
            '*.group' => [
                'required',
                'integer',
                Rule::exists(StandardProductSalePricingGroup::class, 'id')->where('standard_product_id', $item->standardProduct->id)
            ],
        ]);

        if($validator->fails()) {
            Log::channel('configurator')->error(sprintf("Pricing data for item %s contains invalid data", $item->standardProduct->name));
            Log::channel('configurator')->error($validator->errors()->toArray());
            Log::channel('configurator')->error($components);
            DevTools::emit('error', 400, [
                'error' => sprintf("Pricing data for item %s contains invalid data", $item->standardProduct->name),
                'validation_errors' => $validator->errors()->toArray(),
                'pricing' => $components
            ]);
            throw new ConfiguratorException(sprintf("Pricing data for item %s contains invalid data", $item->standardProduct->name));
        }

        return $components;
    }

}