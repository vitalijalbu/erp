<?php

namespace App\Configurator\Execution;

interface EngineClientInterface 
{
    public function execute(Plan $plan, array $context, array $options = []);

    public function callFunction(string $function, array $args = [], array $options = []);
}