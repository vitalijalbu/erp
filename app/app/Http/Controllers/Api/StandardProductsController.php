<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Arr;
use Illuminate\Http\Request;
use App\Models\StandardProduct;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\CloneStandardProductRequest;
use App\Models\ProductConfigurationFeature;
use App\Http\Requests\StoreStandardProductRequest;
use App\Http\Requests\StoreFeatureStandardProductRequest;
use App\Http\Requests\StoreBulkFeatureStandardProductRequest;
use App\Http\Requests\StoreBulkProductBOMRuleRequest;
use App\Http\Requests\StoreBulkProductRoutingRequest;
use App\Http\Requests\StoreBulkProductSalePricingRulesRequest;
use App\Http\Requests\StoreProductBOMRuleRequest;
use App\Http\Requests\StoreProductRoutingRequest;
use App\Models\ProductBOMRule;
use App\Models\ProductRouting;
use App\Models\ProductSalePricing;
use App\Models\StandardProductSalePricingGroup;

class StandardProductsController extends ApiController
{

    public function __construct()
    {
        $this->authorizeResource(StandardProduct::class, 'product');
    }


    /**
     * @OA\Get(
     *   tags={"Standard Products"},
     *   path="/standard-products/",
     *   summary="Get available Standard Products",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/StandardProductTypeResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new \App\DataTables\StandardProductsDataTable(
            StandardProduct::with(['company', 'itemGroup', 'um'])
        );
        return $datatable->toJson();
    }

    /**
     * @OA\Post(
     *   tags={"Standard Products"},
     *   path="/standard-products",
     *   summary="Create new Standard Products",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "code",
     *          "name",
     *          "item_group_id",
     *          "um_id",
     *       },
     *       @OA\Property(property="code", type="string"),
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="company_id", type="integer"),
     *       @OA\Property(property="item_group_id", type="string"),
     *       @OA\Property(property="um_id", type="string"),
     *       @OA\Property(property="description_constraint_id", type="string"),
     *       @OA\Property(property="long_description_constraint_id", type="string"),
     *       @OA\Property(property="production_description_constraint_id", type="string"),
     *       example={
     *          "code": "belt",
     *          "name": "Simple Belt",
     *          "company_id": 845,
     *          "item_group_id": "0-16",
     *          "um_id": "N",
     *          "description_constraint_id": "845-1",
     *          "long_description_constraint_id": "845-2",
     *          "production_description_constraint_id": "845-4"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/StandardProductResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function store(StoreStandardProductRequest $request)
    {
        $standardProduct = new StandardProduct();
        $standardProduct->fill($request->except(['id']));
        $saved = DB::transaction(function() use ($standardProduct, $request) {
            return $standardProduct->save();
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Get(
     *   tags={"Standard Products"},
     *   path="/standard-products/{id}",
     *   summary="Standard Products show",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/StandardProductResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function show(StandardProduct $product)
    {
        $product->loadMissing([
            'company', 
            'itemGroup', 
            'um', 
            'configurationFeatures', 
            'BOMRules' => function($query) {
                $query->with(['constraint']);
            },
            'routings'=> function($query) {
                $query->with(['activationConstraint', 'process']);
            },
            'salePricingGroups' => function($query) {
                $query->with(['constraints.constraint']);
            },
        ]);
        return response()->json($product);
    }

    /**
     * @OA\Put(
     *   tags={"Standard Products"},
     *   path="/standard-products/{id}",
     *   summary="Update Standard Products",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="company_id", type="integer"),
     *       @OA\Property(property="item_group_id", type="string"),
     *       @OA\Property(property="um_id", type="string"),
     *       @OA\Property(property="description_constraint_id", type="string"),
     *       @OA\Property(property="long_description_constraint_id", type="string"),
     *       @OA\Property(property="production_description_constraint_id", type="string"),
     *       example={
     *          "name": "Simple Belt",
     *          "company_id": 845,
     *          "item_group_id": "0-13",
     *          "um_id": "N",
     *          "description_constraint_id": "845-1",
     *          "long_description_constraint_id": "845-2",
     *          "production_description_constraint_id": "845-4"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/StandardProductResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function update(StoreStandardProductRequest $request, StandardProduct $product)
    {
        $product->fill($request->except(['id', 'code']));
        $saved = DB::transaction(function() use ($product, $request) {
            return $product->save();
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Delete(
     *   tags={"Standard Products"},
     *   path="/standard-products/{id}",
     *   summary="Delete Standard Products",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/StandardProduct")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function delete(StandardProduct $product)
    {
        if(!$product->delete()) {
            abort(500);
        }
    }


    /**
     * @OA\Post(
     *   tags={"Standard Products"},
     *   path="/standard-products/{id}/clone",
     *   summary="Clone Standard Products",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "code",
     *       },
     *       @OA\Property(property="code", type="string"),
     *       example={
     *          "code": "cloned_belt",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/StandardProductResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function clone(CloneStandardProductRequest $request, StandardProduct $product)
    {
        $this->authorize('view', $product);
        $this->authorize('create', StandardProduct::class);

        $newProduct = $product->duplicate($request->code, $request->prefix);
        if(!$newProduct) {
            abort(500);
        }

        return response()->json($newProduct);
    }


    /**
     * @OA\Post(
     *   tags={"Standard Products"},
     *   path="/standard-products/{id}/configure",
     *   summary="Add Feature to Standard Product",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "feature_id",
     *          "position",
     *       },
     *       @OA\Property(property="feature_id", type="string"),
     *       @OA\Property(property="readonly", type="boolean"),
     *       @OA\Property(property="position", type="integer"),
     *       @OA\Property(property="hidden", type="boolean"),
     *       @OA\Property(property="multiple", type="boolean"),
     *       @OA\Property(property="validation_constraint_id", type="string"),
     *       @OA\Property(property="value_constraint_id", type="string"),
     *       @OA\Property(property="dataset_constraint_id", type="string"),
     *       @OA\Property(property="activation_constraint_id", type="string"),
     *       @OA\Property(property="feature_attribute_id", type="string"),
     *       example={
     *          "feature_id": "width",
     *          "readonly": false,
     *          "position": 1,
     *          "hidden": false,
     *          "multiple": false,
     *          "validation_constraint_id": "v-1",
     *          "value_constraint_id": "v-2",
     *          "dataset_constraint_id": "v-3",
     *          "activation_constraint_id": null,
     *          "feature_attribute_id": "main_product"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function addFeature(StoreFeatureStandardProductRequest $request, StandardProduct $product)
    {
        $this->authorize('addFeatures', $product);
        $productConfigurationFeature = new \App\Models\ProductConfigurationFeature();
        $productConfigurationFeature->fill($request->except(['id', 'standard_product_id']));
        $productConfigurationFeature->standard_product_id = $product->id;

        $saved = DB::transaction(function() use ($productConfigurationFeature, $request) {
            return $productConfigurationFeature->save();
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Put(
     *   tags={"Standard Products"},
     *   path="/standard-products/{id}/configure/{idFeature}",
     *   summary="Edit Feature associated to Standard Product",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Parameter(ref="#/components/parameters/idFeature"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="feature_id", type="string"),
     *       @OA\Property(property="readonly", type="boolean"),
     *       @OA\Property(property="position", type="integer"),
     *       @OA\Property(property="hidden", type="boolean"),
     *       @OA\Property(property="multiple", type="boolean"),
     *       @OA\Property(property="validation_constraint_id", type="string"),
     *       @OA\Property(property="value_constraint_id", type="string"),
     *       @OA\Property(property="dataset_constraint_id", type="string"),
     *       @OA\Property(property="activation_constraint_id", type="string"),
     *       @OA\Property(property="feature_attribute_id", type="string"),
     *       example={
     *          "feature_id": "width",
     *          "readonly": false,
     *          "position": 1,
     *          "hidden": false,
     *          "multiple": true,
     *          "validation_constraint_id": "v-1",
     *          "value_constraint_id": "v-2",
     *          "dataset_constraint_id": "v-3",
     *          "activation_constraint_id": null,
     *          "feature_attribute_id": "main_product"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function editFeature(
        StoreFeatureStandardProductRequest $request, 
        StandardProduct $product, 
        ProductConfigurationFeature $feature
    )
    {
        $this->authorize('addFeatures', $feature->standardProduct);
        $feature->fill($request->except(['id', 'standard_product_id']));

        $saved = DB::transaction(function() use ($feature, $request) {
            return $feature->save();
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Delete(
     *   tags={"Standard Products"},
     *   path="/standard-products/{id}/configure/{idFeature}",
     *   summary="Delete a feature associated to a Standard Products",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Parameter(ref="#/components/parameters/idFeature"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function deleteFeature(
        StandardProduct $product, 
        ProductConfigurationFeature $feature
    )
    {
        $this->authorize('addFeatures', $feature->standardProduct);
        if(!$feature->delete()) {
            abort(500);
        }
    }

    /**
     * @OA\Post(
     *   tags={"Standard Products"},
     *   path="/standard-products/{id}/configure/bulk-features",
     *   summary="Add bulk Features to Standard Product",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "productConfigurationFeature"
     *       },
     *       example={
     *          "productConfigurationFeature" : {
     *              "feature_id": "width",
     *              "readonly": false,
     *              "position": 1,
     *              "hidden": false,
     *              "multiple": false,
     *              "validation_constraint_id": null,
     *              "value_constraint_id": null,
     *              "dataset_constraint_id": null,
     *              "activation_constraint_id": "enable_width",
     *              "feature_attribute_id": "LU"
     *          },
     *          {
     *              "feature_id": "length",
     *              "readonly": false,
     *              "position": 1,
     *              "hidden": false,
     *              "multiple": false,
     *              "validation_constraint_id": null,
     *              "value_constraint_id": null,
     *              "dataset_constraint_id": null,
     *              "activation_constraint_id": "enable_width"
     *          }
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function addFeatures(StoreBulkFeatureStandardProductRequest $request, StandardProduct $product)
    {
        $this->authorize('addFeatures', $product);

        DB::transaction(function() use ($product, $request){
            $product->configurationFeatures()->delete();

            foreach($request->productConfigurationFeature as $config){
                $product->configurationFeatures()->create($config);
            }
        });
    }

    /**
     * @OA\Post(
     *   tags={"Standard Products"},
     *   path="/standard-products/{id}/bom-rule",
     *   summary="Add BOM Rule to Standard Product",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "constraint_id",
     *          "position",
     *       },
     *       @OA\Property(property="constraint_id", type="string"),
     *       @OA\Property(property="position", type="integer"),
     *       example={
     *          "constraint_id": "bom_c_001",
     *          "position": 1,
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function addBOMRule(StoreProductBOMRuleRequest $request, StandardProduct $product)
    {
        $this->authorize('addBOMRules', $product);
        $productBOMRule = new \App\Models\ProductBOMRule();
        $productBOMRule->fill($request->validated());
        $productBOMRule->standard_product_id = $product->id;

        $saved = DB::transaction(function() use ($productBOMRule, $request) {
            return $productBOMRule->save();
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Put(
     *   tags={"Standard Products"},
     *   path="/standard-products/{id}/bom-rule/{idRule}",
     *   summary="Edit BOM rule associated to Standard Product",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Parameter(ref="#/components/parameters/idRule"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="constraint_id", type="string"),
     *       @OA\Property(property="position", type="integer"),
     *       example={
     *          "constraint_id": "bom_c_001",
     *          "position": 1,
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function editBOMRule(
        StoreProductBOMRuleRequest $request, 
        StandardProduct $product, 
        ProductBOMRule $rule
    )
    {
        $this->authorize('addBOMRules', $rule->standardProduct);
        $rule->fill($request->validated());

        $saved = DB::transaction(function() use ($rule, $request) {
            return $rule->save();
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Delete(
     *   tags={"Standard Products"},
     *   path="/standard-products/{id}/bom-rule/{idRule}",
     *   summary="Delete a BOM rule associated to a Standard Products",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Parameter(ref="#/components/parameters/idRule"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function deleteBOMRule(
        StandardProduct $product, 
        ProductBOMRule $rule
    )
    {
        $this->authorize('addBOMRules', $rule->standardProduct);
        if(!$rule->delete()) {
            abort(500);
        }
    }

    /**
     * @OA\Post(
     *   tags={"Standard Products"},
     *   path="/standard-products/{id}/bom-rule/bulk-bom-rules",
     *   summary="Add bulk BOM Rules to Standard Product",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "BOMRules"
     *       },
     *       example={
     *          "BOMRules" : {
     *              "constraint_id": "bom_c_001",
     *              "position": 1,
     *          },
     *          {
     *              "constraint_id": "bom_c_002",
     *              "position": 2,
     *          }
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function addBOMRules(StoreBulkProductBOMRuleRequest $request, StandardProduct $product)
    {
        $this->authorize('addBOMRules', $product);

        DB::transaction(function() use ($product, $request){
            $product->BOMRules()->delete();

            $product->BOMRules()->createMany($request->BOMRules);
        });
    }


    /**
     * @OA\Post(
     *   tags={"Standard Products"},
     *   path="/standard-products/{id}/routing",
     *   summary="Add Routing row to Standard Product",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "process_id",
     *          "activation_constraint_id",
     *          "workload_constraint_id",
     *          "position",
     *       },
     *       @OA\Property(property="process_id", type="string"),
     *       @OA\Property(property="activation_constraint_id", type="string"),
     *       @OA\Property(property="workload_constraint_id", type="string"),
     *       @OA\Property(property="position", type="integer"),
     *       example={
     *          "process_id": "lavorazione",
     *          "activation_constraint_id": "routing_c_001",
     *          "workload_constraint_id": "routing_c_002",
     *          "position": 1,
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function addRouting(StoreProductRoutingRequest $request, StandardProduct $product)
    {
        $this->authorize('addRoutings', $product);
        $routing = new \App\Models\ProductRouting();
        $routing->fill($request->validated());
        $routing->standard_product_id = $product->id;

        $saved = DB::transaction(function() use ($routing, $request) {
            return $routing->save();
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Put(
     *   tags={"Standard Products"},
     *   path="/standard-products/{id}/routing/{routing}",
     *   summary="Edit Routing row associated to Standard Product",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Parameter(ref="#/components/parameters/idRule"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="process_id", type="string"),
     *       @OA\Property(property="activation_constraint_id", type="string"),
     *       @OA\Property(property="workload_constraint_id", type="string"),
     *       @OA\Property(property="position", type="integer"),
     *       example={
     *          "process_id": "lavorazione",
     *          "activation_constraint_id": "routing_c_001",
     *          "workload_constraint_id": "routing_c_002",
     *          "position": 1,
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function editRouting(
        StoreProductRoutingRequest $request, 
        StandardProduct $product, 
        ProductRouting $routing
    )
    {
        $this->authorize('addRoutings', $routing->standardProduct);
        $routing->fill($request->validated());

        $saved = DB::transaction(function() use ($routing, $request) {
            return $routing->save();
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Delete(
     *   tags={"Standard Products"},
     *   path="/standard-products/{id}/routing/{routing}",
     *   summary="Delete a Routing row associated to a Standard Products",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Parameter(ref="#/components/parameters/idRule"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function deleteRouting(
        StandardProduct $product, 
        ProductRouting $routing
    )
    {
        $this->authorize('addRoutings', $routing->standardProduct);
        if(!$routing->delete()) {
            abort(500);
        }
    }

    /**
     * @OA\Post(
     *   tags={"Standard Products"},
     *   path="/standard-products/{id}/routing/bulk-routing",
     *   summary="Add bulk routing rows to Standard Product",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "routings"
     *       },
     *       example={
     *          "routings" : {
     *              {   
     *                  "process_id": "lavorazione",
     *                  "activation_constraint_id": "routing_c_001",
     *                  "workload_constraint_id": "routing_c_002",
     *                  "position": 1,
     *              },
     *              {
     *                  "process_id": "lavorazione 2",
     *                  "activation_constraint_id": "routing_c_001",
     *                  "workload_constraint_id": "routing_c_002",
     *                  "position": 2,
     *              }
     *          }
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function addRoutings(StoreBulkProductRoutingRequest $request, StandardProduct $product)
    {
        $this->authorize('addRoutings', $product);

        DB::transaction(function() use ($product, $request){
            $product->routings()->delete();

            $product->routings()->createMany($request->routings);
        });
    }


    /**
     * @OA\Post(
     *   tags={"Standard Products"},
     *   path="/standard-products/{id}/sale-pricing/bulk-pricing",
     *   summary="Add bulk sale pricing rules to Standard Product",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "pricing"
     *       },
     *       example={
     *          "sale_pricing" : {
     *              {
     *                  "name": "Materials",
     *                  "position": 1,
     *                  "constraints": {
     *                      {
     *                          "position": 1,
     *                          "constraint_id": "c1"
     *                      },
     *                      {
     *                          "position": 2,
     *                          "constraint_id": "c2"
     *                      }
     *                  }
     *              },
     *              {
     *                  "name": "Accessories",
     *                  "position": 2,
     *                  "constraints": {
     *                      {
     *                          "position": 1,
     *                          "constraint_id": "c3"
     *                      },
     *                      {
     *                          "position": 2,
     *                          "constraint_id": "c4"
     *                      }
     *                  }
     *              },
     *          }
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function addPricingRules(StoreBulkProductSalePricingRulesRequest $request, StandardProduct $product)
    {
        $this->authorize('addPricingRules', $product);

        DB::transaction(function() use ($product, $request){
            $product->salePricingGroups()->delete();

            $groups = $request->validated('sale_pricing', []);
            foreach($groups as $i => $group) {
                $salePricingGroup = $product->salePricingGroups()->create($group);
                foreach($group['constraints'] as $j => $constraint) {
                    $salePricing = new ProductSalePricing();
                    $salePricing->fill($constraint);
                    $salePricing->standard_product_id = $product->id;
                    $salePricingGroup->constraints()->save($salePricing);
                }
            }
        });
    }
}
