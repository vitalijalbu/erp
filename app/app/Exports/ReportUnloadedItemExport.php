<?php

namespace App\Exports;

use App\Helpers\Utility;

class ReportUnloadedItemExport extends ExportDataTable
{   
    protected function defineHeader(): array
    {
        return [
            'trans_type' => 'Trans. Type',
            'item' => 'Item',
            'desc' => 'Desc',
            'um' => 'Um',
            'unloaded_qty' => 'Unloaded qty',
        ];
    }

    protected function defineMap($row): array
    {
        return [
            'trans_type' => $row['transType'],
            'item' => $row['item'],
            'desc' => $row['itemDesc'],
            'um' => $row['um'],
            'unloaded_qty' => Utility::localizeNum($row['unloadedQty'], 4),
        ];
    }
}
