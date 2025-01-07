<?php

namespace App\Http\Controllers\Api;

use App\Models\Stock;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\InventoryLotHistory;
use App\Http\Controllers\Controller;
use App\DataTables\InventoryDataTable;
use App\Helpers\Utility;
use App\Http\Requests\StoreInventoryRequest;

class InventoryController extends Controller
{
    /**
     * @OA\Get(
     *   tags={"Inventory"},
     *   path="/inventory",
     *   summary="Get inventory list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/InventoryResource")
     *       ),
     *     )
     *   ),
     *   @OA\Response(response=401, description="Unauthorized")
     * )
     */

    public function index()
    {
        $this->authorize('index', Inventory::class);

        $r = Inventory::query()
                ->selectRaw("IDinventory, [desc], completed, substring(convert(varchar, start_date, 20),1,16) as start_date, substring(convert(varchar, end_date, 20),1,16) as end_date, username")
                ->where('IDcompany', auth()->user()->IDcompany);

        return (new InventoryDataTable($r))
            ->with([
                'idInventory' => Inventory::getCodeCurrentlyRunning(auth()->user()->IDcompany),
                'stocksToVerify' => Stock::getCountStocksNotInInventoryByCompany(auth()->user()->IDcompany)
            ])
            ->toJson();
    }

    /**
     * @OA\POST(
     *   tags={"Inventory"},
     *   path="/inventory",
     *   summary="Create new inventory",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "desc"
     *       },
     *       @OA\Property(property="desc", type="string"),
     *       example={
     *          "desc" : "Inventory test",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error"),
     *   @OA\Response(response=401, description="Unauthorized")
     * )
     */

    public function store(StoreInventoryRequest $request)
    {
        $this->authorize('store', Inventory::class);

        $user = auth()->user();

        if(Inventory::getCodeCurrentlyRunning($user->IDcompany)){
            abort(400);
        }

        $request->merge([
            'IDcompany' => $user->IDcompany,
            'completed' => 0,
            'start_date' => now('UTC'),
            'end_date' => null,
            'username' => $user->username
        ]);

        Inventory::create($request->all());
    }

    /**
     * @OA\PUT(
     *   tags={"Inventory"},
     *   path="/inventory/{idInventory}/conclude",
     *   summary="Conclude active inventory",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error"),
     *   @OA\Response(response=401, description="Unauthorized")
     * )
     */

    public function conclude(Inventory $inventory)
    {
        $this->authorize('conclude', $inventory);

        if($inventory->completed){
            abort(400);
        }

        if(Stock::getCountStocksNotInInventoryByCompany(auth()->user()->IDcompany) != 0){
            abort(400);
        }

        if(Stock::where('IDcompany', auth()->user()->IDcompany)->count() == 0){
            abort(400);
        }

        $user = auth()->user();

        DB::transaction(function () use ($user, $inventory){
            
            InventoryLotHistory::insert(
                Stock::query()
                    ->selectRaw("IDcompany, IDinventory, IDlot, qty_stock, invUsername, invDate_ins, IDwarehouse, IDlocation")
                    ->where([
                        'IDcompany' => $user->IDcompany,
                        'IDinventory' => $inventory->IDinventory
                    ])
                    ->get()
                    ->toArray()
            );
            
            Stock::query()
                ->where([
                    'IDcompany' => $user->IDcompany,
                    'IDinventory' => $inventory->IDinventory
                ])
                ->update([
                    'IDinventory' => null,
                    'invUsername' => null,
                    'invDate_ins' => null
                ]);
            
            $inventory->completed = 1;
            $inventory->end_date = now('UTC');
            
            if(!$inventory->save()){
                abort(500);
            }
        });
    }

    public function active()
    {
        return response()->json(Inventory::getCodeCurrentlyRunning(auth()->user()->IDcompany));
    }

    /**
     * @OA\GET(
     *   tags={"Inventory"},
     *   path="/inventory/{idInventory}",
     *   summary="Get details of inventory",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error"),
     *   @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function show(Inventory $inventory)
    {
        $this->authorize('show', $inventory);

        return response()->json($inventory);
    }
}
