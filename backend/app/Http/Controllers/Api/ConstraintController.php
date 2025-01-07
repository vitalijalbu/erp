<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\CloneConstraintRequest;
use Illuminate\Http\Request;
use App\Models\Constraint;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreConstraintRequest;

class ConstraintController extends ApiController
{

    public function __construct()
    {
        $this->authorizeResource(Constraint::class, 'constraint');
    }


    /**
     * @OA\Get(
     *   tags={"Constraints"},
     *   path="/constraints/",
     *   summary="Get available constraints",
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
        $datatable = new \App\DataTables\ConstraintsDataTable(
            Constraint::with(['constraintType', 'company'])->where(function($query) {
                $query->whereNull('company_id')->orWhere('company_id', auth()->user()->IDcompany);
            })
        );
        return $datatable->toJson();
    }

    /**
     * @OA\Post(
     *   tags={"Constraints"},
     *   path="/constraints",
     *   summary="Create new Constraint",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "id",
     *          "label",
     *          "body",
     *          "constraint_type_id",
     *          "subtype"
     *       },
     *       @OA\Property(property="id", type="string"),
     *       @OA\Property(property="label", type="string"),
     *       @OA\Property(property="description", type="string"),
     *       @OA\Property(property="body", type="object"),
     *       @OA\Property(property="constraint_type_id", type="string", description="set as 'configurator' for constraints to use in product config"),
     *       @OA\Property(property="subtype", type="string"),
     *       @OA\Property(property="is_draft", type="boolean"),
     *       @OA\Property(property="company_id", type="integer"),
     *       example={
     *          "id": "enable_feature_width",
     *          "label": "Enable the width feature",
     *          "description": "Constraint to enable the width feature",
     *          "body": "<blockly json>",
     *          "constraint_type_id": "configurator",
     *          "subtype": "activation",
     *          "is_draft": true,
     *          "company_id": 845
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ConstraintResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function store(StoreConstraintRequest $request)
    {
        $constraint = new Constraint();
        $constraint->fill($request->all() + ['is_draft' => false]);
        try {
            $saved = DB::transaction(function() use ($constraint, $request) {
                return $constraint->save();
            });
    
            if(!$saved) {
                abort(500);
            }

            return $this->show($constraint);
        }
        catch (\App\Configurator\Conversion\CodeConversionException $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *   tags={"Constraint"},
     *   path="/constraints/{id}",
     *   summary="Constraint show",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ConstraintResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function show(Constraint $constraint)
    {
        return response()->json($constraint);
    }

    /**
     * @OA\Put(
     *   tags={"Constraints"},
     *   path="/constraints/{id}",
     *   summary="Update Constraint",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="label", type="string"),
     *       @OA\Property(property="description", type="string"),
     *       @OA\Property(property="body", type="object"),
     *       @OA\Property(property="is_draft", type="boolean"),
     *       @OA\Property(property="company_id", type="integer"),
     *       example={
     *          "label": "Enable the width feature",
     *          "description": "Constraint to enable the width feature",
     *          "body": "<blockly json>",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ConstraintResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function update(StoreConstraintRequest $request, Constraint $constraint)
    {
        $constraint->fill($request->except(['id', 'constraint_type_id']) + ['is_draft' => false]);
        try {
            $saved = DB::transaction(function() use ($constraint, $request) {
                return $constraint->save();
            });
    
            if(!$saved) {
                abort(500);
            }
        }
        catch (\App\Configurator\Conversion\CodeConversionException $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *   tags={"Constraints"},
     *   path="/constraints/{id}",
     *   summary="Delete Constraint",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/Constraint")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function delete(Constraint $constraint)
    {
        if(!$constraint->delete()) {
            abort(500);
        }
    }


    /**
     * @OA\Post(
     *   tags={"Constraints"},
     *   path="/constraints/{id}/clone",
     *   summary="Clone a Constraint",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "new_id",
     *       },
     *       @OA\Property(property="new_id", type="string"),
     *       example={
     *          "new_id": "cloned_enable_feature_width",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ConstraintResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function clone(CloneConstraintRequest $request, Constraint $constraint)
    {
        $this->authorize('create', Constraint::class);
        try {
            $newConstraint = $constraint->duplicate($request->new_id);    
            if(!$newConstraint) {
                abort(500);
            }

            return response()->json($newConstraint);
        }
        catch (\App\Configurator\Conversion\CodeConversionException $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
