<?php

namespace App\Http\Controllers\Api;

use App\Enum\ItemType;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\LoadNewLotRequest;
use Illuminate\Http\Request;
use App\Models\Item;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\StoreAlternativeItemRequest;
use App\Http\Requests\StoreItemStockLimitRequest;
use App\Models\Company;
use App\Models\ItemGroup;
use App\Models\ItemStockLimit;
use Carbon\Carbon;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;

class ItemController extends ApiController
{

    public function __construct()
    {
        $this->authorizeResource(Item::class, 'item');
    }

    /**
     * @OA\Get(
     *   tags={"Items", "masterdata_item.php"},
     *   path="/items",
     *   summary="Item list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *       @OA\Property(
     *         type="object",
     *         @OA\Items(ref="#/components/schemas/ItemResource")
     *       ),
     *     )
     *   )
     * )
     * 
     * @OA\Get(
     *   tags={"Items", "masterdata_item.php"},
     *   path="/items/enabled",
     *   summary="Enabled Item list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *       @OA\Property(
     *         type="object",
     *         @OA\Items(ref="#/components/schemas/ItemResource")
     *       ),
     *     )
     *   )
     * )
     * 
     * @OA\Get(
     *   tags={"Items", "masterdata_item.php"},
     *   path="/items/disabled",
     *   summary="Disabled Item list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *       @OA\Property(
     *         type="object",
     *         @OA\Items(ref="#/components/schemas/ItemResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index($enable = null)
    {
        $datatable = new \App\DataTables\ItemsDataTable(
            Item::getItems(
                auth()->user(),
                $enable
            )
        );

        return $datatable->toJson();
    }


    /** 
     * @OA\Get(
     *   tags={"Items"},
     *   path="/items/autocomplete",
     *   summary="Items search for autocomplete",
     *   @OA\Parameter(
     *     name="search",
     *     in="query",
     *     required=true,
     *     type="string"
     *   ),
     *   @OA\Parameter(
     *     name="enabled",
     *     in="query",
     *     required=true,
     *     type="boolean"
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *       @OA\Property(
     *         type="object",
     *         @OA\Items(ref="#/components/schemas/ItemResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function autocomplete(Request $request)
    {
        $this->authorize('viewAny', Item::class);
        $request->validate([
            'search' => ['required', 'string'],
            'enabled' => ['sometimes', 'boolean']
        ]);

        $items = Item::searchByDesc(
            $request->search,
            $request->boolean('enabled', true),
            auth()->user()
        )->get();

        return response()->json($items);
    }


    /**
     * @OA\Put(
     *   tags={"Item", "masterdata_item_add.php"},
     *   path="/items/{item}/toggle/{enable}",
     *   summary="Enable ot Disable Item",
     *   @OA\Parameter(ref="#/components/parameters/item"),
     *   @OA\Parameter(ref="#/components/parameters/enable"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ItemResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function toggle(Request $request, Item $item, $enable)
    {
        $this->authorize('toggle', $item);
        $company = auth()->user()->IDcompany;
        $saved = DB::transaction(function() use ($item, $enable, $company) {
            return $enable ? $item->enable($company) : $item->disable($company);
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Put(
     *   tags={"Item", "masterdata_item_alternative.php"},
     *   path="/items/{item}/alternative",
     *   summary="Set Item lternative code and description",
     *   @OA\Parameter(ref="#/components/parameters/item"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "altv_code", "altv_desc"
     *       },
     *       @OA\Property(property="altv_code", type="string"),
     *       @OA\Property(property="altv_desc", type="string"),
     *       example={
     *          "altv_code": "Alt Code",
     *          "altv_desc": "Alt Description",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ItemResource")
     *   ),
     *   @OA\Response(response=400, description="Item is not enabled"),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function alternative(StoreAlternativeItemRequest $request, Item $item)
    {
        $this->authorize('updateAlternative', $item);
        
        if(!$item->setAlternative(
            auth()->user()->IDcompany, 
            $request->input('altv_code'),
            $request->input('altv_desc'),
        )) {
            abort(400, "Cannot set alternative code for disabled items");
        }
    }

    /**
     * @OA\Post(
     *   tags={"Item", "masterdata_item_add.php"},
     *   path="/items",
     *   summary="Create new Item",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "item_desc", "um", "item_group"
     *       },
     *       @OA\Property(property="item_desc", type="string"),
     *       @OA\Property(property="um", type="string"),
     *       @OA\Property(property="item_group", type="string"),
     *       example={
     *          "item_desc": "Nome Item",
     *          "um": "m",
     *          "item_group": "XFAG",
     *          "um" : "N",
     *          "item_group" : "NA",
     *          "item_subgroup" : "0-176",
     *          "weight_um" : "kg",
     *          "weight" : "10",
     *          "product_line" : "0-322",
     *          "customs_code" : "",
     *          "number_of_plies" : "0",
     *          "type" : "purchased",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ItemResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function store(StoreItemRequest $request)
    {
        $item = new Item();
        $item->fill($request->validated());
        $item->IDcompany = auth()->user()->IDcompany;
        $saved = DB::transaction(function() use ($item, $request) {
            return $item->save();
        });

        if(!$saved) {
            abort(500);
        }

        return $this->show($item);
    }

    /**
     * @OA\Get(
     *   tags={"Item", "masterdata_item_add.php"},
     *   path="/items/groups",
     *   summary="Get available item groups",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ItemGroupResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function groups(Request $request)
    {
        $this->authorize('viewAny', Item::class);
        $groups = ItemGroup::byUser(auth()->user())
            ->orderBy('item_group', 'asc')
            ->get();

        return response()->json($groups);
    }


    /**
     * @OA\Get(
     *   tags={"Item", "masterdata_item_add.php"},
     *   path="/companies/{company}/items/groups",
     *   summary="Get available item groups for a company",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ItemGroupResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function companyGroups(Request $request, Company $company)
    {
        $this->authorize('viewAnyCompany', Item::class);
        $groups = ItemGroup::where('IDcompany', $company->IDcompany);
        if($request->query('withShared', false)) {
            $groups->withShared();
        }

        $groups = $groups
            ->orderBy('item_group', 'asc')
            ->get();

        return response()->json($groups);
    }

    /**
     * @OA\Get(
     *   tags={"Item", "masterdata_item.php"},
     *   path="/items/{id}",
     *   summary="Item show",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ItemResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function show(Item $item)
    {
        $item->loadMissing([
            'company',
            'itemGroup',
            'itemSubfamily',
            'itemLine',
            'itemEnabledCompany' => function(Builder $builder) {
                return $builder->where('IDcompany', auth()->user()->IDcompany);
            },
            'itemMaterials' => function(Builder $builder) {
                return $builder->with([
                    'item' => ['unit'],
                    'process',
                ])->orderBy('position');
            },
            'itemRouting' => function(Builder $builder) {
                return $builder->with([
                    'process',
                    'priceItem',
                    'setupPriceItem',
                    'operatorCostItem',
                    'machineCostItem'
                ])->orderBy('position');
            }, 
            'standardProduct',
            'baseItem'
        ]);
        $item->append(['configuration_details']);
        $item->makeHidden('itemEnabledCompany');
        $item->enabled = $item->itemEnabledCompany ? 1 : 0;
        $item->alternative_code = $item->itemEnabledCompany?->altv_code;
        $item->alternative_description = $item->itemEnabledCompany?->altv_desc;
        $item->editable = auth()->user()->can('update', $item);

        return response()->json($item);
    }


    /**
     * @OA\Get(
     *   tags={"Item", "masterdata_item.php"},
     *   path="/items/{id}/configuration-details",
     *   summary="Get the product configuration in a human readable way",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ItemResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=400, description="Bad request"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function getConfigurationDetails(Item $item)
    {
        $details = $item->configuration_details;
        if(!$details) {
            return response()->json([
                'message' => 'The selected item is not a configurable product'
            ], 400);
        }
        return response()->json($details);
    }

    /**
     * @OA\Get(
     *   tags={"Item", "masterdata_item_stock_limits.php"},
     *   path="/items/{id}/stock-limits",
     *   summary="Get all item stock limits",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ItemStockLimitResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function stockLimits(Item $item)
    {
        $this->authorize('view', $item);
        $limits = collect(ItemStockLimit::getCurrentLimits(auth()->user()->IDcompany, $item));

        return response()->json($limits);
    }

    /**
     * @OA\Get(
     *   tags={"Item", "masterdata_item_stock_limits.php"},
     *   path="/items/{id}/stock-limits-history",
     *   summary="Get all item stock limits history",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ItemStockLimitResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function stockLimitsHistory(Item $item)
    {
        $this->authorize('view', $item);
        $limits = ItemStockLimit::with('warehouse')
            ->where([
                ['IDitem', $item->IDitem],
                ['IDcompany', auth()->user()->IDcompany]
            ])
            ->orderBy('date_ins', 'asc');

        $limits = collect($limits->get());

        return response()->json($limits);
    }

    /**
     * @OA\Put(
     *   tags={"Item", "masterdata_item_stock_limits.php"},
     *   path="/items/{id}/stock-limits",
     *   summary="Update Item",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={"IDwarehouse", "qty_min", "qty_max"},
     *       @OA\Property(property="IDwarehouse", type="integer"),
     *       @OA\Property(property="qty_min", type="number"),
     *       @OA\Property(property="qty_max", type="number"),
     *       example={
     *          "IDwarehouse": 1,
     *          "qty_min": 10,
     *          "qty_max": 100
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ItemResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function addStockLimit(StoreItemStockLimitRequest $request, Item $item)
    {
        $this->authorize('update', $item);
        $limit = new ItemStockLimit();
        $limit->fill($request->all());
        $limit->IDcompany = auth()->user()->IDcompany;
        $limit->IDitem = $item->IDitem;
        $limit->username = auth()->user()->username;
        $limit->date_ins = Carbon::now();
        $limit->enabled = 1;
        $saved = DB::transaction(function() use ($limit) {
            return $limit->save();
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Put(
     *   tags={"Item", "masterdata_item_add.php"},
     *   path="/items/{id}",
     *   summary="Update Item",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={"desc"},
     *       @OA\Property(property="desc", type="string"),
     *       example={
     *          "item_desc": "Nome Item",
     *          "um": "m",
     *          "item_group": "XFAG",
     *          "um" : "N",
     *          "item_group" : "NA",
     *          "item_subgroup" : "0-176",
     *          "weight_um" : "kg",
     *          "weight" : "10",
     *          "product_line" : "0-322",
     *          "customs_code" : "",
     *          "number_of_plies" : "0",
     *          "type" : "purchased",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ItemResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function update(StoreItemRequest $request, Item $item)
    {
        $item->fill($request->validated());
        $saved = DB::transaction(function() use ($item) {
            return $item->save();
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Delete(
     *   tags={"Item","masterdata_item.php"},
     *   path="/items/{id}",
     *   summary="Delete Item",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/Item")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function destroy(Item $item)
    {
        $deleted = DB::transaction(function() use ($item) {
            return $item->delete();
        });

        if(!$deleted) {
            abort(500);
        }
    }

    /**
     * @OA\POST(
     *   tags={"Item", "adjustments_new_lots.php"},
     *   path="/items/{id}/load-new-lot",
     *   summary="Load new lot",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idAdjustmentType", "lotText", "eur1", "confItem", "mergedLot", "idWarehouse", "idWarehouseLocation", "dadLot", "de", "di", "la", "lu", "pz"
     *       },
     *       @OA\Property(property="idAdjustmentType", type="int"),
     *       @OA\Property(property="lotText", type="string"),
     *       @OA\Property(property="eur1", type="boolean"),
     *       @OA\Property(property="confItem", type="boolean"),
     *       @OA\Property(property="mergedLot", type="boolean"),
     *       @OA\Property(property="idWarehouse", type="int"),
     *       @OA\Property(property="idWarehouseLocation", type="int"),
     *       @OA\Property(property="dadLot", type="string|null"),
     *       @OA\Property(property="de", type="float|null"),
     *       @OA\Property(property="di", type="float|null"),
     *       @OA\Property(property="la", type="float|null"),
     *       @OA\Property(property="lu", type="float|null"),
     *       @OA\Property(property="pz", type="float|null"),
     *       example={
     *          "idAdjustmentType" : 4,
     *          "lotText" : "lotto di prova",
     *          "eur1" : 0,
     *          "confItem" : 0,
     *          "mergedLot" : 0,
     *          "idWarehouse" : 4,
     *          "idWarehouseLocation" : 524,
     *          "dadLot" : null,
     *          "de" : 0, 
     *          "di" : 0,
     *          "la" : 10.23, 
     *          "lu" : 2.34, 
     *          "pz" : 2
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ItemResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function loadNewLot(Item $item, LoadNewLotRequest $request)
    {
        $user = auth()->user();

        DB::transaction(function() use ($item, $user, $request){
            DB::statement("exec dbo.sp_adjustments_add_new_lots ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?", [
                $user->IDcompany,
                $request->dadLot ?? '',
                $request->idWarehouse,
                $request->idWarehouseLocation,
                $request->de ?? 0,
                $request->di ?? 0,
                $request->la ?? 0,
                $request->lu ?? 0,
                $request->pz ?? 0,
                $user->username,
                $request->idAdjustmentType,
                $item->um,
                $item->IDitem,
                $request->lotText ?? '',
                $request->eur1,
                $request->confItem,
                $request->mergedLot
            ]);
        });
    }
 /**
     * @OA\Get(
     *   tags={"Item","masterdata_item.php"},
     *   path="/items/types",
     *   summary="Get list of available item types",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/Item")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function types()
    {
        return response()->json(collect(ItemType::cases())->pluck('name'));
    }
}
