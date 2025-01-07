<?php

namespace App\Exports;

use App\Helpers\Utility;

class ReportLotShippedBPExport extends ExportDataTable
{    
    protected function defineHeader(): array
    {
        return [
            'dateShip' => 'Ship.',
            'idLot' => 'Lot',
            'eur1' => 'Eur 1',
            'item' => 'Item.',
            'itemDesc' => 'Desc.',
            'qty' => 'Qty',
            'um' => 'Um',
            'dimensions' => 'Dimensions',
            'ordRif' => 'Order ref. on lot',
            'bpdDesc' => 'Business partner dest.'
        ];
    }

    protected function defineMap($row): array
    {
        return [
            'dateShip' => Utility::convertDateFromTimezone($row['dateShip'], 'UTC', auth()->user()->clientTimezoneDB, 'Y-m-d H:i'),
            'idLot' => $row['idLot'],
            'eur1' =>  $row['eur1'],
            'item' => $row['item'],
            'itemDesc' => $row['itemDesc'],
            'qty' => Utility::localizeNum($row['qty'], 4),
            'um' => $row['um'],
            'dimensions' => $row['dimensions'],
            'ordRif' =>  $row['ordRif'],
            'bpdDesc' => $row['bpdDesc'] 
        ];
    }

}
