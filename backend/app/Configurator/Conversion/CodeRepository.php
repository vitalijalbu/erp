<?php

namespace App\Configurator\Conversion;
use Illuminate\Support\Facades\Storage;


class CodeRepository implements CodeRepositoryInterface
{
    public function storeCode($filename, $code): bool
    {
        if(!str_ends_with($filename, ".php")) {
            $filename = $filename . ".php";
        }
        Storage::disk('code_repo')->put($filename, $code);

        return true;
    }

    public function deleteCode($filename): bool
    {
        if(!str_ends_with($filename, ".php")) {
            $filename = $filename . ".php";
        }
        Storage::disk('code_repo')->delete($filename);

        return true;
    }
}