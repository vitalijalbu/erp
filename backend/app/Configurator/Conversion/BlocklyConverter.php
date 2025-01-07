<?php

namespace App\Configurator\Conversion;

use App\Configurator\Debug\DevTools;
use App\Models\CustomFunction;
use App\Models\Constraint;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Log;


class BlocklyConverter implements ConverterInterface
{
    public function convertFunction(CustomFunction $function): ?string
    {
        $result = Process::run(
            ['node', config('conversion.converter_bin'), 'convert-function', json_encode($function)]
        );
        if($result->successful()) {
            $code = $result->output();
            $verifyResult = Process::input($code)->run(['php', '-l']);
            if($verifyResult->successful()) {
                return $code;
            }
        }
        //dd($result->errorOutput());
        Log::critical("Error during function conversion");
        Log::critical($result->errorOutput());
        DevTools::emit('error', 422, ['error' => $result->errorOutput()]);

        throw new CodeConversionException("Error during the code compilation of the function $function->id");
    }

    public function convertConstraint(Constraint $constraint): ?string
    {
        $result = Process::run(
            ['node', config('conversion.converter_bin'), 'convert-constraint', json_encode($constraint)]
        );
        if($result->successful()) {
            $code = $result->output();
            $verifyResult = Process::input($code)->run(['php', '-l']);
            if($verifyResult->successful()) {
                return $code;
            }
        }
        //dd($result->errorOutput());
        Log::critical("Error during constraint conversion");
        Log::critical($result->errorOutput());
        DevTools::emit('error', 422, ['error' => $result->errorOutput()]);

        throw new CodeConversionException("Error during the code compilation of the constraint $constraint->id");
    }

    public function extractDependencies(CustomFunction|Constraint $callable): array
    {
        $deps = [];
        $body = $callable->body ?? [];
        
        $depFinder = function($item, $key) use (&$deps, &$depFinder) {
            if(($item['type'] ?? null) == "call_function") {
                if(!empty($item['extraState']['functionId'])) {
                    $deps[] = $item['extraState']['functionId'];
                }
            }
            if(is_array($item)) {
                array_walk($item, $depFinder);
            }
        };
        
        array_walk($body, $depFinder);
        
        return array_unique($deps);
    }
}