<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\Request;
use App\Models\CustomFunctionCategory;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreCustomFunctionCategoryRequest;


class CustomFunctionCategoryController extends ApiController
{

    public function __construct()
    {
        $this->authorizeResource(CustomFunctionCategory::class, 'category');
    }


    /**
     * @OA\Get(
     *   tags={"Custom Function Categories"},
     *   path="/function-categories/",
     *   summary="Get available custom function categories tree",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/CustomFunctionCategoryTypeResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $categoryTree = CustomFunctionCategory::whereNull('parent_id')
            ->with('children')
            ->orderBy('name', 'ASC')
            ->get();

        return response()->json($categoryTree);
    }

    /**
     * @OA\Post(
     *   tags={"Custom Function Categories"},
     *   path="/function-categories",
     *   summary="Create new custom function category",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "name"
     *       },
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="parent_id", type="integer"),
     *       example={
     *          "name": "Price Functions",
     *          "parent_id": 1
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/CustomFunctionCategoryResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function store(StoreCustomFunctionCategoryRequest $request)
    {
        $category = new CustomFunctionCategory();
        $category->fill($request->all());
        if(!$category->save()) {
            abort(500);
        }
    }

    /**
     * @OA\Get(
     *   tags={"Custom Function Categories"},
     *   path="/function-categories/{id}",
     *   summary="Custom Function Categories show",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/CustomFunctionCategoryResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function show(CustomFunctionCategory $category)
    {
        $category->loadMissing(['parent', 'directChildren']);
        return response()->json($category);
    }

    /**
     * @OA\Put(
     *   tags={"Custom Function Categories"},
     *   path="/function-categories/{id}",
     *   summary="Update Custom Function Category",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={},
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="parent_id", type="integer"),
     *       example={
     *          "name": "Price Functions",
     *          "parent_id": 1
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
    public function update(StoreCustomFunctionCategoryRequest $request, CustomFunctionCategory $category)
    {
        $category->fill($request->except(['id']));
        if(!$category->save()) {
            abort(500);
        }
    }

    /**
     * @OA\Delete(
     *   tags={"Custom Function Categories"},
     *   path="/function-categories/{id}",
     *   summary="Delete Custom Function Categories",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/CustomFunctionCategory")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function delete(CustomFunctionCategory $category)
    {
        if(!$category->delete()) {
            abort(500);
        }
    }
}
