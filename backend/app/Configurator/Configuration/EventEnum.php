<?php

namespace App\Configurator\Configuration;

enum EventEnum: string
{
    case Init = 'init';
    case FeatureChange = 'feature_change';
    case Complete = 'complete';
}