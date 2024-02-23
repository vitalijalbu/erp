<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Yajra\DataTables\DataTables;
use App\Http\Controllers\Controller;
use PrinsFrank\Standards\Language\LanguageName;
use PrinsFrank\Standards\Language\LanguageAlpha2;

class LanguageController extends Controller
{
    /**
     * @OA\Get(
     *   tags={"Languages"},
     *   path="/languages",
     *   summary="Get list of available languages",
     *   @OA\Response(
     *     response=200,
     *     description="OK", 
     *   )
     * )
     */
    public function index()
    {
        $lang = [];

        collect(LanguageAlpha2::cases())->each(function($el) use(&$lang){
            $lang[] = [
                'name' => $el->toLanguageName()->value,
                'langAlpha2' => $el->value,
                'key' => $el->name
            ];
        });

        return response()->json($lang);
    }
}
