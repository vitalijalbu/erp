<?php

namespace App\Http\Controllers\Api;

use App\Models\Stock;
use Illuminate\Http\Request;
use App\Models\MaterialIssueTemp;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMaterialIssueRequest;
use App\Http\Requests\UpdateMaterialIssueRequest;
use App\Http\Requests\ConfirmMaterialIssueRequest;
use App\Models\Shipment;

class MaterialIssueController extends Controller
{
     /**
     * @OA\Get(
     *   tags={"MaterialIssue", "material_issue.php"},
     *   path="/materials-issue",
     *   summary="Get list of materials issue",
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
        $this->authorize('index', MaterialIssueTemp::class);

        $user = auth()->user();

        $res = 
            DB::query()
                ->selectRaw("tmp.IDissue, s.IDlot as IDlot, item.item, item.item_desc, item.um as um, tmp.qty, dbo.getDimByLot (tmp.IDcompany, s.IDlot) as dim ,wh.[desc] as whdesc, wh_lc.[desc] as lcdesc, stepRoll")
                ->fromRaw("
                    dbo.material_issue_temp tmp
                    left outer join dbo.stock s on s.IDstock = tmp.IDStock
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
     *   tags={"MaterialIssue", "material_issue.php"},
     *   path="/materials-issue",
     *   summary="Create new materials issue",
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

    public function store(StoreMaterialIssueRequest $request)
    {
        $this->authorize('store', MaterialIssueTemp::class);

        $user = auth()->user();

        DB::transaction(function() use ($user, $request) {
            foreach($request->idStocks as $idStock){
                $stock = 
                    Stock::sharedLock()
                        ->select('qty_stock')
                        ->where('IDstock', $idStock)
                        ->firstOrFail();

                $material =
                    MaterialIssueTemp::sharedLock()
                        ->where('IDstock', $idStock)
                        ->where('IDcompany', $user->IDcompany)
                        ->where('username', $user->username)
                        ->first();

                if(!$material){
                    MaterialIssueTemp::insert([
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
                                    from dbo.material_issue_temp t
                                    inner join dbo.stock s on s.IDcompany = t.IDcompany and t.IDStock = s.IDstock
                                    inner join dbo.lot l on l.IDcompany = t.IDcompany and s.IDlot = l.IDlot
                                    where t.IDcompany = ? and username = ?)
                                and s.IDcompany = ?
                                and l.stepRoll = 1
                                and s.IDstock not in (select tt.IDStock from dbo.material_issue_temp tt where tt.IDcompany = ?)
                            ", [
                                $user->username,
                                $user->IDcompany,
                                $user->username,
                                $user->IDcompany,
                                $user->IDcompany,
                            ])
                            ->get();

                    MaterialIssueTemp::insert(json_decode($res,true));
                }		
            }            
        });
    }

    /**
     * @OA\PUT(
     *   tags={"MaterialIssue", "material_issue.php"},
     *   path="/materials-issue/{idIssue}",
     *   summary="Update qty for material issue",
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
    public function update(UpdateMaterialIssueRequest $request, $idIssue)
    {
        $this->authorize('update', MaterialIssueTemp::class);

        $user = auth()->user();

        $material = 
            MaterialIssueTemp::query()
                ->lockForUpdate()
                ->where([
                    'IDcompany' => $user->IDcompany,
                    'username' => $user->username,
                    'IDissue' => $idIssue
                ])
                ->with('stock.lot.item')
                ->firstOrFail();

        abort_if($material->stock->lot->item->um == 'm2', 403);

        DB::transaction(function() use ($user, $request, $material) {
                   
            $qnt = 
                Stock::query()
                    ->sharedLock()
                    ->join('material_issue_temp', function($q){
                        $q->on('stock.IDcompany', '=', 'material_issue_temp.IDcompany');
                        $q->on('stock.IDstock', '=', 'material_issue_temp.IDstock');
                    })
                    ->where([
                        'material_issue_temp.IDcompany' => $user->IDcompany,
                        'material_issue_temp.username' => $user->username,
                        'material_issue_temp.IDissue' => $material->IDissue
                    ])
                    ->sum('qty_stock');
            
            $material->qty = $qnt < $request->qty ? $qnt : $request->qty;
            $material->save();

        });
    }

    /**
     * @OA\DELETE(
     *   tags={"MaterialIssue", "material_issue.php"},
     *   path="/materials-issue/{idIssue}",
     *   summary="Delete material issue",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error"),
     *   @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function delete($idIssue)
    {   
        $this->authorize('delete', MaterialIssueTemp::class);

        $user = auth()->user();

        $material = 
            MaterialIssueTemp::query()
                ->where([
                    'IDcompany' => $user->IDcompany,
                    'username' => $user->username,
                    'IDissue' => $idIssue
                ])
                ->firstOrFail();  

        DB::transaction(function() use ($user, $material){
            $stepRollLot = 
                DB::query()
                    ->selectRaw("ss.IDlot")
                    ->fromRaw("
                        dbo.material_issue_temp t
                        inner join dbo.stock ss on ss.IDcompany = t.IDcompany and t.IDStock = ss.IDstock
                    ")
                    ->where([
                        't.IDcompany' => $user->IDcompany,
                        't.username' => $user->username,
                        't.IDissue' => $material->IDissue
                    ])
                    ->first()?->IDlot;

            $material->delete();

            if($stepRollLot){
                MaterialIssueTemp::query()
                    ->where([
                        'IDcompany' => $user->IDcompany,
                        'username' => $user->username,
                    ])
                    ->whereIn('IDissue', function($q) use ($user, $stepRollLot){
                        $q->selectRaw('t.IDissue')
                            ->fromRaw("
                                dbo.material_issue_temp t
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
     *   tags={"MaterialIssue", "material_issue.php"},
     *   path="/materials-issue/confirm",
     *   summary="Confirm materials issue",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idBP", "idDestination", "ordRef", "deliveryNote"
     *       },
     *       @OA\Property(property="idBP", type="int"),
     *       @OA\Property(property="idDestination", type="int"),
     *       @OA\Property(property="ordRef", type="string"),
     *       @OA\Property(property="deliveryNote", type="string"),
     *       example={
     *          "idBP": 5903,
     *          "idDestination": 3469,
     *          "ordRef": "Ordine #xxxx",
     *          "deliveryNote": "Note di prova",
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
    public function confirm(ConfirmMaterialIssueRequest $request)
    {
        $this->authorize('confirm', MaterialIssueTemp::class);

        $user = auth()->user();

        DB::transaction(function() use ($user, $request){
            $materials = 
                MaterialIssueTemp::query()
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
                    3,
                    $user->username,
                    $request->ordRef,
                    $request->idBP,
                    null
                ]);

                Shipment::create([
                    'IDcompany' => $material->IDcompany,
                    'date_ship' => now('UTC'),
                    'IDlot' => $material->stock->IDlot,
                    'qty' => $material->qty,
                    'IDbp' => $request->idBP,
                    'IDdestination' => $request->idDestination,
                    'delivery_note' => $request->deliveryNote
                ]);

                $material->delete();
            }
        });
    }
}
