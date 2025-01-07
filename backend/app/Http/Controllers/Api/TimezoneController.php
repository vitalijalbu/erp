<?php

namespace App\Http\Controllers\Api;

use App\Helpers\Utility;
use App\Http\Controllers\Controller;

class TimezoneController extends Controller
{
    /**
     * @OA\Get(
     *   tags={"Timezone"},
     *   path="/timezones",
     *   summary="Get list of timezones",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   )
     * )
     */

    public function index()
    {
        return response()->json(Utility::generateTimezones());
    }
}
