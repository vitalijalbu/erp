<?php

namespace App\Services\Configurator\Routing;

use App\Configurator\Debug\DevTools;
use App\Configurator\Exception\ConfiguratorException;
use App\Configurator\Execution\EngineClientInterface;
use App\Models\Item;
use App\Configurator\Routing\Planner;
use App\Models\Process;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class RoutingGenerator
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

        if(!$execution['status'] || !isset($execution['data']['routing'])) {
            Log::channel('configurator')->error("Cannot generate routing");
            Log::channel('configurator')->error($item);
            Log::channel('configurator')->error($execution);
            throw new ConfiguratorException(sprintf("Cannot generate routing for item %s", $item->standardProduct->name));
        }

        $routing = $execution['data']['routing'];

        $validator = Validator::make($routing, [
            '*.process' => [
                'required', 
                'string',
                Rule::exists(Process::class, 'id')->where('company_id', $item->IDcompany)
            ],
            '*.quantity' => [
                'required', 
                'decimal:0,4',
                'min:0',
            ],
            '*.note' => [
                'nullable', 
                'string',
                'max:255',
            ],
        ]);
        
        if($validator->fails()) {
            $error = sprintf("Routing data for item %s contains invalid data", $item->standardProduct->name);
            Log::channel('configurator')->error($error);
            Log::channel('configurator')->error($validator->errors()->toArray());
            Log::channel('configurator')->error($routing);
            DevTools::emit('error', 400, [
                'error' => sprintf("Routing data for item %s contains invalid data", $item->standardProduct->name),
                'validation_errors' => $validator->errors()->toArray(),
                'routing' => $routing
            ]);
            throw new ConfiguratorException($error);
        }

        return $routing;
    }

}