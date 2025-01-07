<?php

namespace App\Services\Configurator\Configuration;

use App\Configurator\Configuration\Planner;
use App\Configurator\Execution\EngineClientInterface;
use App\Models\StandardProduct;
use Illuminate\Support\Facades\Log;

class ItemDescriptionGenerator
{

    public static function generateDescription(
        StandardProduct $product,
        $configuration
    )
    {
        return static::generate($product, $configuration, 'short');
    }


    public static function generateLongDescription(
        StandardProduct $product,
        $configuration
    )
    {
        return static::generate($product, $configuration, 'long');
    }


    public static function generateProductionDescription(
        StandardProduct $product,
        $configuration
    )
    {
        return static::generate($product, $configuration, 'production');
    }


    protected static function generate(
        StandardProduct $product,
        $configuration,
        $type
    )
    {
        $engineClient = app()->make(EngineClientInterface::class);
        if(!in_array($type, ['short', 'long', 'production'])) {
            throw new \Exception('Invalid description type');
        }
        $plan = Planner::getDescriptionGenerationPlan($product, $type);
        
        if(!($plan->getData()['constraint'] ?? false)) {
            return null;
        }
        
        $execution = $engineClient->execute($plan, [
            'product' => $product,
            'configuration' => $configuration,
            //'item' => $item,
            'user' => auth()->user(),
        ],  ['debug' => config('engine.debug', true)]); 


        if(!$execution['status'] || !isset($execution['data']['return'])) {
            Log::channel('configurator')->error(sprintf("Cannot generate Item %s description", $type));
            Log::channel('configurator')->error($product);
            Log::channel('configurator')->error($configuration);
            Log::channel('configurator')->error($execution);
            return false;
        }

        if(!is_scalar($execution['data']['return'])) {
            Log::channel('configurator')->error(sprintf("Constraint for description of the item %s must return a string", $product->name));
            return false;
        }

        return (string) $execution['data']['return'];

    }

}