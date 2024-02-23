<?php

namespace App\Exports;

use App\Helpers\Utility;

class ReportStockValueByGroupExport extends ExportDataTable
{    
    protected function defineHeader(): array
    {
        return [
            'item_group' => 'Item Group',
            'cfg' => 'CFG',
            'um' => 'UM',
            'stock_qty' => 'Stock Qty',
            'value' => 'Value',
            'currency' => 'Currency',
            'chiorino_item' => 'Chiorino Item',
        ];
    }

    protected function defineMap($row): array
    {
        return [
            'item_group' => $row['item_group'],
            'cfg' => $row['cfg'],
            'um' => $row['um'],
            'stock_qty' => Utility::localizeNum($row['stock_qty'] ,4),
            'value' => Utility::localizeNum($row['value'] ,4),
            'currency' => $row['currency'],
            'chiorino_item' => $row['chiorino_item'],
        ];
    }

}
