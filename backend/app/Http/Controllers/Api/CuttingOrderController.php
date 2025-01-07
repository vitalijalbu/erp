<?php

namespace App\Http\Controllers\Api;

use App\Helpers\Utility;
use App\Models\Lot;
use App\Models\CuttingOrder;
use Illuminate\Http\Request;
use App\Models\CuttingOrderRow;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Requests\ConfirmCuttingRequest;
use App\Http\Requests\CuttingViewRequest;
use App\Http\Requests\DeleteCuttingOrderRequest;
use App\Http\Requests\PrintCuttingRequest;
use App\Http\Requests\PrintLabelRequest;
use App\Http\Requests\StoreCuttingRequest;
use App\Http\Requests\UpdateCuttingRequest;
use App\Pdf\PrintCuttingOrderPdf;
use App\Pdf\PrintLabelsPdf;

class CuttingOrderController extends Controller
{
    /**
     * @OA\GET(
     *   tags={"cutting", "cutting.php"},
     *   path="/cutting",
     *   summary="List of cutting and lots data",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idLot"
     *       },
     *       @OA\Property(property="idLot", type="string"),
     *       example={
     *          "idLot": "FRLYF22002689"
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
    public function index(CuttingViewRequest $request)
    {
        $this->authorize('index', CuttingOrder::class);

        $user = auth()->user();

        $lotInfo = 
            DB::query()
                ->selectRaw("IDitem, item, item_desc, um, pz, la, lu, m2, IDwh, IDwhl, whdesc, whlcdesc, stepRoll, ord_rif, qty_stock, note, (select substring(convert(varchar, date_planned, 20),1,16) from dbo.cutting_order where IDcompany = l.IDcompany and IDlot = l.IDlot) as date_planned")
                ->when($user->company->read_alternative_item_code, function($q){
                    $q->addSelect(DB::raw("NULLIF(l.altv_code, '') as altv_code, NULLIF(l.altv_desc, '') as altv_desc"));
                }, function($q){
                    $q->addSelect(DB::raw('altv_code = null, altv_desc = null'));
                })
                ->fromSub(Lot::getLotInfoByCompany($user->company), 'l')
                ->where([
                    'l.IDlot' => $request->idLot,
                    'l.IDcompany' => $user->IDcompany
                ])
                ->first();

        $cuts = CuttingOrderRow::getCutsByLotAndCompany($request->idLot, $user->IDcompany)->get();

        $lotsByStepRollLot = Lot::getAllLotsByStepRollLot($request->idLot, $user->company)->get();

        return response()->json([
            'lotInfo' => $lotInfo,
            'cuts' => $cuts,
            'lotsByStepRollLot' => $lotsByStepRollLot
        ]);
    }

    /**
     * @OA\POST(
     *   tags={"Cutting"},
     *   path="/cutting",
     *   summary="Create new cutting row",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idLot", "la", "lu", "pz", "stepRoll", "stepRollOrder", "idWarehouseLocation"
     *       },
     *       @OA\Property(property="idLot", type="string"),
     *       @OA\Property(property="la", type="float"),
     *       @OA\Property(property="lu", type="float"),
     *       @OA\Property(property="pz", type="int"),
     *       @OA\Property(property="stepRoll", type="boolean"),
     *       @OA\Property(property="stepRollOrder", type="int|null"),
     *       @OA\Property(property="idWarehouseLocation", type="int"),
     *       @OA\Property(property="ordRef", type="string|null"),
     *       example={
     *          "idLot" : "FRLYF22002689",
     *           "la" : 200,
     *           "lu" : 400,
     *           "pz" : 3,
     *           "idWarehouseLocation" : 503,
     *           "stepRoll" : 0,
     *           "stepRollOrder" : 4,
     *           "ordRef" : ""
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
    public function store(StoreCuttingRequest $request)
    {
        $this->authorize('store', CuttingOrder::class);

        $user = auth()->user();

        DB::transaction(function() use ($request, $user) {
            DB::statement("exec dbo.sp_cutting_order_insert_row ?,?,?,?,?,?,?,?,?,?", [
                $user->IDcompany,
                $request->idLot,
                $request->la,
                $request->lu,
                $request->pz,
                $request->ordRef ?? '',
                $request->stepRoll,
                $request->stepRoll ? $request->stepRollOrder : 0,
                $user->username,
                $request->idWarehouseLocation
            ]);
        });
    }

    /**
     * @OA\PUT(
     *   tags={"Cutting"},
     *   path="/cutting",
     *   summary="Update cutting rows",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "cuts", "idLot"
     *       },
     *       @OA\Property(property="cuts", type="array"),
     *       @OA\Property(property="idLot", type="string"),
     *       example={
     *          "idLot": "FRLYF20002773", 
     *          "cuts": {
     *              "143781": {
     *                  "la" : 400,
     *                  "lu": 200,
     *                  "pz" : 4
     *              }
     *          },
     *          "plannedDate" : "2023-05-29"
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
    public function update(UpdateCuttingRequest $request)
    {
        $this->authorize('update', CuttingOrder::class);

        $user = auth()->user();

        DB::transaction(function() use ($user, $request){
            if($request->plannedDate){                
                CuttingOrder::where([
                    'IDlot' => $request->idLot,
                    'IDcompany' => $user->IDcompany
                ])
                ->update([
                    'date_planned' => Utility::convertDateFromTimezone($request->plannedDate.' 12:00', $user->clientTimezoneDB, 'UTC', 'Y-m-d H:i')
                ]);
            }

            foreach($request->cuts as $idCut => $cut){            
                CuttingOrderRow::where([
                    'IDcut' => $idCut,
                    'IDcompany' => $user->IDcompany
                ])
                ->update([
                    'LA' => $cut['la'],
                    'LU' => $cut['lu'],
                    'PZ' => $cut['pz'],
                ]);
            }
        });
    }

    /**
     * @OA\Delete(
     *   tags={"Cutting"},
     *   path="/cutting/{id}",
     *   summary="Delete cutting row",
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
    public function delete(CuttingOrderRow $cutting)
    {
        $this->authorize('delete', $cutting);

        $user = auth()->user();

        DB::transaction(function() use ($cutting, $user){
            $order = 
                CuttingOrder::where([
                    'IDcompany' => $user->IDcompany,
                    'IDlot' => $cutting->IDlot
                ])->firstOrFail();
            
            abort_if($order->executed, 400);

            $cutting->delete();

            $Nrows = 
                CuttingOrderRow::where([
                    'IDcompany' => $user->IDcompany,
                    'IDlot' => $order->IDlot
                ])
                ->count();

            if($Nrows == 0){
                $order->delete();
            }
        });
    }

    /**
     * @OA\POST(
     *   tags={"Cutting"},
     *   path="/cutting/confirm",
     *   summary="Confirm cutting order",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idLot"
     *       },
     *       @OA\Property(property="idLot", type="string"),
     *       example={
     *          "idLot": "FRLYF20002773"
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
    public function confirm(ConfirmCuttingRequest $request)
    {  
        $this->authorize('confirm', CuttingOrder::class);

        $user = auth()->user();

        $cuts = CuttingOrderRow::getCutsByLotAndCompany($request->idLot, $user->IDcompany)->count();

        abort_if($cuts < 1, 403);

        $lot = 
            DB::query()
                ->select('IDitem', 'IDwh')
                ->fromSub(Lot::getLotInfoByCompany($user->company), 'l')
                ->where([
                    'l.IDlot' => $request->idLot,
                    'l.IDcompany' => $user->IDcompany
                ])
                ->first();

        abort_if(!$lot, 404);
        
        DB::transaction(function() use ($request, $user, $lot){
            DB::statement('exec dbo.sp_cutting_order_confirm ?,?,?,?,?', [
                $user->IDcompany,
                $request->idLot,
                $lot->IDitem,
                $lot->IDwh,
                $user->username
            ]);
        });
    }
}
