<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdjustmentType;
use Illuminate\Http\Request;

class AdjustmentTypeController extends Controller
{
    /**
     * @OA\Get(
     *   tags={"Adjustment Type"},
     *   path="/adjustments-type",
     *   summary="Get list of adjustments type",
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */

    public function index()
    {
        $this->authorize('index', AdjustmentType::class);
        
        $adj = AdjustmentType::orderBy('invetory', 'DESC')->get();

        return response()->json($adj);
    }
}
