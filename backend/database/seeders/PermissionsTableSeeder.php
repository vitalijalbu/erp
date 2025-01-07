<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionsTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        DB::table('permissions')->delete();
        
        DB::table('permissions')->insert([
            [
                'name' => 'users.manage',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Users Managament',
            ],
            [
                'name' => 'bp.manage',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'BP Management',
            ],
            [
                'name' => 'master_data.warehouses.manage',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Master Data Warehouses Management',
            ],
            [
                'name' => 'master_data.items.manage',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Master Data Items Management',
            ],
            [
                'name' => 'items.value.manage',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Items Value Management',
            ],
            [
                'name' => 'wac.show',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Show WAC',
            ],
            [
                'name' => 'warehouse_adjustments.manage',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Warehouse Adjustments',
            ],
            [
                'name' => 'master_data.inventory.manage',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Master Data Inventrory Management',
            ],
            [
                'name' => 'stocks_items.show',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Show Stocks & Items',
            ],
            [
                'name' => 'items_receipts.manage',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Items Receipts Management',
            ],
            [
                'name' => 'report.show',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Report Show',
            ],
            [
                'name' => 'items.value.show',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Items Value Show',
            ],
            [
                'name' => 'wac.manage',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'WAC Management',
            ],
            [
                'name' => 'materials.manage',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Materials issue and transfer Management',
            ],
            [
                'name' => 'cuttings.manage',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Cuttings Management',
            ],
            [
                'name' => 'order_production.manage',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Production Order Management',
            ],
            [
                'name' => 'split_order.manage',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Split Order Management',
            ],
            [
                'name' => 'order_lot_merge.manage',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Merge Order Lot Management',
            ],
            [
                'name' => 'configurator.manage',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Product Configurator Management',
            ],
            [
                'name' => 'sales.create',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Sale Orders Creation',
            ],
            [
                'name' => 'bp.set_company',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Set BP associated Company',
            ],
            // [
            //     'name' => 'sale_sequences.manage',
            //     'guard_name' => 'web',
            //     'created_at' => NULL,
            //     'updated_at' => NULL,
            //     'label' => 'Manage sale sequences',
            // ],
            // [
            //     'name' => 'calendar.manage',
            //     'guard_name' => 'web',
            //     'created_at' => NULL,
            //     'updated_at' => NULL,
            //     'label' => 'Manage working days calendar',
            // ]
        ]);
        
        
    }
}