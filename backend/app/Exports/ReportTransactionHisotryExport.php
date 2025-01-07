<?php

namespace App\Exports;

use App\Helpers\Utility;

class ReportTransactionHisotryExport extends ExportDataTable
{   
    protected function defineHeader(): array
    {
        return [
            'trans_data' => 'Trans. data',
            'item' => 'Item',
            'item_desc' => 'Desc.',
            'lot' => 'Lot',
            'eur1' => 'Eur 1',
            'wh' => 'Warehouse',
            'whl' => 'Location',
            'sign' => 'Sign',
            'trans_type' => 'Trans. Type',
            'length' => 'Length',
            'width' => 'Width',
            'pieces' => 'Pieces',
            'qty' => 'Qty',
            'um' => 'Um',
            'bp' => 'Business partner',
            'ord_ref' => 'Order reference',
            'username' => 'Username',
            'dest_lot' => 'Destination lot (accessories)',
        ];
    }

    protected function defineMap($row): array
    {
        return [
            'trans_data' => Utility::convertDateFromTimezone($row['dataExec'], 'UTC', auth()->user()->clientTimezoneDB, 'Y-m-d H:i'),
            'item' => $row['item'],
            'item_desc' => $row['itemDesc'],
            'lot' => $row['idLot'],
            'eur1' => $row['eur1'],
            'wh' => $row['whdesc'],
            'whl' => $row['whldesc'],
            'sign' => $row['segno'],
            'trans_type' => $row['trdesc'],
            'length' => $row['lu'],
            'width' => $row['la'],
            'pieces' => $row['pz'],
            'qty' => Utility::localizeNum($row['qty'],4),
            'um' => $row['um'],
            'bp' => $row['bpdesc'],
            'ord_ref' => $row['ordRif'],
            'username' => $row['username'],
            'dest_lot' => $row['ordProdLot'],
        ];
    }
}
