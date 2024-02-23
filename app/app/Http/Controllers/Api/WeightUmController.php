<?php

namespace App\Http\Controllers\Api;

use App\DataTables\WeightUmDataTable;
use App\Http\Controllers\Controller;
use App\Models\WeightUm;
use Illuminate\Http\Request;

class WeightUmController extends Controller
{
    /**
     * @OA\Get(
     *   tags={"Weights UM"},
     *   path="/weights",
     *   summary="Get list of weights",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/WeightResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new WeightUmDataTable(
            WeightUm::query()
        );

        return $datatable->toJson();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

   /**
     * @OA\Get(
     *   tags={"Weights UM"},
     *   path="/weights/{id}",
     *   summary="Get details of single weight",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/WeightResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(WeightUm $weightUm)
    {
        return response()->json($weightUm);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, WeightUm $weightUm)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(WeightUm $weightUm)
    {
        //
    }
}
