<?php

namespace App\Http\Controllers\Api;

use App\Models\Transaction;
use App\Models\TransactionsType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Requests\LastTransactionBySupplierAndItemRequest;

class TransactionController extends Controller
{
    /**
     * @OA\GET(
     *   tags={"Transactions"},
     *   path="/transactions/last-by-supplier-and-item",
     *   summary="Get last transactions by supplier and item",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idItem", "idBP"
     *       },
     *       @OA\Property(property="idItem", type="int"),
     *       @OA\Property(property="idBP", type="int"),
     *       example={
     *          "idItem": 3539,
     *          "idBP": 6817,
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */

    public function lastBySupplierAndItem(LastTransactionBySupplierAndItemRequest $request)
    {
        $this->authorize('lastBySupplierAndItem', Transaction::class);
        
        $transactions = 
            Transaction::query()
                ->select('*')
                ->addSelect(DB::raw('dbo.getDimByLot (transactions.IDcompany, transactions.IDlot) as dimensions'))
                ->whereHas('lot', function($q) use ($request) {
                    $q
                        ->where('IDbp', $request->idBP)
                        ->where('IDitem', $request->idItem);
                })
                ->whereHas('warehouse')
                ->whereHas('warehouseLocation')
                ->where([
                    'IDcompany' => auth()->user()->IDcompany,
                    'IDtrantype' => 1,
                    'segno' => '+'
                ])
                ->with('lot')
                ->with('warehouseLocation.warehouse')
                ->take(10)
                ->withAggregate('lot', 'date_ins')
                ->orderBy('lot_date_ins')
                ->get();

        return response()->json( $transactions);
    }

    /**
     * @OA\GET(
     *   tags={"Transactions"},
     *   path="/transactions/last-by-user",
     *   summary="Get last transactions by user",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function lastByUser()
    {
        $res =
            DB::query()
                ->selectRaw("substring(convert(varchar, date_tran, 20),1,16) AS data_exec, t.IDlot ,i.item,i.item_desc, w.[desc] as whdesc, wl.[desc] as whldesc, segno, qty, i.um,tt.[desc] as trdesc, t.ord_rif, username, bp.[desc] as bpdesc, dbo.getDimByLot (t.IDcompany, t.IDlot) as dimensions")
                ->fromRaw("dbo.transactions t
                inner join dbo.transactions_type tt on tt.IDtrantype = t.IDtrantype
                inner join dbo.lot l on t.IDcompany = l.IDcompany and t.IDlot = l.IDlot
                inner join dbo.item i on i.IDitem = l.IDitem
                inner join dbo.warehouse w on w.IDcompany = t.IDcompany and t.IDwarehouse = w.IDwarehouse
                inner join dbo.warehouse_location wl on wl.IDcompany = t.IDcompany and t.IDlocation = wl.IDlocation
                left outer join dbo.bp bp on bp.IDcompany = t.IDcompany and bp.IDbp = t.IDbp
                ")
                ->where([
                    't.IDcompany' => auth()->user()->IDcompany,
                    't.username' => auth()->user()->username,
                ])
                ->orderByDesc('date_tran')
                ->take(10)
                ->get();
        
        return response()->json($res);
                
    }


    /**
     * @OA\GET(
     *   tags={"Transactions"},
     *   path="/transactions/types",
     *   summary="Get available transaction types",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function transactionTypes()
    {
        $response = TransactionsType::orderBy('desc')->get();

        return response()->json($response);
    }
}
