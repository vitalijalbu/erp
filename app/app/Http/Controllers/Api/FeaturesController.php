<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\Request;
use App\Models\Feature;
use App\Models\FeatureType;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreFeatureRequest;
use App\Models\FeatureAttribute;

class FeaturesController extends ApiController
{

    public function __construct()
    {
        $this->authorizeResource(Feature::class, 'feature');
    }


    /**
     * @OA\Get(
     *   tags={"Features"},
     *   path="/features/types",
     *   summary="Get available feature types list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/FeatureTypeResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function types()
    {
        $featureTypes = FeatureType::orderBy('label', 'DESC')->get();

        return response()->json($featureTypes);
    }


    /**
     * @OA\Get(
     *   tags={"Features"},
     *   path="/features/attributes",
     *   summary="Get available feature special attribute list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/FeatureAttributeResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function attributes()
    {
        $featureAttributes = FeatureAttribute::orderBy('order', 'ASC')->get();

        return response()->json($featureAttributes);
    }

    /**
     * @OA\Get(
     *   tags={"Features"},
     *   path="/features",
     *   summary="Features list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/FeatureResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new \App\DataTables\FeatureDataTable(
            Feature::with('featureType')
        );
        return $datatable->toJson();
    }

    /**
     * @OA\Post(
     *   tags={"Features"},
     *   path="/features",
     *   summary="Create new feature",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "id", "label", "feature_type_id"
     *       },
     *       @OA\Property(property="id", type="string"),
     *       @OA\Property(property="label", type="string"),
     *       @OA\Property(property="feature_type_id", type="string"),
     *       example={
     *          "id": "width",
     *          "label": "Width",
     *          "feature_type_id": "int"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/FeatureResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function store(StoreFeatureRequest $request)
    {
        $feature = new Feature();
        $feature->fill($request->all());
        if(!$feature->save()) {
            abort(500);
        }

        return $this->show($feature);
    }

    /**
     * @OA\Get(
     *   tags={"Features"},
     *   path="/features/{id}",
     *   summary="Feature show",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/FeatureResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function show(Feature $feature)
    {
        return response()->json($feature);
    }

    /**
     * @OA\Put(
     *   tags={"Features"},
     *   path="/features/{id}",
     *   summary="Update Feature",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={},
     *       @OA\Property(property="label", type="string"),
     *       @OA\Property(property="feature_type_id", type="string"),
     *       example={
     *          "label": "Width",
     *          "feature_type_id": "int"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/FeatureResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function update(StoreFeatureRequest $request, Feature $feature)
    {
        $feature->fill($request->except(['id']));
        if(!$feature->save()) {
            abort(500);
        }
    }

    /**
     * @OA\Delete(
     *   tags={"Features"},
     *   path="/features/{id}",
     *   summary="Delete Feature",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/Feature")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function delete(Feature $feature)
    {
        if(!$feature->delete()) {
            abort(500);
        }
    }
}
