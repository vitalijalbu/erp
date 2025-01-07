<?php

namespace App\Services\Configurator\Configuration;

use App\Configurator\Execution\EngineClientInterface;
use App\Models\StandardProduct;
use App\Models\User;

class ConfigurationEvent
{

    public static function initEvent(
        StandardProduct $product,
        $configuration,
        $bpId = null,
    ): array|false
    {
        $engineClient = app()->make(EngineClientInterface::class);
        $event = new \App\Configurator\Configuration\Event(
            \App\Configurator\Configuration\EventEnum::Init, 
            ['product' => $product]
        );
        $plan = \App\Configurator\Configuration\Planner::getPlanFromEvent($event);
        $execution = $engineClient->execute($plan, [
            'user' => auth()->user(),
            'product' => $product,
            'bp' => $bpId,
            'configuration' => $configuration
        ],  ['debug' => config('engine.debug', true)]); 

        return $execution;
    }

    public static function eventEvent(
        StandardProduct $product,
        $configuration,
        $event,
        $eventData,
        $bpId = null,
    ): array|false
    {
        $engineClient = app()->make(EngineClientInterface::class);
        $event = new \App\Configurator\Configuration\Event(
            \App\Configurator\Configuration\EventEnum::from($event), 
            $eventData + [
                'product' => $product,
            ]
        );

        $plan = \App\Configurator\Configuration\Planner::getPlanFromEvent($event);
        
        $execution = $engineClient->execute($plan, [
            'user' => auth()->user(),
            'product' => $product,
            'bp' => $bpId,
            'configuration' => $configuration,
        ],  ['debug' => config('engine.debug', true)]); 

        return $execution;
    }


    public static function completeEvent(
        StandardProduct $product,
        $configuration,
        $bpId = null,
    ): array|false
    {
        $engineClient = app()->make(EngineClientInterface::class);
        $event = new \App\Configurator\Configuration\Event(
            \App\Configurator\Configuration\EventEnum::Complete, 
            ['product' => $product]
        );

        $plan = \App\Configurator\Configuration\Planner::getPlanFromEvent($event);
        
        $execution = $engineClient->execute($plan, [
            'user' => auth()->user(),
            'product' => $product,
            'bp' => $bpId,
            'configuration' => $configuration,
        ], ['debug' => config('engine.debug', true)]); 

        return $execution;
    }
}