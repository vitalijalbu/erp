<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\Request;
use App\Models\BP;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreBPRequest;
use App\Models\Currency;
use PhpOffice\PhpSpreadsheet\Calculation\DateTimeExcel\Current;

class CurrencyController extends ApiController
{

    /**
     * @OA\Get(
     *   tags={"Currency"},
     *   path="/currencies",
     *   summary="Get available currencies list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/CurrencyResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $currencies = Currency::all();

        return response()->json($currencies);
    }

}
