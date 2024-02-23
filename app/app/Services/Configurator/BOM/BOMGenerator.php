<?php

namespace App\Services\Configurator\BOM;

use App\Configurator\Execution\EngineClientInterface;
use App\Models\Item;
use App\Models\StandardProduct;
use App\Models\User;
use App\Configurator\BOM\Planner;
use App\Configurator\Debug\DevTools;
use App\Configurator\Exception\ConfiguratorException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class BOMGenerator
{

    public static function generate(
        Item $item,
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
            'user' => auth()->user()
        ],  ['debug' => config('engine.debug', true)]); 

        if(!$execution['status'] || !isset($execution['data']['bom'])) {
            Log::channel('configurator')->error("Cannot generate BOM");
            Log::channel('configurator')->error($item);
            Log::channel('configurator')->error($execution);
            throw new ConfiguratorException(sprintf("Cannot generate BOM for item %s", $item->standardProduct->name));
        }

        $bom = $execution['data']['bom'];

        $validator = Validator::make($bom, [
            '*.item' => [
                'required', 
                'string',
                function($attribute, $value, $fail) use ($bom, $item) {
                    [$index, $field] = explode(".", $attribute);
                    $field = $bom[$index]['field'] ?? null;
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
            '*.qty' => [
                'required',
                'decimal:0,4',
            ],
            '*.process' => [
                'required',
                Rule::exists('processes', 'id')
            ]
        ]);
        
        if($validator->fails()) {
            Log::channel('configurator')->error(sprintf("BOM data for item %s contains invalid data", $item->standardProduct->name));
            Log::channel('configurator')->error($validator->errors()->toArray());
            Log::channel('configurator')->error($bom);
            DevTools::emit('error', 400, [
                'error' => sprintf("BOM data for item %s contains invalid data", $item->standardProduct->name),
                'validation_errors' => $validator->errors()->toArray(),
                'bom' => $bom
            ]);
            throw new ConfiguratorException(sprintf("BOM data for item %s contains invalid data", $item->standardProduct->name));
        }

        return $bom;
    }

}