<?php

namespace App\Exports;

use App\Helpers\Utility;

class ReportAdjustmentInventoryLotExport extends ExportDataTable
{    
    protected function defineHeader(): array
    {
        return [
            'id_lot' => 'Lot',
            'item' => 'Item',
            'item_desc' => 'Desc.',
            'um' => 'UM',
            'qty' => 'Qty',
            'sign' => 'Sign',
            'dimensions' => 'Dimensions',
            'warehouse' => 'Warehouse',
            'location' => 'Location',       
            'username' => 'Username',       
            'inv_date' => 'Inventory data',       
        ];
    }

    protected function defineMap($row): array
    {
        return [
            'id_lot' => $row['lot'],
            'item' => $row['item'],
            'item_desc' => $row['desc'],
            'um' => $row['um'],
            'qty' => $row['qty'],
            'sign' => $row['segno'],
            'dimensions' => $row['dimensions'],
            'warehouse' => $row['warehouse'],
            'location' => $row['location'],
            'username' => $row['username'],
            'inv_date' => $row['inventoryDate']
        ];
    }

}
