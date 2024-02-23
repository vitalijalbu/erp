<?php

namespace App\Exports;

use App\Helpers\Utility;

class ReportStockOnDateDetailsExport extends ExportDataTable
{    
    protected function defineHeader(): array
    {
        return [
            'item' => 'Item',
            'item_desc' => 'Desc',
            'IDlot' => 'Lot Code',
            'um' => 'UM',
            'wdesc' => 'Warehouse',
            'wldesc' => 'Warehouse location',
            'evaluated' => 'Location evaluated yes\no',
            'qty' => 'Quantity on date',
            'lotVal' => 'Value',
            'dateLotOri' => 'Date of lot origin',
        ];
    }

    protected function defineMap($row): array
    {
        
        return [
            'item' => $row['item'],
            'item_desc' => $row['item_desc'],
            'IDlot' => $row['IDlot'],
            'um' => $row['um'],
            'wdesc' => $row['wdesc'],
            'wldesc' => $row['wldesc'],
            'evaluated' => $row['evaluated'] ? 'Yes' : 'No',
            'qty' => Utility::localizeNum($row['qty'], 4),
            'lotVal' => Utility::localizeNum($row['lotVal'], 4),
            'dateLotOri' => Utility::dateToTimezone($row['dateLotOri'], auth()->user()->clientTimezoneDB)->format('Y-m-d')
        ];
    }

}
