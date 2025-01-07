<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\Request;
use App\Models\WACYearLayer;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreWACYearLayerRequest;
use App\Http\Requests\WACCalcSimulationRequest;
use App\Http\Requests\WACCalcYearToDateReportRequest;
use App\DataTables\WACYearLayerReportDataTable;
use App\DataTables\WACCalcYearToDateReportDataTable;
use App\DataTables\WACCalcYearToDateReportLotsDetailsDataTable;
use App\Models\WACYearLayersItemDetail;

class WACController extends ApiController
{

    /**
     * @OA\Get(
     *   tags={"WAC", "wac_year_layer_manager.php"},
     *   path="/wac/available-years",
     *   summary="Get available years for creating a wac layer",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *     )
     *   )
     * )
     */
    public function availableYears()
    {
        $this->authorize('viewAny', WACYearLayer::class);

        $years = WACYearLayer::getAvailableYears(auth()->user()->IDcompany);

        return response()->json($years);
    }


    /**
     * @OA\Get(
     *   tags={"WAC", "wac_year_layer_manager.php"},
     *   path="/wac/layers",
     *   summary="Get all wac layers",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *     )
     *   )
     * )
     */
    public function layers()
    {
        $this->authorize('viewAny', WACYearLayer::class);
        
        $years = WACYearLayer::withNotCheckedCount()
            ->where('IDcompany', auth()->user()->IDcompany)
            ->orderBy('year_layer', 'ASC')
            ->get();

        return response()->json($years);
    }


    /**
     * @OA\Post(
     *   tags={"WAC", "wac_year_layer_manager.php"},
     *   path="/wac",
     *   summary="Create new or recreate wac layer",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "year"
     *       },
     *       @OA\Property(property="year", type="number"),
     *       example={
     *          "year": 2023,
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/WACYearLayerResource")
     *   ),
     *   @OA\Response(response=400, description="Not Valid Year"),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function addOrRecreateLayer(StoreWACYearLayerRequest $request)
    {
        $this->authorize('create', WACYearLayer::class);

        DB::transaction(function() use ($request) {
            if(!in_array(
                $request->input('year'), 
                WACYearLayer::getAvailableYears(auth()->user()->IDcompany)
            )) {
                abort(400);
            }
            WACYearLayer::addOrRecreate(
                auth()->user()->IDcompany,
                auth()->user()->username,
                $request->input('year')
            );
        });
    }


    /**
     * @OA\Put(
     *   tags={"WAC", "wac_year_layer_manager.php"},
     *   path="/wac/{id}/set-definitive",
     *   summary="Set a layer definitive",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "IDlayer"
     *       },
     *       @OA\Property(property="IDlayer", type="number"),
     *       example={
     *          "IDlayer": 1,
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/WACYearLayerResource")
     *   ),
     *   @OA\Response(response=400, description="Layer can't be definitive"),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function setDefinitive(Request $request, WACYearLayer $layer)
    {
        $this->authorize('update', $layer);
        
        DB::transaction(function() use ($request, $layer) {
            if(!$layer->canBeDefinitive()) {
                abort(400);
            }
            $layer->setDefinitive();
        });
    }

    /**
     * @OA\Get(
     *   tags={"WAC", "wac_year_layer_report.php"},
     *   path="/wac/layers/{year}/report",
     *   summary="Get the wac layer year report with the associated errors",
     *   @OA\Parameter(ref="#/components/parameters/year"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *     )
     *   )
     * )
     * 
     * @OA\Get(
     *   tags={"WAC", "wac_year_layer_report.php"},
     *   path="/wac/layers/{year}/report/export",
     *   summary="Get the wac layer year report in XLSX",
     *   @OA\Parameter(ref="#/components/parameters/year"),
     *   @OA\Response(
     *     response=200,
     *     description="OK"
     *   )
     * )
     */
    public function yearReport(Request $request, $year, $export = false)
    {
        $this->authorize('viewAny', WACYearLayer::class);

        $result =  new WACYearLayerReportDataTable(
            WACYearLayersItemDetail::select([
                'year_layer', 
                'item.item', 
                'item.item_desc', 
                'conf_item', 
                'um', 
                'stock_qty_start_year', 
                'stock_value_start_year',
		        'purchasedQty_on_the_year',
                'purchasedItemValue_on_the_year',
                'stock_qty_end_year',
                'stock_value_end_year',
            ])
            ->join('item', 'item.IDitem', '=', 'WAC_year_layers_item_detail.IDitem')
            ->where('WAC_year_layers_item_detail.IDcompany', auth()->user()->IDcompany)
            ->where('WAC_year_layers_item_detail.year_layer', $year)
        );

        if(!$request->get('order')) {
            $result->order(function($q){
                $q->orderBy('item');
            });
        }
        
        if($export) {
            return response(
                $result->exportAs('Xlsx', $request->query('paginating', false)),
                headers: [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'inline'
                ]
            );
        }
        else {
            $errors = DB::query()
                ->select([
                    'IDlot', 
                    'item', 
                    'um', 
                    'qty', 
                    'UnitValue'
                ])
                ->fromRaw('dbo.parView_WAC_ADD_LAY_stock_QtyValue_on_year_end(?, ?) err', [
                    auth()->user()->IDcompany,
                    $year
                ])
                ->join('item', 'err.IDitem', '=', 'item.IDitem')
                ->where('checked_value', 0)
                ->orderBy('item')
                ->get();

            $result->with([
                'errors' => $errors
            ]);
            return $result->toJson();
        }
    }

    /**
     * @OA\Get(
     *   tags={"WAC", "wac_calc_simulation.php"},
     *   path="/wac/calc-simulation",
     *   summary="Get the wac simulation data by item and date",
     *   @OA\Parameter(name="date", in="query", type="date"),
     *   @OA\Parameter(name="item", in="query", type="string"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *     )
     *   )
     * )
     * 
     * @OA\Get(
     *   tags={"WAC", "wac_calc_simulation.php"},
     *   path="/wac/calc-simulation/export",
     *   summary="Get the wac simulation data by item and date in XLSX",
     *   @OA\Parameter(name="date", in="query", type="date"),
     *   @OA\Parameter(name="item", in="query", type="string"),
     *   @OA\Response(
     *     response=200,
     *     description="OK"
     *   )
     * )
     */
    public function calcSimulation(WACCalcSimulationRequest $request, $export = false)
    {
        $this->authorize('viewAny', WACYearLayer::class);

        $date = \App\Helpers\Utility::dateToDB(
            \App\Helpers\Utility::userDateFromString(
                $request->input('date')
            )->setTime(23, 59, 59)
        );

        $result =  DB::query()
            ->select([
                'IDlot', 
                'PurchasedQty', 
                'um',  
                'PurchasedItemValue', 
                'Note', 
                'UnitValue', 
                'item', 
                'conf_item', 
                'date_tran', 
                DB::raw('year(date_tran) as year'),
                DB::raw('(
                    select qty_stock 
                        from [dbo].[parView_WAC_stock_transaction_group_by_item] (tr_acq.IDcompany, cast(year(date_tran) as varchar) + ?) 
                        where IDitem = tr_acq.IDitem and conf_item = tr_acq.conf_item
                    ) as stock_end_year
                ')
            ])
            ->addBinding('-12-31 23:59:00.000', 'select')
            ->fromRaw('[dbo].[parView_WAC_stock_purchase_transaction] (?, cast(cast(year(?) as varchar(4)) + ? as datetime), ?) tr_acq', [
                auth()->user()->IDcompany,
                $date->format('Y-m-d H:i:s'),
                '-01-01 00:00:00.000',
                $date->format('Y-m-d H:i:s')
            ])
            ->where('item', $request->input('item'))
            ->get();

        if($export) {
            $exporter = new \App\Exports\WACCalcSimulationExport($result);
            return response(
                $exporter->exportAs('Xlsx', $request->query('paginating', false)),
                headers: [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'inline'
                ]
            );
        }
        else {
            $layer = WACYearLayersItemDetail::select([
                    'year_layer', 
                    'item', 
                    'conf_item', 
                    'stock_qty_start_year', 
                    'stock_value_start_year',
                    'purchasedQty_on_the_year',
                    'purchasedItemValue_on_the_year',
                    'stock_qty_end_year',
                    'stock_value_end_year',
                    'wac_avg_cost'
                ])
                ->where('WAC_year_layers_item_detail.IDcompany', auth()->user()->IDcompany)
                ->where('WAC_year_layers_item_detail.year_layer', $date->year - 1)
                ->where('item', $request->input('item'))
                ->first();

            return response()->json([
                'transactions' => $result,
                'layer' => $layer
            ]);
        }
    }


    /**
     * @OA\Get(
     *   tags={"WAC", "wac_calc_year_to_date_report.php"},
     *   path="/wac/calc-year-to-date",
     *   summary="Get the wac report from start of the year to date",
     *   @OA\Parameter(name="date", in="query", type="date"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *     )
     *   )
     * )
     * 
     * @OA\Get(
     *   tags={"WAC", "wac_calc_year_to_date_report.php"},
     *   path="/wac/calc-year-to-date/export",
     *   summary="Get the wac report from start of the year to date in XLSX",
     *   @OA\Parameter(name="date", in="query", type="date"),
     *   @OA\Response(
     *     response=200,
     *     description="OK"
     *   )
     * )
     */
    public function calcYearToDateReport(WACCalcYearToDateReportRequest $request, $export = false)
    {
        $this->authorize('viewAny', WACYearLayer::class);

        $date = \App\Helpers\Utility::dateToDB(
            \App\Helpers\Utility::userDateFromString(
                $request->input('date')
            )->setTime(23, 59, 59)
        );

        $result =  new WACCalcYearToDateReportDataTable(
            DB::query()
                ->select([
                    'year_layer', 
                    'w.IDitem', 
                    'item.item', 
                    'item.item_desc', 
                    'um',
                    'stock_qty_start_year', 
                    'stock_qty_end_year',
                    'stock_value_start_year', 
                    'stock_value_end_year',
                    'purchased_qty', 
                    'purchased_value', 
                    'consumed_qty', 
                    'qty_stock', 
                    'avg_cost', 
                    'notes', 
                    'conf_item' 
                ])
                ->fromRaw('[dbo].[parView_WAC_main](?, ?) w', [
                    auth()->user()->IDcompany,
                    $date->format('Y-m-d H:i:s'),
                ])
                ->join('item', 'item.IDitem', '=', 'w.IDitem')
        );

        if(!$request->get('order')) {
            $result->order(function($q){
                $q->orderBy('item.item');
            });
        }

        if($export) {
            return response(
                $result->exportAs('Xlsx', $request->query('paginating', false)),
                headers: [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'inline'
                ]
            );
        }
        else {
            return $result
                ->with('not_checked', WACYearLayer::transactionNotCheckedValueCount(
                    auth()->user()->IDcompany,
                    $date->startOfYear(),
                    $date
                ))
                ->toJson();
        }
    }


    /**
     * @OA\Get(
     *   tags={"WAC", "wac_calc_year_to_date_report_lots_details.php"},
     *   path="/wac/calc-year-to-date-lots-details",
     *   summary="Get the wac report from start of the year to date with lot details",
     *   @OA\Parameter(name="date", in="query", type="date"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *     )
     *   )
     * )
     * 
     * @OA\Get(
     *   tags={"WAC", "wac_calc_year_to_date_report_lots_details.php"},
     *   path="/wac/calc-year-to-date-lots-details/export",
     *   summary="Get the wac report from start of the year to date  with lot details in XLSX",
     *   @OA\Parameter(name="date", in="query", type="date"),
     *   @OA\Response(
     *     response=200,
     *     description="OK"
     *   )
     * )
     */
    public function calcYearToDateReportLotsDetails(WACCalcYearToDateReportRequest $request, $export = false)
    {     
        $this->authorize('viewAny', WACYearLayer::class);
        
        $date = \App\Helpers\Utility::dateToDB(
            \App\Helpers\Utility::userDateFromString(
                $request->input('date')
            )->setTime(23, 59, 59)
        );

        $result =  new WACCalcYearToDateReportLotsDetailsDataTable(
            DB::query()
                ->select([
                    'Whs', 
                    'IDlot', 
                    'date_lot',
                    'item', 
                    'item_desc', 
                    'um',
                    'notes', 
                    'conf_item',
                    'WAC_cost',
                    'qty',
                    'stock_valorized_wac',
                    'year_layer',
                ])
                ->fromRaw('[dbo].[parView_WAC_stock_at_date_lot_details_checker](?, ?) w', [
                    auth()->user()->IDcompany,
                    $date->format('Y-m-d H:i:s'),
                ])
        );

        if(!$request->get('order')) {
            $result->order(function($q){
                $q->orderBy('stock_valorized_wac');
            });
        }

        if($export) {

            $result->toDate = $date;

            return response(
                $result->exportAs('Xlsx', $request->query('paginating', false)),
                headers: [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'inline'
                ]
            );
        }
        else {
            return $result
                ->with('not_checked', WACYearLayer::transactionNotCheckedValueCount(
                    auth()->user()->IDcompany,
                    $date->startOfYear(),
                    $date
                ))
                ->toJson();
        }
    }

}
