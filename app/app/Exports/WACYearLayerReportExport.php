<?php

namespace App\Exports;

use App\Helpers\Utility;

class WACYearLayerReportExport extends ExportDataTable
{    

    protected function defineHeader(): array
    {
        return [
            'year_layer' => 'Year Layer',
            'item' => 'Item',
            'item_desc' => 'Desc',
            'conf_item' => 'Item Conf',
            'um' => 'UM',
            'stock_qty_start_year' => 'Qty Begin Year',
            'stock_value_start_year' => 'Qty End Year',
            'purchasedQty_on_the_year' => 'Purch. Qty',
            'purchasedItemValue_on_the_year' => 'Purch. Value',
            'stock_qty_end_year' => 'Value Begin Year',
            'stock_value_end_year' => 'Value End Year',        
        ];
    }

    protected function defineMap($row): array
    {
        return [
            'year_layer' => $row['year_layer'],
            'item' => $row['item'],
            'item_desc' => $row['item_desc'],
            'conf_item' => $row['conf_item'],
            'um' => $row['um'],
            'stock_qty_start_year' => $row['stock_qty_start_year'],
            'stock_value_start_year' => $row['stock_value_start_year'],
            'purchasedQty_on_the_year' => $row['purchasedQty_on_the_year'],
            'purchasedItemValue_on_the_year' => $row['purchasedItemValue_on_the_year'],
            'stock_qty_end_year' => $row['stock_qty_end_year'],
            'stock_value_end_year' => $row['stock_value_end_year'],
        ];
    }

}
