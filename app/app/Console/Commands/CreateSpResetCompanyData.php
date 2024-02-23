<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CreateSpResetCompanyData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-sp-reset-company-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

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

        $csmLocal = config('database.connections.sqlsrv.database').'.dbo';

        $script = '';
       

        $script = "
        
        CREATE OR ALTER PROCEDURE dbo.sp_reset_company_data (@idCompany int)
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
            DB::statement("DROP PROCEDURE IF EXISTS sp_reset_company_data;");

            DB::statement($script);
        });
    }
}
