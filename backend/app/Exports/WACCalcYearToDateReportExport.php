<?php

namespace App\Exports;

use App\Helpers\Utility;

class WACCalcYearToDateReportExport extends ExportDataTable
{    

    protected function defineHeader(): array
    {
        return [
            'year_layer' => 'Year layer',
            'item' => 'Item',
            'item_desc' => 'Desc.',
            'conf_item' => 'Conf.',
            'um' => 'UM',
            'stock_qty_start_year' => 'Stock quantity at the beginning of the year(layer)',
            'stock_qty_end_year' => 'Stock quantity at the end of the year(layer)',
            'stock_value_start_year' => 'Stock value at the beginning of the year(layer)',
            'stock_value_end_year' => 'Stock value at the end of the year(layer)',
            'purchased_qty' => 'Purchased quantity from the beginning of the year to the searched date',
            'purchased_value' => 'Purchased value from the beginning of the year to the searched date',
            'consumed_qty' => 'Consumed quantity from the beginning of the year to the searched date',
            'qty_stock' => 'Stock quantity at the searched date',
            'avg_cost' => 'Weighted average cost',
            'stock_val_wac' => 'Warehouse stock valorized with weighted average cost',
            'notes' => 'Notes',
        ];
    }

    protected function defineMap($row): array
    {
        return [
            'year_layer' => $row['year_layer'],
            'item' => $row['item'],
            'item_desc' => $row['item_desc'],
            'conf_item' => $row['conf_item'] ? 'Yes' : 'No',
            'um' => $row['um'],
            'stock_qty_start_year' => $row['stock_qty_start_year'],
            'stock_qty_end_year' => $row['stock_qty_end_year'],
            'stock_value_start_year' => $row['stock_value_start_year'],
            'stock_value_end_year' => $row['stock_value_end_year'],
            'purchased_qty' => $row['purchased_qty'],
            'purchased_value' => $row['purchased_value'],
            'consumed_qty' => $row['consumed_qty'],
            'qty_stock' => $row['qty_stock'],
            'avg_cost' => $row['avg_cost'],
            'stock_val_wac' => $row['qty_stock']*$row['avg_cost'],
            'notes' => $row['notes'],
        ];
    }

}
