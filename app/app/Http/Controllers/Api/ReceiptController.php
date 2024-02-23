<?php

namespace App\Http\Controllers\Api;

use App\Models\BP;
use App\Models\Item;
use Illuminate\Http\Request;
use App\Helpers\Utility;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\ConfirmReceiptRequest;
use App\Http\Requests\ReceiptFromChiorinoRequest;
use App\Http\Requests\ReceiptPurchaseRequest;
use App\Models\Transaction;

class ReceiptController extends ApiController
{
    /**
     * @OA\POST(
     *   tags={"Receipts"},
     *   path="/receipts/purchase",
     *   summary="Confirm receipt purchase",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "ordRiferimento", "lotFornitore", "deliveryNote", "eur1", "confItem", "lotDate", "idWarehouse", "idWarehouseLocation", "idItem", "idBP", "de", "di", "la", "lu", "pz"
     *       },
     *       @OA\Property(property="ordRiferimento", type="string"),
     *       @OA\Property(property="lotFornitore", type="string"),
     *       @OA\Property(property="deliveryNote", type="string"),
     *       @OA\Property(property="eur1", type="boolean"),
     *       @OA\Property(property="confItem", type="boolean"),
     *       @OA\Property(property="lotDate", type="date"),
     *       @OA\Property(property="idWarehouse", type="int"),
     *       @OA\Property(property="idWarehouseLocation", type="int"),
     *       @OA\Property(property="idItem", type="int"),
     *       @OA\Property(property="idBP", type="int"),
     *       @OA\Property(property="de", type="float|null"),
     *       @OA\Property(property="di", type="float|null"),
     *       @OA\Property(property="la", type="float|null"),
     *       @OA\Property(property="lu", type="float|null"),
     *       @OA\Property(property="pz", type="float|null"),
     *       example={
     *          "ordRiferimento" : "MILTEC 117195",
     *           "lotFornitore" : "ITBIF22047050",
     *           "deliveryNote" : "testo libero",
     *           "eur1" : 0,
     *           "confItem" : 1,
     *           "lotDate" : "2023-05-09",
     *           "idWarehouse" : 1,
     *           "idWarehouseLocation" : 236,
     *           "idItem" : 3539,
     *           "idBP" : 6817,
     *           "de" : 0, 
     *           "di" : 0,
     *           "la" : 10.23, 
     *           "lu" : 2.34, 
     *           "pz" : 2
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
    public function purchase(ReceiptPurchaseRequest $request)
    {
        $this->authorize('purchase', 'receipt');
        
        $user = auth()->user();

        $res = DB::selectOne('EXEC dbo.sp_ricevimento_acquisto ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?', [
            $user->IDcompany,
            $request->ordRiferimento,
            $request->lotFornitore,
            Utility::convertDateFromTimezone($request->lotDate."12:00", $user->clientTimezoneDB, 'UTC', 'Y-m-d H:i'),
            0, //lot val
            $request->idWarehouse,
            $request->idWarehouseLocation,
            $request->idItem,
            $request->de ?? 0,
            $request->di ?? 0,
            $request->la ?? 0,
            $request->lu ?? 0,
            $request->pz ?? 0,
            $user->username,
            $request->um,
            $request->idBP,
            $request->eur1 ?? 0,
            $request->confItem ?? 0,
            '', //lot txt
            $request->deliveryNote
        ]);
               
        abort_if($res->response == 0, 500);
    }

    /**
     * @OA\GET(
     *   tags={"Receipts"},
     *   path="/receipts/from-chiorino",
     *   summary="List of Receipt lots from Chiorino S.p.A,",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "deliveryNote"
     *       },
     *       @OA\Property(property="deliveryNote", type="string"),
     *       @OA\Property(property="idLot", type="string|nullable"),
     *       example={
     *          "deliveryNote": "23E0000000000000388",
     *          "idLot" : ""
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
    public function fromChiorino(ReceiptFromChiorinoRequest $request)
    {
        $this->authorize('fromChiorino', 'receipt');

        $user = auth()->user();

        $sub = 
            DB::query()
                ->selectRaw("
                    [IDrecord]
                    ,substring(convert(varchar, [t_crdt], 20),1,16) AS delivery_note_date
                    ,[t_clot]      
                    ,[item]
                    ,item_desc
                    ,i.IDitem
                    ,[um]
                    ,[eur1]
                    ,[t_corn]
                    ,[t_qshp]
                    ,[dbo].[calcQtyFromDimensionByUM]([um],[LA],[LU],[PZ],[DE],[DI]) as qty
                    ,[t_amti]
                    ,[LA],
                    case when i.item_group = 'ES' then   
                            [LU] * [PZ]
                        else
                            [LU]
                        end as [LU],
                    [PZ],[DE],[DI]
                    ,(select COUNT(*) from lot where lot.IDcompany = etl.IDcompany and IDlot_fornitore = etl.[t_clot]) as LotAlreadyRec
                    ,stuff((
                    select ',' + IDcar+':'+ltrim(rtrim(umdesc))
                    from [dbo].[um_dimension]
                    where IDdim = i.um
                    order by Ordinamento asc
                    for xml path('')
                    ),1,1,'') as PermittedDim
                    ,c.CSM_bpid_code
                    ,etl.t_deln
                    ,etl.t_shpm		
                    ,etl.t_pono
                    ,etl.conf_item")
                ->fromRaw("[dbo].[zETL_LN_lots_delivery_notes_from_biella] etl
                    inner join dbo.company c on etl.IDcompany = c.IDcompany
                    inner join dbo.item i on i.IDitem = etl.IDitem
                    inner join dbo.vw_zETL_LN_lot_dimension_from_biellaPivot dim on dim.IDcompany = etl.IDcompany and 
                    dim.t_deln = etl.t_deln and 
                    dim.t_shpm = etl.[t_shpm] and
                    dim.t_pono = etl.[t_pono] and
                    dim.IDlot = etl.[t_clot]")
                ->when($user->company->read_alternative_item_code, function($q) use ($user){
                    $q->selectRaw("NULLIF(item_en.altv_code, '') as altv_code, NULLIF(item_en.altv_desc, '') as altv_desc")
                        ->leftJoin(DB::raw('dbo.item_enabled as item_en'), function($join) use ($user){
                            $join->on('i.IDitem', '=', 'item_en.IDitem');
                            $join->whereIn('item_en.IDcompany', [0, $user->IDcompany]);
                        });
                }, function($q){
                    $q->addSelect(DB::raw('altv_code = null, altv_desc = null'));
                })
                ->where('etl.IDcompany', $user->IDcompany)
                ->when($request->deliveryNote, function($q) use ($request){
                    $q->where('etl.t_deln', $request->deliveryNote);
                })
                ->when($request->idLot, function($q) use ($request){
                    $q->where('etl.t_clot', $request->idLot);
                });

        $ret = 
            DB::query()
                ->selectRaw("IDrecord,delivery_note_date,t_clot,item,item_desc,IDitem,um,eur1,t_corn,t_qshp,t_amti, LotAlreadyRec,conf_item, LA,LU,PZ,DE,DI, PermittedDim, t_deln, t_shpm, t_pono, CSM_bpid_code, altv_code, altv_desc")
                ->fromSub($sub, 'p')
                ->orderBy('t_deln')
                ->orderBy('t_shpm')
                ->orderBy('t_pono')
                ->get();

        return response()->json($ret);
    }

    /**
     * @OA\POST(
     *   tags={"Receipts"},
     *   path="/receipts/from-chiorino/confirm",
     *   summary="Confirm receipt from chiorino",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "deliveryNote", "lots"
     *       },
     *       @OA\Property(property="deliveryNote", type="string"),
     *       @OA\Property(property="idLot", type="string|nullable"),
     *       @OA\Property(property="lots", type="array"),
     *       example={
     *          "deliveryNote": "23E0000000000000388",
     *          "idLot" : "",
     *          "lots": {
     *              "886": {
     *                  "la": 40,
     *                  "lu": 35,
     *                  "de" : 23,
     *                  "pz" : 4, 
     *                  "received" : 1,
     *                  "ordRef" : "xxx",
     *                  "lotText" : "xxx",
     *                  "lotDate" : "2020-05-05",
     *                  "idWarehouse" : 1,
     *                  "idWarehouseLocation" : 293
     *              }
     *          }
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
    public function confirm(ConfirmReceiptRequest $request)
    {
        $this->authorize('confirm', 'receipt');

        $user = auth()->user();

        foreach($request->lots as $data){
            if($data['received']){
                $res = DB::selectOne('EXEC dbo.sp_ricevimento_acquisto ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?', [
                    $user->IDcompany,
                    $data['ordRef'],
                    $data['lotFornitore'],
                    Utility::convertDateFromTimezone($data['lotDate']."12:00", $user->clientTimezoneDB, 'UTC', 'Y-m-d H:i'),
                    $data['lotVal'] ?? 0, //lot val
                    $data['idWarehouse'],
                    $data['idWarehouseLocation'],
                    $data['idItem'],
                    $data['de'] ?? 0,
                    $data['di'] ?? 0,
                    $data['la'] ?? 0,
                    $data['lu'] ?? 0,
                    $data['pz'] ?? 0,
                    $user->username,
                    $data['um'],
                    $data['idBP'],
                    $data['eur1'],
                    $data['confItem'], //conf item
                    $data['lotText'], //lot txt
                    $data['deliveryNote']
                ]);
                        
                abort_if($res->response == 0, 500);
            }
        }
    }
}
