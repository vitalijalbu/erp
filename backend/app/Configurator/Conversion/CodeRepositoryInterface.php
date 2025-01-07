<?php

namespace App\Configurator\Conversion;

interface CodeRepositoryInterface
{
    public function storeCode($filename, $code): bool;

    public function deleteCode($filename): bool;
}