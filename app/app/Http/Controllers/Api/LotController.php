<?php

namespace App\Http\Controllers\Api;

use App\Models\Lot;
use App\Models\Stock;
use App\Helpers\Utility;
use App\Models\Inventory;
use Illuminate\Http\Request;
use App\DataTables\LotsDataTable;
use Illuminate\Support\Facades\DB;
use App\DataTables\LotValuesDataTable;
use App\Http\Requests\AddLotValueRequest;
use App\Http\Requests\AddLotValuesRequest;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\UpdateLotInfoRequest;
use App\Http\Requests\UpdateLotTextRequest;
use Illuminate\Contracts\Database\Eloquent\Builder;

class LotController extends ApiController
{
    /**
     * @OA\Get(
     *   tags={"Lot"},
     *   path="/lots",
     *   summary="Get list of lots",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/LotResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */

    public function index()
    {
        $this->authorize('viewAny', Lot::class);

        $d = (new LotsDataTable(
            Lot::query()
                ->where('IDcompany', auth()->user()->IDcompany)
        ));

        return $d->toJson();
    }


    /**
     * @OA\Get(
     *   tags={"Lot", "lot_value_manual_insert.php"},
     *   path="/lots/{id}",
     *   summary="Lot show",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/LotResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function show(Lot $lot)
    {
        $this->authorize('view', $lot);

        $lot->loadMissing([
            'item.unit', 
        ]);

        if(auth()->user()->can('viewValue', $lot)) {
            $lot->loadMissing([
                'latestValue', 
            ]);
        }
        
        return response()->json($lot);
    }

    /**
     * @OA\Get(
     *   tags={"Lot", "lot_value.php"},
     *   path="/lots/values",
     *   summary="Get lots values datatable",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/LotResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function values()
    {
        $this->authorize('viewAnyValues', Lot::class);

        $c =  (new LotValuesDataTable(
            Lot::getLotValuesToCheck(auth()->user()->IDcompany))
        );

        return $c->toJson();
    }

    /**
     * @OA\PUT(
     *   tags={"Lot", "lot_value.php"},
     *   path="/lots/values",
     *   summary="Add value for lots in bulk",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "lots",
     *       },
     *       @OA\Property(property="lots", type="object"),
     *       example={
     *          "lots": {
     *              "FRNAA23000003": 50,
     *              "FRNAA23000005": 20,
     *              "FRNAA23000009": 60
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
    public function addValues(AddLotValuesRequest $request)
    {
        $this->authorize('viewAnyValues', Lot::class);

        DB::transaction(function() use ($request) {
            foreach($request->input('lots') as $lotId => $value) {
                $lot = Lot::find($lotId);
                $this->authorize('setValue', $lot);
                if(!$lot->addValue(
                    $value,
                    auth()->user()->IDcompany,
                    auth()->user(),
                    true
                )) {
                    abort(500);
                }
            }
        });
    }

    
    /**
     * @OA\PUT(
     *   tags={"Lot", "lot_value.php"},
     *   path="/lots/{id}/value",
     *   summary="Add value for a single lot",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "value",
     *       },
     *       @OA\Property(property="value", type="number"),
     *       @OA\Property(property="note", type="string"),
     *       example={
     *          "value": 50,
     *          "note": "add operation note"
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
    public function addValue(AddLotValueRequest $request, Lot $lot)
    {
        $this->authorize('setValue', $lot);
        if(!$lot->addValue(
            $request->input('value'),
            auth()->user()->IDcompany,
            auth()->user(),
            true,
            $request->input('note', null)
        )) {
            abort(500);
        }
    }


    /**
     * @OA\Get(
     *   tags={"Lot", "lot_value_history.php"},
     *   path="/lots/{id}/value-history",
     *   summary="Get lot values history",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="lot",
     *         type="object",
     *         @OA\Items(ref="#/components/schemas/LotResource")
     *       ),
     *       @OA\Property(
     *         property="current_stock_value",
     *         type="number",
     *       )
     *     )
     *   )
     * )
     */
    public function valueHistory(Lot $lot)
    {
        $this->authorize('viewValue', $lot);

        $lot->loadMissing(['values' => function (Builder $query) {
            $query->orderBy('date_ins', 'ASC');
        }]);

        return response()->json([
            'lot' => $lot,
            'current_stock_value' => $lot->getStockValue()
        ]);
    }

    /**
     * @OA\Get(
     *   tags={"Lot"},
     *   path="/lots/{id}/inventory-check",
     *   summary="Check if lot is in inventory",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/LotResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function inventoryCheck(Lot $lot)
    {

        $this->authorize('inventoryCheck', $lot);

        $data = Stock::getStockViewer(auth()->user()->IDcompany)
            ->selectRaw('IDinventory')
            ->where('IDlot', $lot->IDlot)
            ->get();

        return response()->json($data);
    }

    /**
     * @OA\PUT(
     *   tags={"Lot"},
     *   path="/lots/{id}/text",
     *   summary="Update text for a single lot",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "note", "ordRef"
     *       },
     *       @OA\Property(property="ordRef", type="string"),
     *       @OA\Property(property="note", type="string"),
     *       example={
     *          "ordRef": "#xxxx",
     *          "note": "add operation note"
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

    public function updateText(UpdateLotTextRequest $request, Lot $lot)
    {
        $this->authorize('updateText', $lot);

        $lot->note = $request->note;
        $lot->ord_rif = $request->ordRef;

        if(!$lot->save()){
            abort(500);
        }
    }

    /**
     * @OA\Get(
     *   tags={"Lot"},
     *   path="/lots/{id}/stocks",
     *   summary="Get stocks by lot",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/LotResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function getStocks(Lot $lot)
    {
        abort_if(auth()->user()->IDcompany != $lot->IDcompany, 404);

        $this->authorize('getStocks', $lot);
        
        $lot->loadMissing([
            'stocks' => function($q){
                $q->where('IDcompany', auth()->user()->IDcompany);
            },
            'item',
            'stocks.warehouse',
            'stocks.warehouseLocation',
        ]);

        return response($lot);
    }

    /**
     * @OA\PUT(
     *   tags={"Lot"},
     *   path="/lots/{id}/info",
     *   summary="Update info for a single lot",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "dateLot", "eur1"
     *       },
     *       @OA\Property(property="dateLot", type="date"),
     *       @OA\Property(property="eur1", type="boolean"),
     *       example={
     *          "dateLot": "2023-05-25",
     *          "eur1": 0
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

     public function updateInfo(UpdateLotInfoRequest $request, Lot $lot)
     {
        abort_if(auth()->user()->IDcompany != $lot->IDcompany, 404);
        
         $this->authorize('updateInfo', $lot);
         $lot->date_lot = Utility::convertDateFromTimezone($request->dateLot.'12:00', auth()->user()->clientTimezoneDB, 'UTC', 'Y-m-d H:i');
         $lot->eur1 = $request->eur1;
 
         if(!$lot->save()){
             abort(500);
         }
     }


}