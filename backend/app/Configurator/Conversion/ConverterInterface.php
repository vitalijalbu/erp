<?php

namespace App\Configurator\Conversion;

use App\Models\CustomFunction;
use App\Models\Constraint;

interface ConverterInterface 
{
    public function convertFunction(CustomFunction $function): ?string;

    public function convertConstraint(Constraint $constraint): ?string;

    public function extractDependencies(CustomFunction|Constraint $callable): array;
}