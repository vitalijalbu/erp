<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateSpSyncDataFromCsmProduction extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-sp-sync-data-from-csm-production';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create stored procedure for sync data from production CSM';

    /**
     * Execute the console command.
     */
    public function handle()
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
        ];

        $csmProd = config('app.linked_server_csm_produzione').'.dbo';

        $csmLocal = config('database.connections.sqlsrv.database').'.dbo';

        $script = '';    

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
          
            $columnsOriginal = Schema::connection('erp_demo')->getColumnListing($table);

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
            }

            if($table == 'company'){
                foreach($columnsOriginal as $i => $col){
                    $columnsMod[$i] = $col;
                    
                    if($col == 'logo_on_prints'){
                        $columnsMod[$i] = "REPLACE(logo_on_prints, 'img/', '')";
                    }
                }
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
            }else if($data['updateKey'] && $data['pk'] != 'id' && !array_key_exists('alternativeKey', $data) && !array_key_exists('linkedTables', $data)){
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

        }

        $script .="
            COMMIT;
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
        
        DB::transaction(function () use ($script){
            DB::statement("DROP PROCEDURE IF EXISTS sync_db_from_production;");

            DB::statement($script);
        });       
    } 
}