<?php

namespace App\Exports;

use App\Helpers\Utility;

class WACCalcSimulationExport extends ExportCollection
{    

    protected function defineHeader(): array
    {
        return [
            'IDlot' => 'Lot',
            'conf_item' => 'Configured Item',
            'um' => 'UM',
            'PurchasedQty' => 'Purchased qty',
            'PurchasedItemValue' => 'Purchased value',
            'UnitValue' => 'Unit purchase cost',
            'date_tran' => 'Transaction date',
            'year' => 'Year',
            'stock_end_year' => 'Stock at the of the year',
            'Note' => 'Notes',
        ];
    }

    protected function defineMap($row): array
    {
        $row = (array) $row;
        return [
            'IDlot' => $row['IDlot'],
            'conf_item' => $row['conf_item'] ? 'Yes' : 'No',
            'um' => $row['um'],
            'PurchasedQty' => $row['PurchasedQty'],
            'PurchasedItemValue' => $row['PurchasedItemValue'],
            'UnitValue' => $row['UnitValue'],
            'date_tran' => \App\Helpers\Utility::dateToTimezone($row['date_tran'], auth()->user()->clientTimezoneDB)->format('Y-m-d H:i'),
            'year' => $row['year'],
            'stock_end_year' => $row['stock_end_year'],
            'Note' => $row['Note'],
        ];
    }

}
