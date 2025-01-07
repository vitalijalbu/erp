<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use App\Models\ConstraintType;

class ConstraintTypeController extends ApiController
{

    public function __construct()
    {
        $this->authorizeResource(ConstraintType::class, 'constraintType');
    }


    /**
     * @OA\Get(
     *   tags={"Constraint Types"},
     *   path="/constraints/types",
     *   summary="Get available constraint types",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/ConstraintTypeResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $types = ConstraintType::orderBy('id')->get();

        return response()->json($types);
    }

    /**
     * @OA\Get(
     *   tags={"Constraint Types"},
     *   path="/constraints/type/{id}",
     *   summary="Constraint show",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ConstraintTypeResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function show(ConstraintType $constraintType)
    {
        return response()->json($constraintType);
    }
}
