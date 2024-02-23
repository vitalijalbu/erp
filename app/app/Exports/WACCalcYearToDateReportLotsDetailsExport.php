<?php

namespace App\Exports;

use App\Helpers\Utility;

class WACCalcYearToDateReportLotsDetailsExport extends ExportDataTable
{    

    protected function defineHeader(): array
    {
        return [
            'Whs' => 'Whs',
            'IDlot' => 'IDlot',
            'date_lot' => 'Lot date',
            'item' => 'Item',
            'item_desc' => 'Item Desc.',
            'conf_item' => 'Conf. item',
            'qty' => 'Qty',
            'um' => 'UM',
            'year_layer' => 'WAC year layer',
            'notes' => 'WAC notes',
            'WAC_cost' => 'WAC cost',
            'stock_valorized_wac' => 'WAC Stock valorized',
            'to_date' => 'Searched date',
            'today' => 'Extraction date',
        ];
    }

    protected function defineMap($row): array
    {
        return [
            'Whs' => $row['Whs'],
            'IDlot' => $row['IDlot'],
            'date_lot' => \App\Helpers\Utility::dateToTimezone($row['date_lot'], auth()->user()->clientTimezoneDB)->format('Y-m-d'),
            'item' => $row['item'],
            'item_desc' => $row['item_desc'],
            'conf_item' => $row['conf_item'] ? 'Yes' : 'No',
            'qty' => $row['qty'],
            'um' => $row['um'],
            'year_layer' => $row['year_layer'],
            'notes' => $row['notes'],
            'WAC_cost' => $row['WAC_cost'],
            'stock_valorized_wac' => $row['stock_valorized_wac'],
            'to_date' => $this->dataTable->toDate->setTimeZone(auth()->user()->clientTimezoneDB)->format('Y-m-d'),
            'today' => date('Y-m-d'),
        ];
    }

}
