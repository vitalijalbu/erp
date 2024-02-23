<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Requests\ConfirmOrderSplitRequest;
use App\Http\Requests\OrderSplitViewRequest;
use App\Http\Requests\StoreOrderSplitRequest;
use App\Models\OrderSplit;
use App\Models\OrderSplitRow;

class OrderSplitController extends Controller
{
    /**
     * @OA\GET(
     *   tags={"order-split"},
     *   path="/order-split",
     *   summary="List of lot to split and inserted cuts",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idStock"
     *       },
     *       @OA\Property(property="idStock", type="int"),
     *       example={
     *          "idStock": 41224
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
    public function index(OrderSplitViewRequest $request)
    {
        $this->authorize('index', OrderSplit::class);
        
        $user = auth()->user();

        $lot = 
            DB::query()
                ->selectRaw("0 as idx, s.IDlot, i.item, item_desc, um, qty_stock, ord_rif, l.note, w.[desc] as whdesc, wl.[desc] as whlcdesc, s.IDwarehouse, s.IDlocation")
                ->fromRaw('stock s
                inner join warehouse w on w.IDcompany = s.IDcompany and s.IDwarehouse = w.IDwarehouse
                inner join warehouse_location wl on wl.IDcompany = s.IDcompany and s.IDlocation = wl.IDlocation
                inner join lot l on s.IDcompany = l.IDcompany and s.IDlot = l.IDlot
                inner join item i on i.IDitem = l.IDitem')
                ->where([
                    's.IDcompany' => $user->IDcompany,
                    'IDstock' => $request->idStock
                ])
                ->union(function($q) use ($user, $request){
                    $q->selectRaw("1 as idx,  os.IDlot,  i.item, item_desc, um, qty_ori, ord_rif, l.note, '' as x1,'' as x2,'' as x3,'' as x4")
                        ->fromRaw('order_split os
                        inner join lot l on os.IDcompany = l.IDcompany and os.IDlot = l.IDlot
                        inner join item i on i.IDitem = l.IDitem')
                        ->where([
                            'os.IDcompany' => $user->IDcompany,
                            'os.IDstock' => $request->idStock
                        ]);
                })
                ->orderBy('idx')
                ->first();

            abort_if(!$lot || $lot->um == 'm2' , 404);

            $cuts = 
                DB::query()
                    ->selectRaw("IDRowSplit, qty_split, ord_ref, r.IDlocation, IDlot_new, executed, wl.[desc] as whldesc")
                    ->fromRaw("order_split o
                    inner join dbo.order_split_row r on o.IDcompany = r.IDcompany and o.IDord = r.IDord
                    inner join dbo.warehouse_location wl on wl.IDcompany = o.IDcompany and r.IDlocation = wl.IDlocation")
                    ->where([
                        'o.IDcompany' => $user->IDcompany,
                        'o.IDstock' => $request->idStock 
                    ])
                    ->get();

            return response()->json([
                'lot' => $lot,
                'cuts' => $cuts
            ]);
    }

    /**
     * @OA\POST(
     *   tags={"order-split"},
     *   path="/order-split",
     *   summary="Add split to lot",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idStock", "qty", "idWarehouseLocation"
     *       },
     *       @OA\Property(property="idStock", type="int"),
     *       @OA\Property(property="qty", type="int|float"),
     *       @OA\Property(property="ordRef", type="string|null"),
     *       @OA\Property(property="idWarehouseLocation", type="int"),
     *       example={
     *          "idStock" : 183151,
     *          "ordRef" : "",
     *          "qty" : 1,
     *          "idWarehouseLocation" : 1954
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
    public function store(StoreOrderSplitRequest $request)
    {
        $this->authorize('store', OrderSplit::class);
        
        $user = auth()->user();

        DB::transaction(function() use ($user, $request){
            $order = 
                OrderSplit::firstOrCreate([
                    'IDcompany' => $user->IDcompany,
                    'IDstock' => $request->idStock
                ],
                [
                    'IDcompany' => $user->IDcompany,
                    'IDlot' => $request->stock->IDlot,
                    'IDstock' => $request->idStock,
                    'IDwarehouse' => $request->stock->IDwarehouse,
                    'IDlocation' => $request->stock->IDlocation,
                    'qty_ori' => $request->stock->qty_stock,
                    'username' => $user->username,
                    'date_creation' => now('UTC'),
                ]);

                OrderSplitRow::create([
                    'IDcompany' => $user->IDcompany,
                    'IDord' => $order->IDord,
                    'qty_split' => $request->qty,
                    'ord_ref' => $request->ordRef ?? '',
                    'IDlocation' => $request->idWarehouseLocation,
                ]);
        });
    }

    /**
     * @OA\Delete(
     *   tags={"order-split"},
     *   path="/order-split/{id}",
     *   summary="Delete split row",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK"
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function delete(OrderSplitRow $split)
    {
        $this->authorize('delete', $split);

        $user = auth()->user();

        DB::transaction(function() use ($user, $split){
            $order = 
                OrderSplit::where([
                    'IDcompany' => $user->IDcompany,
                    'IDord' => $split->IDord
                ])->firstOrFail();

            abort_if($order->executed, 400);

            $split->delete();

            $Nrows = 
                OrderSplitRow::where([
                    'IDcompany' => $user->IDcompany,
                    'IDord' => $order->IDord
                ])
                ->count();

            if($Nrows == 0){
                $order->delete();
            }
        });
    }

    /**
     * @OA\POST(
     *   tags={"order-split"},
     *   path="/order-split/confirm",
     *   summary="Confirm split order",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idStock"
     *       },
     *       @OA\Property(property="idStock", type="int"),
     *       example={
     *          "idStock": 183153
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
    public function confirm(ConfirmOrderSplitRequest $request)
    {
        $this->authorize('confirm', OrderSplit::class);

        $user = auth()->user();

        $order = 
            OrderSplit::where([
                'IDcompany' => $user->IDcompany,
                'IDstock' => $request->idStock
            ])
            ->firstOrFail();

        abort_if($order->executed, 400);

        DB::transaction(function() use ($user, $request){
            DB::statement('exec dbo.[sp_order_split_confirm] ?,?,?', [
                $user->IDcompany,
                $request->idStock,
                $user->username
            ]);
        });
    }
}
