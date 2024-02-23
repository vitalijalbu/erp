<?php

namespace App\Configurator\Configuration;

use App\Configurator\Execution\Plan;
use App\Models\StandardProduct;

class Planner 
{
    public static function getPlanFromEvent(Event $event)
    {
        if($event->getEvent() == EventEnum::Init) {
            return static::initEventPlan($event->getData()['product']);
        }
        elseif($event->getEvent() == EventEnum::FeatureChange) {
            return static::featureChangeEventPlan(
                $event->getData()['product'],
                $event->getData()['feature']
            );
        }
        elseif($event->getEvent() == EventEnum::Complete) {
            return static::completeEventPlan($event->getData()['product']);
        }
        throw new \Exception("Configuration event ".$event->getEvent()->getLabel()." not exists");
    }

    public static function getDescriptionGenerationPlan(StandardProduct $product, $type)
    {
        switch($type) {
            case 'short':
                $constraint = $product->description_constraint_id;
                break;
            case 'long':
                $constraint = $product->long_description_constraint_id;
                break;
            case 'production':
                $constraint = $product->production_description_constraint_id;
                break;
            default:
                throw new \Exception('Invalid description type');
        }

        return new Plan('generic', [
            'constraint' => $constraint
        ]);
    }

    protected static function initEventPlan(StandardProduct $standardProduct)
    {
        $configurationFeatures = $standardProduct->configurationFeatures()
            ->orderBy('position', 'asc')
            ->get();
        $plan = [];
        $constraintTypes = ['activation', 'value', 'validation', 'dataset'];
        foreach($configurationFeatures as $index => $config) {
            $featurePlan = [];
            foreach($constraintTypes as $type) {
                if($config->{$type . '_constraint_id'}) {
                    $featurePlan[$type] = $config->{$type . '_constraint_id'};
                }
            }
            $plan[$index] = [
                'feature' => $config->feature_id,
                'constraints' => $featurePlan
            ];
        }

        return new Plan('configuration', $plan);
    }

    protected static function featureChangeEventPlan(StandardProduct $standardProduct, string $feature)
    {
        $configurationFeatures = $standardProduct->configurationFeatures()
            ->orderBy('position', 'asc')
            ->get();
        $plan = [];
        
        $beforeCurrentFeatureConstraintTypes = ['activation'];
        $currentFeatureConstraintTypes = ['activation', 'validation', 'value'];
        $constraintTypes = ['activation', 'validation', 'dataset', 'value'];

        $featureFound = null;
        foreach($configurationFeatures as $index => $config) {
            
            $featurePlan = [];

            if($config->feature_id == $feature) {
                $featureFound = true;
            }
            //for every feature before te current one, execute only activation constraints
            if(!$featureFound) {
                foreach($beforeCurrentFeatureConstraintTypes as $type) {
                    if($config->{$type . '_constraint_id'} || $type == 'activation') { //if activation is empty pass empty data
                        $featurePlan[$type] = $config->{$type . '_constraint_id'};
                    }
                }
            }
            else {
                //for the current feature we can avoid evaluate activation, value and dataset constraints
                $constraintTypesToUse = $config->feature_id == $feature ? 
                    $currentFeatureConstraintTypes : $constraintTypes;
                foreach($constraintTypesToUse as $type) {
                    if($config->{$type . '_constraint_id'}  || $type == 'activation') { //if activation is empty pass empty data
                        $featurePlan[$type] = $config->{$type . '_constraint_id'};
                    }
                }
            }
            
            if(!empty($featurePlan)) {
                $plan[$index] = [
                    'feature' => $config->feature_id,
                    'constraints' => $featurePlan
                ];
            }
        }

        return new Plan('configuration', $plan);
    }

    protected static function completeEventPlan(StandardProduct $standardProduct)
    {
        return static::initEventPlan($standardProduct);
    }
}