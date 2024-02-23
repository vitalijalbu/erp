<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Schema;

class SyncController extends Controller
{
    public function index()
    {
        $tables = [
            'company' => [
                'checkCompany' => true,
                'identity' => false,
            ],
            'WAC_year_layers' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            'WAC_year_layers_item_detail' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            'adjustments_history' => [
                'checkCompany' => true,
                'columns' => [
                    'IDinventory'
                ],
                'identity' => true,
            ],
            'adjustments_type' => [
                'checkCompany' => false,
                'identity' => false,
            ],
            'bp' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            'bp_destinations' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            'country' => [
                'checkCompany' => true,
                'identity' => false,
            ],
            'cutting_order' => [
                'checkCompany' => true,
                'identity' => false,
            ],
            'cutting_order_row' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            'devaluation_history' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            'inventory' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            'inventory_lots_history' => [
                'checkCompany' => true,
                'identity' => false,
            ],
            'item' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            'item_enabled' => [
                'checkCompany' => true,
                'identity' => false,
            ],
            'item_group' => [
                'checkCompany' => true,
                'identity' => false,
            ],
            'item_stock_limits' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            'logs' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            'lot' => [
                'checkCompany' => true,
                'columns' => [
                    'IDbp'
                ],
                'identity' => false,
            ],
            'lot_dimension' => [
                'checkCompany' => true,
                'identity' => false,
            ],
            'lot_numeri_primi' => [
                'checkCompany' => true,
                'identity' => false,
            ],
            // 'lot_tracking_origin' => [
            //     'checkCompany' => true,
            //     'identity' => true,
            // ],
            'lot_type' => [
                'checkCompany' => true,
                'identity' => false,
            ],
            'lot_value' => [
                'checkCompany' => true,
                'columns' => [
                    'IDdevaluation'
                ],
                'identity' => false,
            ],
            'material_issue_temp' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            'material_transfer_temp' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            // 'order_merge' => [
            //     'checkCompany' => true,
            //     'identity' => true,
            // ],
            // 'order_merge_rows_picking' => [
            //     'checkCompany' => true,
            //     'identity' => true,
            // ],
            // 'order_merge_rows_return' => [
            //     'checkCompany' => true,
            //     'identity' => true,
            // ],
            'order_production' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            'order_production_components' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            'order_split' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            'order_split_row' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            'receptions' => [
                'checkCompany' => true,
                'identity' => true,
                'columns' => [
                    'IDbp'
                ],
            ],
            'shipments' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            'stock' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            'transactions' => [
                'checkCompany' => true,
                'identity' => true,
                'columns' => [
                    'IDtrantype'
                ],
            ],
            'transactions_type' => [
                'checkCompany' => false,
                'identity' => false,
            ],
            'um' => [
                'checkCompany' => false,
                'identity' => false,
            ],
            'um_dimension' => [
                'checkCompany' => false,
                'identity' => false,
            ],
            // 'users' => [
            //     'checkCompany' => true,
            //     'identity' => false,
            // ],
            'warehouse' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            'warehouse_location' => [
                'checkCompany' => true,
                'identity' => true,
            ],
            'warehouse_location_type' => [
                'checkCompany' => false,
                'identity' => true,
            ]
        ];

        $csmProd = '[CHIODB\SQL2014].CSM.dbo';

        $csmLocal = 'chioerpdb.dbo';

        $script = "CREATE PROCEDURE dbo.sync_db_from_production (@idCompany int)
        AS 
        
        BEGIN
            BEGIN TRY
                BEGIN TRANSACTION;
            
                    EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT all';\n\n";

        foreach($tables as $table => $data){

            $columnsOriginal = Schema::getColumnListing($table);

            $columnsOriginal = array_map(function($el) {
                return $el == 'desc' ? "[desc]" : $el;
            }, $columnsOriginal);

            if (($key = array_search("id", $columnsOriginal)) !== false) {
                unset($columnsOriginal[$key]);
            }

            $columnsMod = [];

            if(array_key_exists('columns', $data)){
                $columnsMod = array_map(function($el) use ($data){
                    return $el == $data['columns'][0] ? " NULLIF($el, 0) as $el" : $el;
                }, $columnsOriginal);
            }

            if(empty($columnsMod)){
                $columnsMod = $columnsOriginal;
            }

            $columnsOriginal = implode(',', $columnsOriginal);
            $columnsMod = implode(',', $columnsMod);
            
            $script .= "DELETE FROM $csmLocal.$table".($data['checkCompany'] ? " where IDcompany = @idCompany;" : ";")."\n\n";
            
            if($data['identity']){
                $script .= "SET IDENTITY_INSERT $table ON;\n\n";
            }
           
            $script .= "INSERT INTO $csmLocal.$table ($columnsOriginal)
                SELECT $columnsMod
                FROM $csmProd.$table".($data['checkCompany'] ? " where IDcompany = @idCompany;" : ";")."\n\n ";
                if($data['identity']){
                    $script .= "SET IDENTITY_INSERT $table OFF;\n\n";
                }
        }

        $script .= "
        
        COMMIT;
        EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT all';\n\n
        END TRY
        BEGIN CATCH
            ROLLBACK;
            EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT all';\n\n
            SELECT
    ERROR_NUMBER() AS ErrorNumber,
    ERROR_STATE() AS ErrorState,
    ERROR_SEVERITY() AS ErrorSeverity,
    ERROR_PROCEDURE() AS ErrorProcedure,
    ERROR_LINE() AS ErrorLine,
    ERROR_MESSAGE() AS ErrorMessage;
        END CATCH
        END;";

    echo $script;
    }


    public function createTriggers()
    {
        $tables = [
            // 'WAC_year_layers' => [
            //     'pk' => 'IDlayer'
            // ],
            // 'WAC_year_layers_item_detail' => [
            //     'checkCompany' => true,
            //     'identity' => true,
            // ],
            'adjustments_history' => [
               'pk' => 'IDadjustments',
            ],
            // 'adjustments_type' => [
            //     'checkCompany' => false,
            //     'identity' => false,
            // ],
            'bp' => [
                'pk' => 'IDbp',
            ],
            'bp_destinations' => [
                'pk' => 'IDdestination',
            ],
            // 'country' => [
            //     'pk' => 'IDcountry',
            // ],
            'cutting_order' => [
                'pk' => 'id',
            ],
            'cutting_order_row' => [
                'pk' => 'IDcut',
            ],
            'devaluation_history' => [
                'pk' => 'IDdevaluation',
            ],
            'inventory' => [
                'pk' => 'IDinventory',
            ],
            'inventory_lots_history' => [
                'pk' => 'id',
            ],
            'item' => [
                'pk' => 'IDitem',
            ],
            'item_enabled' => [
                'pk' => 'id',
            ],
            'item_group' => [
                'pk' => 'id',
            ],
            'item_stock_limits' => [
                'pk' => 'IDitemStockLimits',
            ],
            'logs' => [
                'pk' => 'IDerr',
            ],
            // 'lot' => [
            //     'pk' => 'id',
            // ],
            'lot_dimension' => [
                'pk' => 'id',
            ],
            'lot_numeri_primi' => [
                'pk' => 'id',
            ],
            'lot_tracking_origin' => [
                'pk' => 'IDtrack',
            ],
            'lot_type' => [
                'pk' => 'id',
            ],
            'lot_value' => [
                'pk' => 'id',
            ],
            'material_issue_temp' => [
                'pk' => 'IDissue',
            ],
            'material_transfer_temp' => [
                'pk' => 'IDtrans',
            ],
            // 'order_merge' => [
            //     'checkCompany' => true,
            //     'identity' => true,
            // ],
            // 'order_merge_rows_picking' => [
            //     'checkCompany' => true,
            //     'identity' => true,
            // ],
            // 'order_merge_rows_return' => [
            //     'checkCompany' => true,
            //     'identity' => true,
            // ],
            'order_production' => [
                'pk' => 'IDord',
            ],
            'order_production_components' => [
                'pk' => 'IDcomp',
            ],
            'order_split' => [
                'pk' => 'IDord',
            ],
            'order_split_row' => [
                'pk' => 'IDRowSplit',
            ],
            'receptions' => [
                'pk' => 'IDreception',
            ],
            'shipments' => [
                'pk' => 'IDshipments',
            ],
            'stock' => [
                'pk' => 'IDstock',
            ],
            'transactions' => [
                'pk' => 'IDtransaction',
            ],
            // 'transactions_type' => [
            //     'pk' => 'id',
            // ],
            // 'um' => [
            //     'pk' => 'id',
            // ],
            // 'um_dimension' => [
            //     'checkCompany' => false,
            //     'identity' => false,
            // ],
            /*
            'users' => [
                'pk' => 'id',
            ],
            */
            'warehouse' => [
                'pk' => 'IDwarehouse',
            ],
            'warehouse_location' => [
                'pk' => 'IDlocation',
            ],
            // 'warehouse_location_type' => [
            //     'pk' => 'id',
            // ]
        ];


        foreach($tables as $table => $data){
            $triggerName = "{$table}_custom_id";
            DB::transaction(function () use ($data, $table, $triggerName){
                DB::statement("
                DROP TRIGGER IF EXISTS {$triggerName};");

                DB::statement("
                
                CREATE TRIGGER {$triggerName} ON $table
                INSTEAD OF INSERT
                
                AS 
                DECLARE @i INT;
                DECLARE @n_rows INT;    
                DECLARE @id NVARCHAR(200) = NULL;
                DECLARE @companyId INT = NULL;
                BEGIN
                    SET NOCOUNT ON;
                    
                    SET @i = 0;
                    SET @n_rows = (SELECT COUNT(*) FROM inserted);
                
                    WHILE(@i < @n_rows)
                        BEGIN
                        SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
                        SET @companyId = (SELECT IDcompany FROM #tmp)
                        SET @id = (SELECT {$data['pk']} FROM #tmp)
                        IF @id IS NULL AND @companyId IS NOT NULL
                            BEGIN
                            EXEC next_table_id @companyId, N'{$table}', @id OUTPUT
                            UPDATE #tmp SET {$data['pk']} = @id
                            END
                        
                        INSERT INTO {$table} SELECT * FROM #tmp;
                
                        DROP TABLE #tmp;
                        SET @i = @i + 1;
                    END
                END;
                ");
            });
        }
    }


    /*
        checkCompany: verifica anche la company in caso sia a true
        identity: indica se la tabella ha una chiave primaria ai
        pk: nome della chiave primaria
        updateKey: indica se deve essere aggiornata la chiave primaria generando nuovi id
        linkedTables: indica le tabelle in cui è presente una chiave esterna e deve essere aggiornata
        columns: elenco di colonne che sono a 0 e devono essere convertite a null
        alternativeKey: indica le chiavi che devono essere aggiornate perché facenti parti di 2 company diverse
        whereNotExists: indica chiave e tabelle per verificare se esistono valori non presenti o non validi


    */
    public function createSpSyncPrimaryKey()
    {
        $tables = [
            
            'company' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDcompany',
                'updateKey' => false,
            ],
            'warehouse' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDwarehouse',
                'updateKey' => true,
                'linkedTables' => [
                    'warehouse_location' => [
                        'keyToUpdate' => 'IDwarehouse',
                    ]
                ],
            ],
            'warehouse_location' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDlocation',
                'updateKey' => true,
                'linkedTables' => [
                    'order_split_row' => [
                        'keyToUpdate' => 'IDlocation',
                    ],
                    'order_production' => [
                        'keyToUpdate' => 'IDlocation',
                    ],
                ],
            ],
            'warehouse_location_type' => [
                'checkCompany' => false,
                'identity' => true,
                'pk' => 'IDwh_loc_Type',
                'updateKey' => false,
            ],
            'WAC_year_layers' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDlayer',
                'updateKey' => true,
            ],
            'WAC_year_layers_item_detail' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDlayer_detail',
                'updateKey' => true,
                'alternativeKey' => [
                    'column' => 'IDitem',
                    'table' => 'item',
                    'pk' => 'IDitem'
                ],
            ],
            'adjustments_history' => [
                'checkCompany' => true,
                'columns' => [
                    'IDinventory'
                ],
                'pk' => 'IDadjustments',
                'identity' => false,
                'updateKey' => true,
            ],
            'adjustments_type' => [
                'checkCompany' => false,
                'identity' => false,
                'updateKey' => false,
                'pk' => 'IDadjtype',
            ],

            'bp' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDbp',
                'updateKey' => true,
                'linkedTables' => [
                    'company' => [
                        'keyToUpdate' => 'CSM_bpid_code',
                    ]
                ],
            ],
            
            'bp_destinations' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDdestination',
                'updateKey' => true,
                'linkedTables' => [
                    'shipments' => [
                        'keyToUpdate' => 'IDdestination',
                    ],
                ],
            ],
            'country' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDcountry',
                'updateKey' => false,
            ],
            'cutting_order' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'id',
                'updateKey' => true,
            ],
            'cutting_order_row' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDcut',
                'updateKey' => true,
            ],
            'devaluation_history' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDdevaluation',
                'updateKey' => true,
            ],
            'inventory' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDinventory',
                'updateKey' => true,
            ],
            'inventory_lots_history' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'id',
                'updateKey' => true,
            ],
           
            'item' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDitem',
                'updateKey' => true,
                'linkedTables' => [
                    'item_enabled' => [
                        'keyToUpdate' => 'IDitem',
                    ],
                    'item_stock_limits' => [
                        'keyToUpdate' => 'IDitem',
                    ],
                    'lot' => [
                        'keyToUpdate' => 'IDitem',
                    ],
                    'order_production_components' => [
                        'keyToUpdate' => 'IDitem',
                    ],
                ],
            ],
            'item_enabled' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'id',
                'updateKey' => false,
                'alternativeKey' => [
                    'column' => 'IDitem',
                    'table' => 'item',
                    'pk' => 'IDitem'
                ],
                'whereNotExists' => [
                    'column' => 'IDitem',
                    'table' => 'item'
                ]
            ],
            'item_group' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'id',
                'updateKey' => true,
            ],
            'item_stock_limits' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDitemStockLimits',
                'updateKey' => true,
                'alternativeKey' => [
                    'column' => 'IDitem',
                    'table' => 'item',
                    'pk' => 'IDitem'
                ],
            ],
            'logs' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDerr',
                'updateKey' => true,
            ],
            'lot' => [
                'checkCompany' => true,
                'columns' => [
                    'IDbp'
                ],
                'identity' => false,
                'pk' => 'IDlot',
                'updateKey' => false,
                'alternativeKey' => [
                    'column' => 'IDitem',
                    'table' => 'item',
                    'pk' => 'IDitem'
                ],
            ],
            'lot_dimension' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'id',
                'updateKey' => true,
            ],
            'lot_numeri_primi' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'id',
                'updateKey' => true,
            ],
            // 'lot_tracking_origin' => [
            //     'checkCompany' => true,
            //     'identity' => false,
            // ],
            'lot_type' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'id',
                'updateKey' => true,
            ],
            'lot_value' => [
                'checkCompany' => true,
                'columns' => [
                    'IDdevaluation'
                ],
                'identity' => false,
                'pk' => 'id',
                'updateKey' => true,
            ],
            'material_issue_temp' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDissue',
                'updateKey' => true,
                'whereNotExists' => [
                    'column' => 'IDstock',
                    'table' => 'stock'
                ],
            ],
            'material_transfer_temp' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDtrans',
                'updateKey' => true,
                'whereNotExists' => [
                    'column' => 'IDstock',
                    'table' => 'stock'
                ],
            ],
            'stock' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDstock',
                'updateKey' => true,
                'linkedTables' => [
                    'order_production_components' => [
                        'keyToUpdate' => 'IDStock',
                    ],
                    'order_split' => [
                        'keyToUpdate' => 'IDstock',
                    ],
                ],
            ],
            'transactions' => [
                'checkCompany' => true,
                'identity' => false,
                'columns' => [
                    'IDtrantype', 'IDbp', 'IDprodOrd'
                ],
                'pk' => 'IDtransaction',
                'updateKey' => true,
            ],
            'transactions_type' => [
                'checkCompany' => false,
                'identity' => false,
                'pk' => 'IDtrantype',
                'updateKey' => false,
            ],
            // 'order_merge' => [
            //     'checkCompany' => true,
            //     'identity' => false,
            // ],
            // 'order_merge_rows_picking' => [
            //     'checkCompany' => true,
            //     'identity' => false,
            // ],
            // 'order_merge_rows_return' => [
            //     'checkCompany' => true,
            //     'identity' => false,
            // ],
            'order_production' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDord',
                'updateKey' => true,
                'whereNotExists' => [
                    'column' => 'IDlocation',
                    'table' => 'warehouse_location'
                ],
                'linkedTables' => [
                    'transactions' => [
                        'keyToUpdate' => 'IDprodOrd',
                    ]
                ],
            ],
            'order_production_components' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDcomp',
                'updateKey' => true,
                'alternativeKey' => [
                    'column' => 'IDitem',
                    'table' => 'item',
                    'pk' => 'IDitem'
                ],
                'columns' => [
                    'IDStock'
                ],
                'whereNotExists' => [
                    'column' => 'IDstock',
                    'table' => 'stock'
                ],
            ],
            'order_split' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDord',
                'updateKey' => true,
                'whereNotExists' => [
                    'column' => 'IDstock',
                    'table' => 'stock'
                ],
            ],
            'order_split_row' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDRowSplit',
                'updateKey' => true,
            ],
            'receptions' => [
                'checkCompany' => true,
                'identity' => false,
                'columns' => [
                    'IDbp'
                ],
                'pk' => 'IDreception',
                'updateKey' => true,
            ],
            'shipments' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDshipments',
                'updateKey' => true,
                'columns' => [
                    'IDdestination'
                ],
            ],
            'um' => [
                'checkCompany' => false,
                'identity' => false,
                'pk' => 'IDdim',
                'updateKey' => false,
            ],
            'um_dimension' => [
                'checkCompany' => false,
                'identity' => true,
                'pk' => 'id',
                'updateKey' => false,
            ],
            
            // 'users' => [
            //     'checkCompany' => true,
            //     'identity' => false,
            // ],
           
        ];

        $csmProd = config('app.linked_server_csm_produzione').'.dbo';

        $csmLocal = config('database.connections.sqlsrv.database').'.dbo';

        
        // $csmProd = 'chioerpdb.dbo';

        // $csmLocal = 'chioerpdb_testing.dbo';

        $script = '';

        // foreach ($tables as $t => $v){
        //     $script .= "delete from $t;  \n\n";
        // }

        // dd($script);

        // $csmLocal = 'chioerpdb.dbo';
        

        $script = "
              
        CREATE OR ALTER PROCEDURE dbo.sync_db_from_production (@idCompany int)
        AS 

        BEGIN
            BEGIN TRY
                BEGIN TRANSACTION; 
                

                delete from $csmLocal.table_sequences where company_id = @idCompany;  

                 

                EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT all';

                    IF(@idCompany = 0)
                    BEGIN
                        DELETE FROM $csmLocal.temp_item_id;
                    END
            
                    ";

                    

        foreach($tables as $table => $data){
            $script .= "  

           IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'{$table}_custom_id' AND [type] = 'TR')
           begin
           alter table $csmLocal.$table DISABLE TRIGGER {$table}_custom_id;
           end   \n\n ";      
          
            $columnsOriginal = Schema::connection('db_csm_chiorino_test')->getColumnListing($table);

            $columnsOriginal = array_map(function($el) {
                return $el == 'desc' ? "[desc]" : $el;
            }, $columnsOriginal);

            if($data['pk'] == 'id'){
                array_push($columnsOriginal, 'id');
            }

            $columnsMod = [];

            if(array_key_exists('columns', $data)){
                foreach($columnsOriginal as $i => $col){
                    $columnsMod[$i] = $col;
                    if(in_array($col, $data['columns'])){
                        $columnsMod[$i] = " NULLIF($col, 0) as $col";
                    }
                }
                // $columnsMod = array_map(function($el, $i) use ($data){
                //     dd($el, $i);
                //     return $el == $data['columns'][0] ? " NULLIF($el, 0) as $el" : $el;
                // }, $columnsOriginal);
            }
            
            if(empty($columnsMod)){
                $columnsMod = $columnsOriginal;
            }

            if (($key = array_search("id", $columnsOriginal)) !== false) {
                $columnsMod[$key] = "ROW_NUMBER() OVER(ORDER BY $columnsMod[0] ASC) ";

            }

            $columnsOriginal = implode(',', $columnsOriginal);
            $columnsMod = implode(',', $columnsMod);
            
            $script .= "DELETE FROM $csmLocal.$table".($data['checkCompany'] ? " where IDcompany = @idCompany;" : ";")."\n\n";
            
            if($data['identity']){
                $script .= "SET IDENTITY_INSERT $table ON;\n\n";
            }
           
            $script .= "INSERT INTO $csmLocal.$table ($columnsOriginal)
                SELECT $columnsMod
                FROM $csmProd.$table".($data['checkCompany'] ? " where IDcompany = @idCompany;" : ";")."\n\n";
            if($data['identity']){
                $script .= "SET IDENTITY_INSERT $table OFF;\n\n";
            }

            // $script .= " insert into $csmLocal.aaaa values ('{$table}', CURRENT_TIMESTAMP);  \n\n ";
        }

        
            $script .= "
            EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT all';\n\n

            DECLARE @n_rows int;
            DECLARE @next_id varchar(max);
            DECLARE @inc int;
            DECLARE @id VARCHAR(MAX);\n\n
           
            ";
            foreach($tables as $table => $data){      
        
                if(array_key_exists('alternativeKey', $data)){
                    $script .= "
                
        
                
                    update x set IDitem = id from (SELECT t.new_item_id as id, l.IDitem FROM $csmLocal.temp_item_id t, $csmLocal.{$table} l WHERE t.item_id = l.IDitem) x; ";
                
               
     
               
        
            }

            if(array_key_exists('whereNotExists', $data)){
                // $script .= "
        
                // delete from $csmLocal.$table where {$data['whereNotExists']['column']} not in (select {$data['whereNotExists']['column']} from {$data['whereNotExists']['table']} ) and IDcompany = @idCompany; 
                
                // ";  
                $script .= "
        
                update {$table} set {$data['whereNotExists']['column']} = null where {$data['whereNotExists']['column']} not like '%-%' and {$data['whereNotExists']['column']} not in (select {$data['whereNotExists']['column']} from $csmLocal.{$data['whereNotExists']['table']} ) and IDcompany = @idCompany; 
                
                ";  
            }

                if($data['pk'] == 'id' && $data['checkCompany']){
            
                    $script .= "
                    
                    exec next_table_id @idCompany, N'{$table}', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from {$csmLocal}.{$table} WHERE id not like '%-%' and IDcompany = @idCompany);
                    
                    update x set id= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY id ASC) AS row_number, id
                    from {$csmLocal}.{$table} WHERE id not like '%-%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = '{$table}';"; 
                   }else


                if($data['updateKey'] && $data['pk'] != 'id' && !array_key_exists('alternativeKey', $data) && !array_key_exists('linkedTables', $data)){
                    $script .= "
                    
                    exec next_table_id @idCompany, N'{$table}', @next_id OUTPUT, @inc OUTPUT ;
                    
                    set @n_rows = (select count(*) from {$csmLocal}.{$table} WHERE IDcompany = @idCompany);
                    
                    update x set {$data['pk']}= CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + row_number)) from (select ROW_NUMBER() OVER(ORDER BY {$data['pk']} ASC) AS row_number, {$data['pk']}
                    from {$csmLocal}.{$table} WHERE {$data['pk']} not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany) x 
                    
                    update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = '{$table}';";
                }else if($data['updateKey']){
                    $script .= "
                        CREATE TABLE #tmp_ins_{$table}
                        ( id INT identity(1,1) not null,
                        old_id VARCHAR(250) NOT NULL,
                        new_id VARCHAR(250) not null
                        );                    
                    ";
                    if(array_key_exists('linkedTables', $data)){
                        foreach($data['linkedTables'] as $linkedTable => $linkedData){
                            $script .= "ALTER TABLE {$linkedTable}  NOCHECK CONSTRAINT all;\n";
                        }
                    }

                  
                    $script .= " 
                            exec next_table_id @idCompany, N'{$table}', @next_id OUTPUT, @inc OUTPUT;
    
                            set @n_rows = (select count(*) from {$csmLocal}.{$table} WHERE IDcompany = @idCompany)
    
                            insert into #tmp_ins_{$table} (old_id, new_id) select {$data['pk']}, CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + ROW_NUMBER() OVER(ORDER BY {$data['pk']} ASC))) from {$csmLocal}.{$table} WHERE {$data['pk']} not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany; ";

                            if($table == 'item'){
                                $script .= "
                                    IF(@idCompany = 0)
                                    BEGIN
                                    insert into temp_item_id (item_id, new_item_id) select {$data['pk']}, CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-', CONVERT(NVARCHAR(200), @inc + ROW_NUMBER() OVER(ORDER BY {$data['pk']} ASC))) from {$csmLocal}.{$table} WHERE {$data['pk']} not like CONCAT(CONVERT(NVARCHAR(200), @idCompany), '-') + '%' and IDcompany = @idCompany;
                                    END
                                    \n";
                            }

                            $script .= "
        
                            
                            update table_sequences set [current] = @inc + @n_rows where company_id = @idCompany and table_name = '{$table}';
                            
                            update x set {$data['pk']} = id from (SELECT tmp.new_id as id, y.{$data['pk']} from $csmLocal.$table y, #tmp_ins_{$table} tmp where tmp.old_id = y.{$data['pk']} and y.IDcompany = @idCompany) x;";

                    if(array_key_exists('linkedTables', $data)){
                        foreach($data['linkedTables'] as $linkedTable => $linkedData){
                        
                            $script .= "
    
                            update x set {$linkedData['keyToUpdate']} = id from (SELECT tmp.new_id as id, y.{$linkedData['keyToUpdate']} from $csmLocal.$linkedTable y, #tmp_ins_{$table} tmp where tmp.old_id = y.{$linkedData['keyToUpdate']} and y.IDcompany = @idCompany) x;
                            
                            ";               
                        }
                    }

                    if(array_key_exists('linkedTables', $data)){
                        foreach($data['linkedTables'] as $linkedTable => $linkedData){
                            $script .= "ALTER TABLE {$linkedTable}  CHECK CONSTRAINT all;\n";
                        }
                    }

                    $script .= "drop table #tmp_ins_{$table};";

        }


        $script .= "IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'{$table}_custom_id' AND [type] = 'TR')
        begin
        alter table {$table} ENABLE TRIGGER {$table}_custom_id;
        end  "; 

        // $script .= "  insert into aaaa values ('{$table}', CURRENT_TIMESTAMP);  ";
    }

        $script .="COMMIT;
        

        END TRY
        BEGIN CATCH
            ROLLBACK;
            EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT all';\n\n";


            foreach($tables as $table => $data){
                $script .= "  
    
               IF EXISTS (SELECT * FROM sys.objects WHERE [name] = N'{$table}_custom_id' AND [type] = 'TR')
               begin
               alter table {$table} ENABLE TRIGGER {$table}_custom_id;
               end    ";

            }

            $script .= "

          

            SELECT
    ERROR_NUMBER() AS ErrorNumber,
    ERROR_STATE() AS ErrorState,
    ERROR_SEVERITY() AS ErrorSeverity,
    ERROR_PROCEDURE() AS ErrorProcedure,
    ERROR_LINE() AS ErrorLine,
    ERROR_MESSAGE() AS ErrorMessage;
        END CATCH
        END;";

        // echo $script;die;
        
        DB::transaction(function () use ($script){
            DB::statement("DROP PROCEDURE IF EXISTS sync_db_from_production;");

            DB::statement($script);
        });
    }

    public function resetCompanyData()
    {
        $tables = [
            
            'company' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDcompany',
                'updateKey' => false,
            ],
            'warehouse' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDwarehouse',
                'updateKey' => true,
                'linkedTables' => [
                    'warehouse_location' => [
                        'keyToUpdate' => 'IDwarehouse',
                    ]
                ],
            ],
            'warehouse_location' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDlocation',
                'updateKey' => true,
                'linkedTables' => [
                    'order_split_row' => [
                        'keyToUpdate' => 'IDlocation',
                    ],
                    'order_production' => [
                        'keyToUpdate' => 'IDlocation',
                    ],
                ],
            ],
            'warehouse_location_type' => [
                'checkCompany' => false,
                'identity' => true,
                'pk' => 'IDwh_loc_Type',
                'updateKey' => false,
            ],
            'WAC_year_layers' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDlayer',
                'updateKey' => true,
            ],
            'WAC_year_layers_item_detail' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDlayer_detail',
                'updateKey' => true,
                'alternativeKey' => [
                    'column' => 'IDitem',
                    'table' => 'item',
                    'pk' => 'IDitem'
                ],
            ],
            'adjustments_history' => [
                'checkCompany' => true,
                'columns' => [
                    'IDinventory'
                ],
                'pk' => 'IDadjustments',
                'identity' => false,
                'updateKey' => true,
            ],
            'adjustments_type' => [
                'checkCompany' => false,
                'identity' => false,
                'updateKey' => false,
                'pk' => 'IDadjtype',
            ],

            'bp' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDbp',
                'updateKey' => true,
                'linkedTables' => [
                    'company' => [
                        'keyToUpdate' => 'CSM_bpid_code',
                    ]
                ],
            ],
            
            'bp_destinations' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDdestination',
                'updateKey' => true,
                'linkedTables' => [
                    'shipments' => [
                        'keyToUpdate' => 'IDdestination',
                    ],
                ],
            ],
            'country' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDcountry',
                'updateKey' => false,
            ],
            'cutting_order' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'id',
                'updateKey' => true,
            ],
            'cutting_order_row' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDcut',
                'updateKey' => true,
            ],
            'devaluation_history' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDdevaluation',
                'updateKey' => true,
            ],
            'inventory' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDinventory',
                'updateKey' => true,
            ],
            'inventory_lots_history' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'id',
                'updateKey' => true,
            ],
           
            'item' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDitem',
                'updateKey' => true,
                'linkedTables' => [
                    'item_enabled' => [
                        'keyToUpdate' => 'IDitem',
                    ],
                    'item_stock_limits' => [
                        'keyToUpdate' => 'IDitem',
                    ],
                    'lot' => [
                        'keyToUpdate' => 'IDitem',
                    ],
                    'order_production_components' => [
                        'keyToUpdate' => 'IDitem',
                    ],
                ],
            ],
            'item_enabled' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'id',
                'updateKey' => false,
                'alternativeKey' => [
                    'column' => 'IDitem',
                    'table' => 'item',
                    'pk' => 'IDitem'
                ],
                'whereNotExists' => [
                    'column' => 'IDitem',
                    'table' => 'item'
                ]
            ],
            'item_group' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'id',
                'updateKey' => true,
            ],
            'item_stock_limits' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDitemStockLimits',
                'updateKey' => true,
                'alternativeKey' => [
                    'column' => 'IDitem',
                    'table' => 'item',
                    'pk' => 'IDitem'
                ],
            ],
            'logs' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDerr',
                'updateKey' => true,
            ],
            'lot' => [
                'checkCompany' => true,
                'columns' => [
                    'IDbp'
                ],
                'identity' => false,
                'pk' => 'IDlot',
                'updateKey' => false,
                'alternativeKey' => [
                    'column' => 'IDitem',
                    'table' => 'item',
                    'pk' => 'IDitem'
                ],
            ],
            'lot_dimension' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'id',
                'updateKey' => true,
            ],
            'lot_numeri_primi' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'id',
                'updateKey' => true,
            ],
            // 'lot_tracking_origin' => [
            //     'checkCompany' => true,
            //     'identity' => false,
            // ],
            'lot_type' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'id',
                'updateKey' => true,
            ],
            'lot_value' => [
                'checkCompany' => true,
                'columns' => [
                    'IDdevaluation'
                ],
                'identity' => false,
                'pk' => 'id',
                'updateKey' => true,
            ],
            'material_issue_temp' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDissue',
                'updateKey' => true,
                'whereNotExists' => [
                    'column' => 'IDstock',
                    'table' => 'stock'
                ],
            ],
            'material_transfer_temp' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDtrans',
                'updateKey' => true,
                'whereNotExists' => [
                    'column' => 'IDstock',
                    'table' => 'stock'
                ],
            ],
            'stock' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDstock',
                'updateKey' => true,
                'linkedTables' => [
                    'order_production_components' => [
                        'keyToUpdate' => 'IDStock',
                    ],
                    'order_split' => [
                        'keyToUpdate' => 'IDstock',
                    ],
                ],
            ],
            'transactions' => [
                'checkCompany' => true,
                'identity' => false,
                'columns' => [
                    'IDtrantype', 'IDbp', 'IDprodOrd'
                ],
                'pk' => 'IDtransaction',
                'updateKey' => true,
            ],
            'transactions_type' => [
                'checkCompany' => false,
                'identity' => false,
                'pk' => 'IDtrantype',
                'updateKey' => false,
            ],
            // 'order_merge' => [
            //     'checkCompany' => true,
            //     'identity' => false,
            // ],
            // 'order_merge_rows_picking' => [
            //     'checkCompany' => true,
            //     'identity' => false,
            // ],
            // 'order_merge_rows_return' => [
            //     'checkCompany' => true,
            //     'identity' => false,
            // ],
            'order_production' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDord',
                'updateKey' => true,
                'whereNotExists' => [
                    'column' => 'IDlocation',
                    'table' => 'warehouse_location'
                ],
                'linkedTables' => [
                    'transactions' => [
                        'keyToUpdate' => 'IDprodOrd',
                    ]
                ],
            ],
            'order_production_components' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDcomp',
                'updateKey' => true,
                'alternativeKey' => [
                    'column' => 'IDitem',
                    'table' => 'item',
                    'pk' => 'IDitem'
                ],
                'columns' => [
                    'IDStock'
                ],
                'whereNotExists' => [
                    'column' => 'IDstock',
                    'table' => 'stock'
                ],
            ],
            'order_split' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDord',
                'updateKey' => true,
                'whereNotExists' => [
                    'column' => 'IDstock',
                    'table' => 'stock'
                ],
            ],
            'order_split_row' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDRowSplit',
                'updateKey' => true,
            ],
            'receptions' => [
                'checkCompany' => true,
                'identity' => false,
                'columns' => [
                    'IDbp'
                ],
                'pk' => 'IDreception',
                'updateKey' => true,
            ],
            'shipments' => [
                'checkCompany' => true,
                'identity' => false,
                'pk' => 'IDshipments',
                'updateKey' => true,
            ],
            'um' => [
                'checkCompany' => false,
                'identity' => false,
                'pk' => 'IDdim',
                'updateKey' => false,
            ],
            'um_dimension' => [
                'checkCompany' => false,
                'identity' => true,
                'pk' => 'id',
                'updateKey' => false,
            ],
            
            // 'users' => [
            //     'checkCompany' => true,
            //     'identity' => false,
            // ],
           
        ];

        $csmProd = '[CHIORINO\PRODUZIONE].CSM.dbo';

        $csmLocal = 'develop_erp.dbo';

        
        // $csmProd = 'chioerpdb.dbo';

        // $csmLocal = 'chioerpdb_testing.dbo';

        $script = '';
       

        $script = "
        
        CREATE OR ALTER PROCEDURE dbo.reset_company_data (@idCompany int)
        AS 

        BEGIN
            BEGIN TRY
                BEGIN TRANSACTION; 
                

                delete from $csmLocal.table_sequences where company_id = @idCompany;  

                 

                EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT all';

                    IF(@idCompany = 0)
                    BEGIN
                        DELETE FROM $csmLocal.temp_item_id;
                    END
            
                    ";

                    

        foreach($tables as $table => $data){    
            
            $script .= "DELETE FROM $csmLocal.$table".($data['checkCompany'] ? " where IDcompany = @idCompany;" : ";")."\n\n";
        }

            $script .="
            EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT all';\n\n
            
            COMMIT;
        

        END TRY
        BEGIN CATCH
            ROLLBACK;
            EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT all';\n\n";

            $script .= "

          

            SELECT
    ERROR_NUMBER() AS ErrorNumber,
    ERROR_STATE() AS ErrorState,
    ERROR_SEVERITY() AS ErrorSeverity,
    ERROR_PROCEDURE() AS ErrorProcedure,
    ERROR_LINE() AS ErrorLine,
    ERROR_MESSAGE() AS ErrorMessage;
        END CATCH
        END;";


            DB::transaction(function () use ($script){
                DB::statement("DROP PROCEDURE IF EXISTS sync_db_from_production;");
    
                DB::statement($script);
            });
    }
}
