<?php

namespace App\Http\Controllers\Api;

use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\MaterialTransferTemp;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\ConfirmMaterialTransferRequest;
use App\Http\Requests\StoreMaterialTransferRequest;
use App\Http\Requests\UpdateMaterialTransferRequest;

class MaterialTransferController extends ApiController
{

    /**
     * @OA\Get(
     *   tags={"MaterialTransfer", "material_transfer.php"},
     *   path="/materials-transfer",
     *   summary="Get list of materials ready to transfer",
     *   @OA\Response(
     *     response=200,
     *     description="OK"
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function index()
    {
        $this->authorize('index', MaterialTransferTemp::class);

        $user = auth()->user();

        $res = 
            DB::query()
                ->selectRaw("tmp.IDtrans, s.IDlot as IDlot, item.item, item.item_desc, item.um as um, tmp.qty, dbo.getDimByLot (tmp.IDcompany, s.IDlot) as dim ,wh.[desc] as whdesc, wh_lc.[desc] as lcdesc, stepRoll")
                ->fromRaw("
                    dbo.material_transfer_temp tmp
                    left outer join dbo.stock s on s.IDcompany = tmp.IDcompany and s.IDstock = tmp.IDStock
                    left outer join lot on lot.IDlot = s.IDlot and lot.IDcompany = tmp.IDcompany
                    left outer join item on item.IDitem = lot.IDitem
                    left outer join warehouse wh on  wh.IDcompany = tmp.IDcompany and s.IDwarehouse = wh.IDwarehouse
                    left outer join warehouse_location wh_lc on  wh_lc.IDcompany = tmp.IDcompany and s.IDlocation = wh_lc.IDlocation
                ")
                ->where('tmp.IDcompany', $user->IDcompany)
                ->where('tmp.username', $user->username)
                ->orderBy('stepRoll')
                ->orderBy('IDlot')
                ->get();

        return response()->json($res);
    }

    /**
     * @OA\Post(
     *   tags={"MaterialTransfer", "material_transfer.php"},
     *   path="/materials-transfer",
     *   summary="Create new materials transfer",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idStocks"
     *       },
     *       @OA\Property(property="idStocks", type="array"),
     *       example={
     *          "idStocks": {52722, 34455}
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK"
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */

    public function store(StoreMaterialTransferRequest $request)
    {
        $this->authorize('store', MaterialTransferTemp::class);

        $user = auth()->user();

        DB::transaction(function() use ($user, $request) {
            foreach($request->idStocks as $idStock){
                $stock = 
                    Stock::sharedLock()
                        ->select('qty_stock')
                        ->where('IDstock', $idStock)
                        ->firstOrFail();

                $material =
                    MaterialTransferTemp::sharedLock()
                        ->where('IDstock', $idStock)
                        ->where('IDcompany', $user->IDcompany)
                        ->where('username', $user->username)
                        ->first();

                if(!$material){
                    MaterialTransferTemp::insert([
                        'IDcompany' => auth()->user()->IDcompany,
                        'username' => auth()->user()->username,
                        'qty' => $stock->qty_stock,
                        'IDstock' => $idStock,
                        'date_ins' => now('UTC')
                    ]);
                    
                    $res = 
                        DB::query()
                            ->selectRaw("l.IDcompany as IDcompany, s.qty_stock as qty, s.IDstock as IDstock, username = ?, date_ins = getutcdate()")
                            ->fromRaw("
                                dbo.stock s
                                inner join dbo.lot l on s.IDcompany = l.IDcompany and s.IDlot = l.IDlot
                                where l.IDlot_padre in (select distinct				
                                    case when l.stepRoll = 1 then l.IDlot_padre
                                    else 'ZZZZZZZZZZZZZ'end /* ID lotto padre fasullo per non estrarre nulla */
                                    from dbo.material_transfer_temp t
                                    inner join dbo.stock s on s.IDcompany = t.IDcompany and t.IDStock = s.IDstock
                                    inner join dbo.lot l on l.IDcompany = t.IDcompany and s.IDlot = l.IDlot
                                    where t.IDcompany = ? and username = ?)
                                and s.IDcompany = ?
                                and l.stepRoll = 1
                                and s.IDstock not in (select tt.IDStock from dbo.material_transfer_temp tt where tt.IDcompany = ?)
                            ", [
                                $user->username,
                                $user->IDcompany,
                                $user->username,
                                $user->IDcompany,
                                $user->IDcompany,
                            ])
                            ->get();

                    MaterialTransferTemp::insert(json_decode($res,true));
                }		
            }            
        });
    }

    /**
     * @OA\PUT(
     *   tags={"MaterialTransfer", "material_transfer.php"},
     *   path="/materials-transfer/{idTrans}",
     *   summary="Update qty for material transfer",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "qty"
     *       },
     *       @OA\Property(property="qty", type="float"),
     *       example={
     *          "qty": 2.947
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function update(UpdateMaterialTransferRequest $request, $idTrans)
    {
        $this->authorize('update', MaterialTransferTemp::class);

        $user = auth()->user();

        $material = 
            MaterialTransferTemp::query()
                ->lockForUpdate()
                ->where([
                    'IDcompany' => $user->IDcompany,
                    'username' => $user->username,
                    'IDtrans' => $idTrans
                ])
                ->with('stock.lot.item')
                ->firstOrFail();

        abort_if($material->stock->lot->item->um == 'm2', 403);

        DB::transaction(function() use ($user, $request, $material) {
                   
            $qnt = 
                Stock::query()
                    ->sharedLock()
                    ->join('material_transfer_temp', function($q){
                        $q->on('stock.IDcompany', '=', 'material_transfer_temp.IDcompany');
                        $q->on('stock.IDstock', '=', 'material_transfer_temp.IDstock');
                    })
                    ->where([
                        'material_transfer_temp.IDcompany' => $user->IDcompany,
                        'material_transfer_temp.username' => $user->username,
                        'material_transfer_temp.IDtrans' => $material->IDtrans
                    ])
                    ->sum('qty_stock');
            
            $material->qty = $qnt < $request->qty ? $qnt : $request->qty;
            $material->save();

        });
    }

     /**
     * @OA\DELETE(
     *   tags={"MaterialTransfer", "material_transfer.php"},
     *   path="/materials-transfer/{idTrans}",
     *   summary="Delete material transfer",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error"),
     *   @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function delete($idTrans)
    {   
        $this->authorize('delete', MaterialTransferTemp::class);

        $user = auth()->user();

        $material = 
            MaterialTransferTemp::query()
                ->where([
                    'IDcompany' => $user->IDcompany,
                    'username' => $user->username,
                    'IDtrans' => $idTrans
                ])
                ->firstOrFail();  

        DB::transaction(function() use ($user, $material){
            $stepRollLot = 
                DB::query()
                    ->selectRaw("ss.IDlot")
                    ->fromRaw("
                        dbo.material_transfer_temp t
                        inner join dbo.stock ss on ss.IDcompany = t.IDcompany and t.IDStock = ss.IDstock
                    ")
                    ->where([
                        't.IDcompany' => $user->IDcompany,
                        't.username' => $user->username,
                        't.IDtrans' => $material->IDtrans
                    ])
                    ->first()?->IDlot;

            $material->delete();

            if($stepRollLot){
                MaterialTransferTemp::query()
                    ->where([
                        'IDcompany' => $user->IDcompany,
                        'username' => $user->username,
                    ])
                    ->whereIn('IDtrans', function($q) use ($user, $stepRollLot){
                        $q->selectRaw('t.IDtrans')
                            ->fromRaw("
                                dbo.material_transfer_temp t
                                inner join dbo.stock sss on sss.IDcompany = t.IDcompany and sss.IDstock = t.IDStock
                                inner join lot l on l.IDcompany = t.IDcompany and sss.IDlot = l.IDlot
                            ")
                            ->where([
                                't.IDcompany' => $user->IDcompany,
                                't.username' => $user->username,
                            ])
                            ->where('l.IDlot_padre', '=', function($q) use ($user, $stepRollLot){
                                $q->select('IDlot_padre')
                                    ->from('lot')
                                    ->where([
                                        'IDcompany' => $user->IDcompany,
                                        'IDlot' => $stepRollLot
                                    ]);     
                            })
                            ->where('l.stepRoll', 1);
                    })
                    ->delete();
            }        
        });
    }

     /**
     * @OA\POST(
     *   tags={"MaterialTransfer", "material_transfer.php"},
     *   path="/materials-transfer/confirm",
     *   summary="Confirm materials transfer",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idWarehouse", "idWarehouseLocation"
     *       },
     *       @OA\Property(property="idWarehouse", type="int"),
     *       @OA\Property(property="idWarehouseLocation", type="int"),
     *       example={
     *          "idWarehouse": 1,
     *          "idWarehouseLocation": 236
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
    public function confirm(ConfirmMaterialTransferRequest $request)
    {
        $this->authorize('confirm', MaterialTransferTemp::class);

        $user = auth()->user();

        DB::transaction(function() use ($user, $request){
            $materials = 
                MaterialTransferTemp::query()
                    ->where([
                        'IDcompany' => $user->IDcompany,
                        'username' => $user->username,
                    ])
                    ->with('stock.lot.item')
                    ->get();

            if($materials->isEmpty()){
                abort(404);
            }

            foreach($materials as $material){
                if(!$material->stock){
                    abort(422, "Material not in stock. Please delete.");
                }

                $um = $material->stock?->lot?->item?->um;

                DB::statement("exec dbo.sp_main_stock_transaction ?,?,?,?,?,?,?,?,?,?,?,?", [
                    $material->IDcompany,
                    $material->stock->IDlot,
                    $material->stock->IDwarehouse,
                    $material->stock->IDlocation,
                    $um,
                    '-',
                    $material->qty,
                    5,
                    $user->username,
                    '',
                    null,
                    null
                ]);

                DB::statement("exec dbo.sp_main_stock_transaction ?,?,?,?,?,?,?,?,?,?,?,?", [
                    $material->IDcompany,
                    $material->stock->IDlot,
                    $request->idWarehouse,
                    $request->idWarehouseLocation,
                    $um,
                    '+',
                    $material->qty,
                    5,
                    $user->username,
                    '',
                    null,
                    null
                ]);

                $material->delete();
            }
        });
    }

}
