<?php

namespace App\Exports;

use App\Helpers\Utility;

class ReportCuttingWasteExport extends ExportDataTable
{    
    protected function defineHeader(): array
    {
        return [
            'id_lot' => 'Lot',
            'item' => 'Item',
            'item_desc' => 'Desc.',
            'date_exec' => 'Executed date',
            'username' => 'username',
            'used_qty' => 'Used qty',
            'received_qty' => 'Received qty',
            'waste_qty' => 'Waste qty',
            'waste_percentage' => 'Waste percentage'       
        ];
    }

    protected function defineMap($row): array
    {
        return [
            'id_lot' => $row['lot'],
            'item' => $row['item'],
            'item_desc' => $row['itemDesc'],
            'date_exec' => Utility::convertDateFromTimezone($row['dataExec'], 'UTC', auth()->user()->clientTimezoneDB, 'Y-m-d H:i'),
            'username' => $row['username'],
            'used_qty' => Utility::localizeNum($row['usedQty'],4),
            'received_qty' => Utility::localizeNum($row['receivedQty'],4),
            'waste_qty' => Utility::localizeNum($row['wasteQty'],4),
            'waste_percentage' => Utility::localizeNum($row['wastePercentage'],2)
        ];
    }

}
