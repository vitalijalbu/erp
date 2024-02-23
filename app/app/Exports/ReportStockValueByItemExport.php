<?php

namespace App\Exports;

use App\Helpers\Utility;

class ReportStockValueByItemExport extends ExportDataTable
{    
    protected function defineHeader(): array
    {
        return [
            'item' => 'Item',
            'item_desc' => 'Desc',
            'cfg' => 'CFG',
            'item_group' => 'Item Group',
            'um' => 'UM',
            'stock_qty' => 'Stock Qty',
            'value' => 'Value',
            'currency' => 'Currency',
        ];
    }

    protected function defineMap($row): array
    {
        return [
            'item' => $row['item'],
            'item_desc' => $row['item_desc'],
            'cfg' => $row['cfg'],
            'item_group' => $row['item_group'],
            'um' => $row['um'],
            'stock_qty' => Utility::localizeNum($row['stock_qty'] ,4),
            'value' => Utility::localizeNum($row['value'] ,4),
            'currency' => $row['currency'],
        ];
    }

}
