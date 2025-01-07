<?php

namespace App\Http\Controllers\Api;

use App\Models\Lot;
use App\Models\Stock;
use App\Models\Inventory;
use App\Exports\StocksExport;
use App\DataTables\StocksDataTable;
use App\Helpers\Utility;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\EraseAndAddNewLotRequest;
use App\Http\Requests\EraseLotRequest;
use App\Http\Requests\StockInventoryLotRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockController extends ApiController
{
    /**
     * @OA\Get(
     *   tags={"Stock"},
     *   path="/stocks",
     *   summary="Stocks list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/StockResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $this->authorize('index', Stock::class);

        $c =  (new StocksDataTable(
            Stock::getStocks(auth()->user()->company))
        )
        ->with([
            'id_inventory' => Inventory::getCodeCurrentlyRunning(auth()->user()->IDcompany)
        ])
        ->filterColumn('date_lot', function($q, $k){
            $q->where($this->getColumnName('date_lot'), $this->getColumnSearchOperator('date_lot'), Utility::convertDateFromTimezone($k.'12:00', auth()->user()->clientTimezoneDB, 'UTC', 'Y-m-d'));
        })
        ->filterColumn('lot_ori_year', function($q, $k){
            $q->whereYear($this->getColumnName('lot_ori_year'), $this->getColumnSearchOperator('lot_ori_year'), $k);
        });

        return $c->toJson();
    }

    /**
     * @OA\PUT(
     *   tags={"Stock"},
     *   path="/stocks/inventory-lots/{id_lot}",
     *   summary="Update lot inventory in stocks",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "id_warehouse", "id_warehouse_location"
     *       },
     *       @OA\Property(property="id_warehouse", type="int"),
     *       @OA\Property(property="id_warehouse_location", type="int"),
     *       example={
     *          "id_warehouse": 17,
     *          "id_warehouse_location": 435,
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
    public function inventoryAddLot(Lot $lot, StockInventoryLotRequest $request)
    {
        $this->authorize('inventoryAddLot', Stock::class);
        
        if(!Stock::inventoryAddLot($lot->IDlot, auth()->user(), $request)){
            abort(500);
        }   
    }

    /**
     * @OA\DELETE(
     *   tags={"Stock"},
     *   path="/stocks/inventory-lots/{id_lot}",
     *   summary="Delete lot inventory in stocks",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "id_warehouse", "id_warehouse_location"
     *       },
     *       @OA\Property(property="id_warehouse", type="int"),
     *       @OA\Property(property="id_warehouse_location", type="int"),
     *       example={
     *          "id_warehouse": 17,
     *          "id_warehouse_location": 435,
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
    public function inventoryDelLot(Lot $lot, StockInventoryLotRequest $request)
    {
        $this->authorize('inventoryDelLot', Stock::class);

        if(!Stock::inventoryDelLot($lot->IDlot, auth()->user(), $request)){
            abort(500);
        }      
    }

    /**
     * @OA\Get(
     *   tags={"Stock", "report_service_export_stock_all.php"},
     *   path="/stocks/report-export-all",
     *   summary="Export complete stock situation",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\MediaType(
     *       mediaType="text/csv"
     *     )
     *   )
     *)
     */
    public function reportExportAll()
    {
        $this->authorize('export', Stock::class);
        
        $data = Stock::getStockViewer(auth()->user()->IDcompany)->get();
        
        $exporter = new \App\Exports\ReportAllStockExport($data);

        return response(
            $exporter->exportAs('Xlsx'),
            headers:[
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'inline'
            ]
        );
    }

  /**
    * @OA\Get(
    *   tags={"Stock"},
    *   path="/stocks/export",
    *   summary="Export Stocks list XLSX",
    *   @OA\Response(
    *     response=200,
    *     description="OK",
    *     @OA\JsonContent(
    *       type="object",
    *       @OA\Property(
    *         property="data",
    *         type="array",
    *         @OA\Items(ref="#/components/schemas/StockResource")
    *       ),
    *     )
    *   )
    * )
    */
    public function export(Request $request)
    {
        $this->authorize('export', Stock::class);

        $d = new StocksDataTable(
            Stock::getStocks(auth()->user()->company)
        );
    
        return response(
            $d->exportAs('Xlsx', $request->query('paginating', false), StocksExport::class),
            headers: [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'inline'
            ]
        );
    }

     /**
     * @OA\Get(
     *   tags={"Stocks"},
     *   path="/stocks/{id}/lot-dimensions",
     *   summary="Get lot dimensions by stock",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/StockResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */

    public function getLotDimensions(Stock $stock)
    {
        $this->authorize('getLotDimensions', $stock);

        $stock->loadMissing([
            'lot',
            'lot.item',
            'lot.dimensions' => function($q){
                $q->where('IDcompany', auth()->user()->IDcompany);
            },
            'lot.item.unit'
        ]);

        return response($stock);
    }

     /**
     * @OA\PUT(
     *   tags={"Stock", "adjustments_lot.php"},
     *   path="/stocks/{id}/erase-and-add-new-lot",
     *   summary="Erase stock and add new lot",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idAdjustmentType", "qty", "de", "di", "la", "lu", "pz"
     *       },
     *       @OA\Property(property="idAdjustmentType", type="int"),
     *       @OA\Property(property="qty", type="float|null"),
     *       @OA\Property(property="de", type="float|null"),
     *       @OA\Property(property="di", type="float|null"),
     *       @OA\Property(property="la", type="float|null"),
     *       @OA\Property(property="lu", type="float|null"),
     *       @OA\Property(property="pz", type="float|null"),
     *       example={
     *          "idAdjustmentType" : 3,
     *          "qty" : 30,
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
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */

    public function eraseAndAddNewLot(Stock $stock, EraseAndAddNewLotRequest $request)
    {
        $user = auth()->user();

        DB::transaction(function() use ($request, $stock, $user){
            DB::statement("exec dbo.sp_adjustments_erase_add_lots ?,?,?,?,?,?,?,?,?,?,?,?,?,?", [
                $user->IDcompany,
                $stock->IDlot,
                $stock->IDwarehouse,
                $stock->IDlocation,
                $request->de ?? 0,
                $request->di ?? 0,
                $request->la ?? 0,
                $request->lu ?? 0,
                $request->pz ?? 0,
                $request->qty ?? 0,
                $user->username,
                $request->idAdjustmentType,
                $stock->lot->item->um,
                $stock->lot->item->unit->frazionabile
            ]);
        });
    }

    /**
     * @OA\DELETE(
     *   tags={"Stock", "adjustments_lot.php"},
     *   path="/stocks/{id}/erase-lot",
     *   summary="Erase stock lot",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idAdjustmentType"
     *       },
     *       @OA\Property(property="idAdjustmentType", type="int"),
     *       example={
     *          "idAdjustmentType" : 3
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

    public function eraseLot(Stock $stock, EraseLotRequest $request)
    {
        $user = auth()->user();

        DB::transaction(function() use ($stock, $user, $request){
            DB::statement("exec dbo.sp_adjustments_erase_lots ?,?,?,?,?,?", [
                $user->IDcompany,
                $stock->IDlot,
                $stock->IDwarehouse,
                $stock->IDlocation,
                $user->username,
                $request->idAdjustmentType
            ]);
        });
        
    }
}
