<?php

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BPController;
use App\Http\Controllers\Api\UmController;
use App\Http\Controllers\Api\GeoController;
use App\Http\Controllers\Api\LotController;
use App\Http\Controllers\Api\WACController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\SyncController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PrintController;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\BPGroupController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\MachineController;
use App\Http\Controllers\Api\ProcessController;
use App\Http\Controllers\Api\ReceiptController;
use App\Http\Controllers\Api\CurrencyController;
use App\Http\Controllers\Api\FeaturesController;
use App\Http\Controllers\Api\ItemLineController;
use App\Http\Controllers\Api\LanguageController;
use App\Http\Controllers\Api\TimezoneController;
use App\Http\Controllers\Api\WeightUmController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\OrderTypeController;
use App\Http\Controllers\Api\WarehouseController;
use App\Http\Controllers\Api\ConstraintController;
use App\Http\Controllers\Api\OrderSplitController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\WorkcenterController;
use App\Http\Controllers\Api\ContactTypeController;
use App\Http\Controllers\Api\PaymentTermController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\ConfiguratorController;
use App\Http\Controllers\Api\CuttingOrderController;
use App\Http\Controllers\Api\DeliveryTermController;
use App\Http\Controllers\Api\SaleSequenceController;
use App\Http\Controllers\Api\BPDestinationController;
use App\Http\Controllers\Api\ItemSubfamilyController;
use App\Http\Controllers\Api\MaterialIssueController;
use App\Http\Controllers\Api\OrderLotMergeController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\SalePriceListController;
use App\Http\Controllers\Api\AdjustmentTypeController;
use App\Http\Controllers\Api\ConstraintTypeController;
use App\Http\Controllers\Api\CustomFunctionController;
use App\Http\Controllers\Api\OrderProductionController;
use App\Http\Controllers\Api\WorkingDaysRuleController;
use App\Http\Controllers\Api\DocumentLanguageController;
use App\Http\Controllers\Api\MaterialTransferController;
use App\Http\Controllers\Api\SalePriceListRowController;
use App\Http\Controllers\Api\StandardProductsController;
use App\Http\Controllers\Api\PurchasePriceListController;
use App\Http\Controllers\Api\WarehouseLocationController;
use App\Http\Controllers\Api\ItemClassificationController;
use App\Http\Controllers\Api\SaleDiscountMatrixController;
use App\Http\Controllers\Api\PurchasePriceListRowController;
use App\Http\Controllers\Api\InvoiceShippingMethodController;
use App\Http\Controllers\Api\SaleDiscountMatrixRowController;
use App\Http\Controllers\Api\CustomFunctionCategoryController;
use App\Http\Controllers\Api\SaleTotalDiscountMatrixController;
use App\Http\Controllers\Api\SaleTotalDiscountMatrixRowController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::prefix('v1')->group(function () {  

    Route::get('csrf-cookie', [Controller::class, 'csrfCookie'])->middleware('web');
    
    Route::post('login', [UserController::class, 'login'])->middleware('guest:sanctum');

    Route::middleware('auth:sanctum')->group(function() {
        Route::post('logout', [UserController::class, 'logout']);
        
        //users
        Route::get('user', [UserController::class, 'user']);
        Route::put('user/timezone', [UserController::class, 'updateTimezone']);
        Route::put('user/regional', [UserController::class, 'updateRegional']);
        Route::apiResource('users', UserController::class);
        
        //companies
        Route::get('companies', [CompanyController::class, 'index']);
        Route::get('companies/{company:IDcompany}/warehouses', [CompanyController::class, 'warehouses']);
        Route::get('companies/{company:IDcompany}/items/groups', [ItemController::class, 'companyGroups']);
        Route::get('companies/{company:IDcompany}/workcenters', [CompanyController::class, 'workcenters']);
        Route::get('companies/{company:IDcompany}/employees', [CompanyController::class, 'employees']);

        //timezones
        Route::get('timezones', [TimezoneController::class, 'index']);

        //roles
        Route::apiResource('roles', RoleController::class);

        //permissions
        Route::get('permissions', [PermissionController::class, 'index']);

        //stocks
        Route::group(['prefix' => 'stocks', 'as' => 'stocks.'], function(){
            Route::get('/', [StockController::class, 'index']);
            Route::get('export', [StockController::class, 'export']);
            Route::get('report-export-all', [StockController::class, 'reportExportAll']);
            Route::put('inventory-lots/{lot:IDlot}', [StockController::class, 'inventoryAddLot']);
            Route::delete('inventory-lots/{lot:IDlot}', [StockController::class, 'inventoryDelLot']);
            Route::get('/{stock}/lot-dimensions', [StockController::class, 'getLotDimensions']);
            Route::put('/{stock}/erase-and-add-new-lot', [StockController::class, 'eraseAndAddNewLot']);
            Route::delete('/{stock}/erase-lot', [StockController::class, 'eraseLot']);
        });

        //reports
        Route::group(['prefix' => 'reports', 'as' => 'reports.'], function(){
            Route::get('/cutting-history', [ReportController::class, 'cuttingHistory']);
            Route::get('/cutting-waste', [ReportController::class, 'cuttingWaste']);
            Route::get('/cutting-waste/export', [ReportController::class, 'cuttingWaste'])->defaults('export', true);
            Route::get('/cutting-active', [ReportController::class, 'cuttingActive']);
            Route::get('/cutting-active/export', [ReportController::class, 'cuttingActive'])->defaults('export', true);
            Route::get('/lot-tracking', [ReportController::class, 'lotTracking']);
            Route::get('/lot-tracking/export', [ReportController::class, 'lotTracking'])->defaults('export', true);
            Route::get('/stock-by-width', [ReportController::class, 'stockByWidth']);
            Route::get('/transaction-history', [ReportController::class, 'transactionHistory']);
            Route::get('/transaction-history/export', [ReportController::class, 'transactionHistory'])->defaults('export', true);
            Route::get('/unloaded-item', [ReportController::class, 'unloadedItem']);
            Route::get('/unloaded-item/export', [ReportController::class, 'unloadedItem'])->defaults('export', true);
            Route::get('/lot-shipped-bp', [ReportController::class, 'lotShippedBP']);
            Route::get('/lot-shipped-bp/export', [ReportController::class, 'lotShippedBP'])->defaults('export', true);;
            Route::get('/lot-received-bp', [ReportController::class, 'lotReceivedBP']);
            Route::get('/lot-received-bp/export', [ReportController::class, 'lotReceivedBP'])->defaults('export', true);;
            Route::get('/activity-viewer', [ReportController::class, 'activityViewer']);
            Route::get('/stock-limits', [ReportController::class, 'stockLimits']);
            Route::get('/stock-limits/export', [ReportController::class, 'stockLimits'])->defaults('export', true);
            Route::get('/open-purchase-biella', [ReportController::class, 'openPurchaseBiella']);
            Route::get('/open-purchase-biella/export', [ReportController::class, 'openPurchaseBiella'])->defaults('export', true);
            Route::get('/graph-stock-at-date', [ReportController::class, 'graphStockAtDate']);
            Route::get('/stock-value-by-group', [ReportController::class, 'stockValueByGroup']);
            Route::get('/stock-value-by-group/export', [ReportController::class, 'stockValueByGroup'])->defaults('export', true);
            Route::get('/stock-value-by-item', [ReportController::class, 'stockValueByItem']);
            Route::get('/stock-value-by-item/export', [ReportController::class, 'stockValueByItem'])->defaults('export', true);
            Route::get('/stock-value-on-date', [ReportController::class, 'stockValueOnDate']);
            Route::get('/stock-value-on-date/export', [ReportController::class, 'stockValueOnDate'])->defaults('export', true);
            Route::get('/inventory-lots', [ReportController::class, 'inventoryLot']);
            Route::get('/stock-on-date-details', [ReportController::class, 'stockOnDateDetails']);
            Route::get('/stock-on-date-details/export', [ReportController::class, 'stockOnDateDetails'])->defaults('export', true);
            Route::get('/adjustment-inventory-lots', [ReportController::class, 'adjustmentInventoryLot']);
            Route::get('/adjustment-inventory-lots/export', [ReportController::class, 'adjustmentInventoryLot'])->defaults('export', true);
        });

        //receipts
        Route::group(['prefix' => 'receipts', 'as' => 'receipts.'], function(){
            Route::post('purchase', [ReceiptController::class, 'purchase']);
            Route::get('from-chiorino', [ReceiptController::class, 'fromChiorino']);
            Route::post('from-chiorino/confirm', [ReceiptController::class, 'confirm']);
        });

        //inventory
        Route::group(['prefix' => 'inventory', 'as' => 'inventory.'], function(){
            Route::get('/', [InventoryController::class, 'index']);
            Route::post('/', [InventoryController::class, 'store']);
            Route::put('{inventory}/conclude', [InventoryController::class, 'conclude']);
            Route::get('active', [InventoryController::class, 'active']);
            Route::get('/{inventory}', [InventoryController::class, 'show']);
        });

        //transactions
        Route::get('transactions/last-by-supplier-and-item', [TransactionController::class, 'lastBySupplierAndItem']);
        Route::get('transactions/last-by-user', [TransactionController::class, 'lastByUser']);
        Route::get('transactions/types', [TransactionController::class, 'transactionTypes']);

        //BP
        Route::get('/bp/naics', [BPController::class, 'naicsCodes']);
        Route::get('/bp/categories', [BPController::class, 'categories']);
        Route::get('/bp/{bp}/addresses/{type}', [BPController::class, 'typedAddresses'])
            ->whereIn('type', ['sales', 'invoice', 'purchase', 'shipping']);
        Route::get('/bp/{bp}/contacts/{type}', [BPController::class, 'typedContacts'])
            ->whereIn('type', ['quotation', 'order', 'billing', 'shipping']);
        Route::get('/bp/{bp}/shipping-addresses', [BPController::class, 'shippingAddresses']);
        Route::get('/bp/{bp}/invoice-addresses', [BPController::class, 'invoiceAddresses']);
        Route::apiResource('bp', BPController::class);
        Route::apiResource('bp.destinations', BPDestinationController::class);

        //warehouses
        Route::get('/warehouses/locations', [WarehouseLocationController::class, 'index']);
        Route::get('/warehouses/locations/types', [WarehouseLocationController::class, 'types']);
        Route::apiResource('warehouses', WarehouseController::class);
        Route::apiResource('warehouses.locations', WarehouseLocationController::class)->except(['index']);

        //countries
        Route::get('/countries', [WarehouseController::class, 'countries']);
        

        //items
        Route::group(['prefix' => 'items', 'as' => 'items.'], function(){
            Route::get('/groups', [ItemController::class, 'groups']);
            Route::put('/{item:IDitem}/toggle/{status}', [ItemController::class, 'toggle']);
            Route::put('/{item:IDitem}/alternative', [ItemController::class, 'alternative']);
            Route::get('/{item:IDitem}/stock-limits', [ItemController::class, 'stockLimits']);
            Route::get('/{item:IDitem}/stock-limits-history', [ItemController::class, 'stockLimitsHistory']);
            Route::put('/{item:IDitem}/stock-limits', [ItemController::class, 'addStockLimit']);
            Route::post('/{item:IDitem}/load-new-lot', [ItemController::class, 'loadNewLot']);
            Route::get('/enabled', [ItemController::class, 'index'])->defaults('enable', true);
            Route::get('/disabled', [ItemController::class, 'index'])->defaults('enable', false);
            Route::get('/{item:IDitem}/configuration-details', [ItemController::class, 'getConfigurationDetails']);
            Route::get('/types', [ItemController::class, 'types']);
            Route::get('/autocomplete', [ItemController::class, 'autocomplete']);
        });
        Route::apiResource('items', ItemController::class);
        
        //um
        Route::get('um', [UmController::class, 'index']);
        Route::get('um/{um}', [UmController::class, 'show']);

        //um dimensions
        Route::get('um/{um}/dimensions', [UmController::class, 'dimensions']);

        //lots
        Route::group(['prefix' => 'lots', 'as' => 'lots.'], function() {
            Route::get('/values', [LotController::class, 'values']);
            Route::put('/values', [LotController::class, 'addValues']);
            Route::get('/{lot:IDlot}', [LotController::class, 'show']);
            Route::get('/{lot:IDlot}/inventory-check', [LotController::class, 'inventoryCheck']);
            Route::put('/{lot:IDlot}/value', [LotController::class, 'addValue']);
            Route::get('/{lot:IDlot}/value-history', [LotController::class, 'valueHistory']);
            Route::put('/{lot:IDlot}/text', [LotController::class, 'updateText']);
            Route::get('/{lot:IDlot}/stocks', [LotController::class, 'getStocks']);
            Route::get('/', [LotController::class, 'index']);
            Route::put('/{lot:IDlot}/info', [LotController::class, 'updateInfo']);
        });

        //WAC
        Route::group(['prefix' => 'wac', 'as' => 'wac.'], function(){
            Route::get('/available-years', [WACController::class, 'availableYears']);
            Route::get('/layers', [WACController::class, 'layers']);
            Route::post('/', [WACController::class, 'addOrRecreateLayer']);
            Route::put('/{layer:IDlayer}/set-definitive', [WACController::class, 'setDefinitive']);
            Route::get('/layers/{year}/report', [WACController::class, 'yearReport'])
                ->where(['year' => '[0-9]{4}']);
            Route::get('/layers/{year}/report/export', [WACController::class, 'yearReport'])
                ->where(['year' => '[0-9]{4}'])
                ->defaults('export', true);
            Route::get('/calc-simulation', [WACController::class, 'calcSimulation']);
            Route::get('/calc-simulation/export', [WACController::class, 'calcSimulation'])->defaults('export', true);
            Route::get('/calc-year-to-date', [WACController::class, 'calcYearToDateReport']);
            Route::get('/calc-year-to-date/export', [WACController::class, 'calcYearToDateReport'])->defaults('export', true);
            Route::get('/calc-year-to-date-lots-details', [WACController::class, 'calcYearToDateReportLotsDetails']);
            Route::get('/calc-year-to-date-lots-details/export', [WACController::class, 'calcYearToDateReportLotsDetails'])->defaults('export', true);
        });
        
        //material transfer
        Route::group(['prefix' => 'materials-transfer'], function(){
            Route::get('/', [MaterialTransferController::class, 'index']);
            Route::post('/', [MaterialTransferController::class, 'store']);
            Route::put('/{idTrans}', [MaterialTransferController::class, 'update']);
            Route::delete('/{idTrans}', [MaterialTransferController::class, 'delete']);
            Route::post('/confirm', [MaterialTransferController::class, 'confirm']);
        });

        //material issue
        Route::group(['prefix' => 'materials-issue'], function(){
            Route::get('/', [MaterialIssueController::class, 'index']);
            Route::post('/', [MaterialIssueController::class, 'store']);
            Route::put('/{idIssue}', [MaterialIssueController::class, 'update']);
            Route::delete('/{idIssue}', [MaterialIssueController::class, 'delete']);
            Route::post('/confirm', [MaterialIssueController::class, 'confirm']);
        });

        //adjustment type
        Route::get('adjustments-type', [AdjustmentTypeController::class, 'index']);

        //cutting
        Route::group(['prefix' => 'cutting', 'as' => 'cutting.'], function(){
            Route::put('/', [CuttingOrderController::class, 'update']);
            Route::post('/confirm', [CuttingOrderController::class, 'confirm']);
            Route::get('/', [CuttingOrderController::class, 'index']);
            Route::post('/', [CuttingOrderController::class, 'store']);
            Route::delete('/{cutting}', [CuttingOrderController::class, 'delete']);
        });

        //order production
        Route::group(['prefix' => 'orders-production', 'as' => 'orders-production.'], function(){
            Route::put('/', [OrderProductionController::class, 'update']);
            Route::post('/confirm', [OrderProductionController::class, 'confirm']);
            Route::get('/', [OrderProductionController::class, 'index']);
            Route::post('/', [OrderProductionController::class, 'store']);
            Route::delete('/{component}', [OrderProductionController::class, 'delete']);
        });

        //order split
        Route::group(['prefix' => 'order-split', 'as' => 'order-split'], function(){
            Route::get('/', [OrderSplitController::class, 'index']);
            Route::post('/', [OrderSplitController::class, 'store']);
            Route::post('/confirm', [OrderSplitController::class, 'confirm']);
            Route::delete('/{split}', [OrderSplitController::class, 'delete']);
        });

        //order lot merge
        Route::group(['prefix' => 'order-lot-merge', 'as' => 'order-lot-merge'], function(){
            Route::get('/', [OrderLotMergeController::class, 'index']);
            Route::get('/additional-lots', [OrderLotMergeController::class, 'additionalLotToMerge']);
            Route::post('/', [OrderLotMergeController::class, 'store']);
            Route::post('/apply-return', [OrderLotMergeController::class, 'applyReturn']);
            Route::delete('/{row}', [OrderLotMergeController::class, 'delete']);
        });

        //print
        Route::group(['prefix' => 'print', 'as' => 'print.'], function(){
            Route::get('/cutting-order', [PrintController::class, 'cuttingOrder']);
            Route::get('/labels', [PrintController::class, 'labels']);
            Route::get('/label-range', [PrintController::class, 'labelRange']);
            // Route::get('/merge-order', [PrintController::class, 'mergeOrder']);
        });

        //features
        Route::group(['prefix' => 'features', 'as' => 'lots.'], function() {
            Route::get('/types', [FeaturesController::class, 'types']);
            Route::get('/attributes', [FeaturesController::class, 'attributes']);
            Route::get('/', [FeaturesController::class, 'index']);
            Route::post('/', [FeaturesController::class, 'store']);
            Route::put('/{feature}', [FeaturesController::class, 'update']);
            Route::get('/{feature}', [FeaturesController::class, 'show']);
            Route::delete('/{feature}', [FeaturesController::class, 'delete']);
        });

        //custom functions
        Route::group(['prefix' => 'function-categories', 'as' => 'function_categories.'], function() {
            Route::get('/', [CustomFunctionCategoryController::class, 'index']);
            Route::post('/', [CustomFunctionCategoryController::class, 'store']);
            Route::put('/{category}', [CustomFunctionCategoryController::class, 'update']);
            Route::get('/{category}', [CustomFunctionCategoryController::class, 'show']);
            Route::delete('/{category}', [CustomFunctionCategoryController::class, 'delete']);
        });

        Route::group(['prefix' => 'functions', 'as' => 'functions.'], function() {
            Route::get('/', [CustomFunctionController::class, 'index']);
            Route::post('/', [CustomFunctionController::class, 'store']);
            Route::put('/{function}', [CustomFunctionController::class, 'update']);
            Route::get('/{function}', [CustomFunctionController::class, 'show']);
            Route::delete('/{function}', [CustomFunctionController::class, 'delete']);
            Route::post('/{function}/test', [CustomFunctionController::class, 'test']);
        });

        Route::group(['prefix' => 'constraints', 'as' => 'constraints.'], function() {
            Route::get('/', [ConstraintController::class, 'index']);
            Route::post('/', [ConstraintController::class, 'store']);
            Route::get('/types', [ConstraintTypeController::class, 'index']);
            Route::get('/type/{constraintType}', [ConstraintTypeController::class, 'show']);
            Route::put('/{constraint}', [ConstraintController::class, 'update']);
            Route::get('/{constraint}', [ConstraintController::class, 'show']);
            Route::delete('/{constraint}', [ConstraintController::class, 'delete']);
            Route::post('/{constraint}/clone', [ConstraintController::class, 'clone']);
        });

        Route::group(['prefix' => 'standard-products', 'as' => 'standard_products.'], function() {
            Route::post('/{product}/configure', [StandardProductsController::class, 'addFeature']);
            Route::post('/{product}/configure/bulk-features', [StandardProductsController::class, 'addFeatures']);
            Route::put('/{product}/configure/{feature}', [StandardProductsController::class, 'editFeature']);
            Route::delete('/{product}/configure/{feature}', [StandardProductsController::class, 'deleteFeature']);
            Route::post('/{product}/bom-rule', [StandardProductsController::class, 'addBOMRule']);
            Route::post('/{product}/bom-rule/bulk-bom-rules', [StandardProductsController::class, 'addBOMRules']);
            Route::put('/{product}/bom-rule/{rule}', [StandardProductsController::class, 'editBOMRule']);
            Route::delete('/{product}/bom-rule/{rule}', [StandardProductsController::class, 'deleteBOMRule']);
            Route::post('/{product}/routing', [StandardProductsController::class, 'addRouting']);
            Route::post('/{product}/routing/bulk-routing', [StandardProductsController::class, 'addRoutings']);
            Route::put('/{product}/routing/{routing}', [StandardProductsController::class, 'editRouting']);
            Route::delete('/{product}/routing/{routing}', [StandardProductsController::class, 'deleteRouting']);
            Route::post('/{product}/sale-pricing/bulk-pricing', [StandardProductsController::class, 'addPricingRules']);
            Route::get('/', [StandardProductsController::class, 'index']);
            Route::post('/', [StandardProductsController::class, 'store']);
            Route::put('/{product}', [StandardProductsController::class, 'update']);
            Route::get('/{product}', [StandardProductsController::class, 'show']);
            Route::delete('/{product}', [StandardProductsController::class, 'delete']);
            Route::post('/{product}/clone', [StandardProductsController::class, 'clone']);
        });
        

        //sync from production
        Route::get('genera', [SyncController::class, 'index']);
        Route::get('create-triggers', [SyncController::class, 'createTriggers']);
        Route::get('create-sync', [SyncController::class, 'createSpSyncPrimaryKey']);
        Route::get('reset-company-data', [SyncController::class, 'resetCompanyData']);

        //sales agent product configuration
        Route::group(['prefix' => 'configurator', 'as' => 'configurator.'], function() {
            Route::post('/authorize-debug', [ConfiguratorController::class, 'authorizeDebug']);
            Route::post('/init', [ConfiguratorController::class, 'init']);
            Route::post('/event', [ConfiguratorController::class, 'event']);
            Route::post('/complete', [ConfiguratorController::class, 'complete']);
        });

        // geo DB
        Route::group(['prefix' => 'geo'], function(){
            Route::get('/nations', [GeoController::class, 'nations']);
            Route::get('/provinces', [GeoController::class, 'provinces']);
            Route::post('/provinces', [GeoController::class, 'addProvince']);
            Route::put('/provinces/{province}', [GeoController::class, 'editProvince']);
            Route::delete('/provinces/{province}', [GeoController::class, 'deleteProvince']);
            Route::get('/cities', [GeoController::class, 'cities']);
            Route::post('/cities', [GeoController::class, 'addCity']);
            Route::put('/cities/{city}', [GeoController::class, 'editCity']);
            Route::delete('/cities/{city}', [GeoController::class, 'deleteCity']);
            Route::get('/zips', [GeoController::class, 'zips']);
            Route::post('/zips', [GeoController::class, 'addZip']);
            Route::put('/zips/{zip}', [GeoController::class, 'editZip']);
            Route::delete('/zips/{zip}', [GeoController::class, 'deleteZip']);
        });

        //addresses
        Route::apiResource('addresses', AddressController::class);
        
        //languages
        Route::get('languages', [LanguageController::class, 'index']);

        //contact
        Route::get('/contacts/types', [ContactTypeController::class, 'index']);
        Route::apiResource('contacts', ContactController::class);

        //currencies
        Route::get('/currencies', [CurrencyController::class, 'index']);

        //item subfamily / item group
        Route::apiResource('items-subfamilies', ItemSubfamilyController::class)
            ->parameters(['items-subfamilies' => 'itemSubfamily'])
            ->only(['index', 'show']);

        //item lines
        Route::apiResource('items-lines', ItemLineController::class)
            ->parameters(['items-lines' => 'itemLine'])
            ->only(['index', 'show']);

        //weight ums
        Route::apiResource('weights', WeightUmController::class)
            ->parameters(['weights' => 'weightUm'])
            ->only(['index', 'show']);

        //item classifications
        Route::apiResource('items-classifications', ItemClassificationController::class)
            ->parameters(['items-classifications' => 'itemClassification'])
            ->only(['index', 'show']);

        //order types
        Route::apiResource('order-types', OrderTypeController::class)
            ->parameters(['order-types' => 'orderType'])
            ->only(['index', 'show']);

        //document languages
        Route::apiResource('document-languages', DocumentLanguageController::class)
            ->parameters(['document-languages' => 'documentLanguage'])
            ->only(['index', 'show']);

        //delivery terms
        Route::apiResource('delivery-terms', DeliveryTermController::class)
            ->parameters(['delivery-terms' => 'deliveryTerm'])
            ->only(['index', 'show']);

        //payment terms
        Route::apiResource('payment-terms', PaymentTermController::class)
            ->parameters(['payment-terms' => 'paymentTerm'])
            ->only(['index', 'show']);

        //payment methods
        Route::apiResource('payment-methods', PaymentMethodController::class)
            ->parameters(['payment-methods' => 'paymentMethod'])
            ->only(['index', 'show']);

        //invoice-shipping-methods
        Route::apiResource('invoice-shipping-methods', InvoiceShippingMethodController::class)
            ->parameters(['invoice-shipping-methods' => 'invoiceShippingMethod'])
            ->only(['index', 'show']);

        //sale sequences
        Route::apiResource('sale-sequences', SaleSequenceController::class)
            ->parameters(['sale-sequences' => 'sequence']);

        //working days rules
        Route::get('/working-days-rules/check', [WorkingDaysRuleController::class, 'check']);
        Route::apiResource('working-days-rules', WorkingDaysRuleController::class)
            ->parameters(['working-days-rules' => 'rule']);

        //sales    
        Route::get('sales/types', [SaleController::class, 'types']);
        Route::post('sales/get-row-price-preview', [SaleController::class, 'getRowPricePreview']);
        Route::get('sales/require-discount-approval', [SaleController::class, 'requireDiscountApproval']);
        Route::get('sales/require-discount-approval-count', [SaleController::class, 'requireDiscountApprovalCount']);
        Route::post('sales/row/{saleRow}/change-state', [SaleController::class, 'changeRowState']);
        Route::get('sales/autocomplete', [SaleController::class, 'autocomplete']);
        Route::post('sales/quotation-to-sale', [SaleController::class, 'quotationToSale']);
        Route::post('sales/{sale}/change-state', [SaleController::class, 'changeState']);
        Route::post('sales/{sale}/send', [SaleController::class, 'send']);
        Route::get('sales/{sale}/send-template', [SaleController::class, 'sendTemplate']);
        Route::post('sales/{sale}/approve-discount', [SaleController::class, 'approveDiscount']);
        Route::post('sales/{sale}/row', [SaleController::class, 'storeRow']);
        

        Route::get('/sales/{sale}/print', [SaleController::class, 'show'])->defaults('print', true)->middleware('web');

        Route::apiResource('sales', SaleController::class)
            ->except('destroy');

        //production processes
        Route::get('processes/autocomplete', [ProcessController::class, 'autocomplete']);
        Route::apiResource('processes', ProcessController::class);

        //workcenters
        Route::apiResource('workcenters', WorkcenterController::class);
        //machines
        Route::apiResource('machines', MachineController::class);
        //bp groups
        Route::apiResource('bp-groups', BPGroupController::class)
            ->parameters(['bp-groups' => 'bpGroup']);
        //sales price list
        Route::put('sales-price-lists/{salePriceList}/toggle', [SalePriceListController::class, 'toggle']);
        Route::put('sales-price-lists/{salePriceList}/change-prices', [SalePriceListController::class, 'changePrice']);
        Route::post('sales-price-lists/{salePriceList}/clone', [SalePriceListController::class, 'clone']);
        Route::apiResource('sales-price-lists', SalePriceListController::class)
            ->parameters(['sales-price-lists' => 'salePriceList'])
            ->except(['update']);
        //sales price list row
        Route::put('sales-price-lists/{salePriceList}/rows/{salePriceListRow}/toggle', [SalePriceListRowController::class, 'toggle']);
        Route::apiResource('sales-price-lists.rows', SalePriceListRowController::class)
            ->parameters(['sales-price-lists' => 'salePriceList', 'rows' => 'salePriceListRow',])
            ->except(['update']);
        //purchase price list
        Route::put('purchase-price-lists/{purchasePriceList}/toggle', [PurchasePriceListController::class, 'toggle']);
        Route::put('purchase-price-lists/{purchasePriceList}/change-prices', [PurchasePriceListController::class, 'changePrice']);
        Route::post('purchase-price-lists/{purchasePriceList}/clone', [PurchasePriceListController::class, 'clone']);
        Route::apiResource('purchase-price-lists', PurchasePriceListController::class)
            ->parameters(['purchase-price-lists' => 'purchasePriceList'])
            ->except(['update']);
        //purchase price list row
        Route::put('purchase-price-lists/{purchasePriceList}/rows/{purchasePriceListRow}/toggle', [PurchasePriceListRowController::class, 'toggle']);
        Route::apiResource('purchase-price-lists.rows', PurchasePriceListRowController::class)
            ->parameters(['purchase-price-lists' => 'purchasePriceList', 'rows' => 'purchasePriceListRow',])
            ->except(['update']);
        //sales discount matrix
        Route::put('sales-discount-matrix/{saleDiscountMatrix}/toggle', [SaleDiscountMatrixController::class, 'toggle']);
        Route::apiResource('sales-discount-matrix', SaleDiscountMatrixController::class)
            ->parameters(['sales-discount-matrix' => 'saleDiscountMatrix'])
            ->except(['update']);
        //sales discount matrix row
        Route::put('sales-discount-matrix/{saleDiscountMatrix}/rows/{saleDiscountMatrixRow}/toggle', [SaleDiscountMatrixRowController::class, 'toggle']);
        Route::apiResource('sales-discount-matrix.rows', SaleDiscountMatrixRowController::class)
            ->parameters(['sales-discount-matrix' => 'saleDiscountMatrix', 'rows' => 'saleDiscountMatrixRow',])
            ->except(['update']);
        //sales total discount matrix
        Route::put('sales-total-discount-matrix/{saleTotalDiscountMatrix}/toggle', [SaleTotalDiscountMatrixController::class, 'toggle']);
        Route::apiResource('sales-total-discount-matrix', SaleTotalDiscountMatrixController::class)
            ->parameters(['sales-total-discount-matrix' => 'saleTotalDiscountMatrix'])
            ->except(['update']);
        //sales total discount matrix row
        Route::put('sales-total-discount-matrix/{saleTotalDiscountMatrix}/rows/{saleTotalDiscountMatrixRow}/toggle', [SaleTotalDiscountMatrixRowController::class, 'toggle']);
        Route::apiResource('sales-total-discount-matrix.rows', SaleTotalDiscountMatrixRowController::class)
            ->parameters(['sales-total-discount-matrix' => 'saleTotalDiscountMatrix', 'rows' => 'saleTotalDiscountMatrixRow',])
            ->except(['update']);
    });
});
