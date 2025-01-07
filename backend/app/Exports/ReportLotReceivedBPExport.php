<?php

namespace App\Exports;

use App\Helpers\Utility;

class ReportLotReceivedBPExport extends ExportDataTable
{    
    protected function defineHeader(): array
    {
        return [
            'dateTran' => 'Rec. date',
            'IDlot' => 'Lot',
            'eur1' => 'Eur 1',
            'item' => 'Item.',
            'itemDesc' => 'Desc.',
            'qty' => 'Qty',
            'um' => 'Um',
            'LA' => 'Width(mm)',
            'LU' => 'Length(mm)',
            'PZ' => 'Pieces',
            'DE' => 'Ext. diam.(mm)',
            'DI' => 'Int. diam.(mm)',
            'ordRif' => 'Order ref. on lot'
        ];
    }

    protected function defineMap($row): array
    {
        return [
            'dateTran' => Utility::convertDateFromTimezone($row['dateTran'], 'UTC', auth()->user()->clientTimezoneDB, 'Y-m-d H:i'),
            'IDlot' => $row['IDlot'],
            'eur1' => $row['eur1'],
            'item' => $row['item'],
            'itemDesc' => $row['itemDesc'],
            'qty' => Utility::localizeNum($row['qty'], 4),
            'um' => $row['um'],
            'LA' => Utility::localizeNum($row['LA'], 4),
            'LU' => Utility::localizeNum($row['LU'], 4),
            'PZ' => Utility::localizeNum($row['PZ'], 4),
            'DE' => Utility::localizeNum($row['DE'], 4),
            'DI' => Utility::localizeNum($row['DI'], 4),
            'ordRif' => $row['ordRif']
        ];
    }

}
