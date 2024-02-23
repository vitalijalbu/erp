<?php

namespace App\Exports;

use App\Helpers\Utility;

class StocksExport extends ExportDataTable
{    

    protected function defineHeader(): array
    {
        return [
            'id_lot' => 'Lot',
            'id_lot_origine' => 'Lot Ori.',
            'item' => 'Item',
            'item_desc' => 'Desc.',
            'whs' => 'WHS',
            'loc' => 'LOC',
            'w' => 'W',
            'l' => 'L',
            'p' => 'P',
            'ed' => 'ED',
            'id' => 'ID',
            'cuts' => 'Cuts',
            'qty' => 'Qty',
            'um' => 'UM',
            'lot_dt' => 'Lot Dt.',
            'lot_ori' => 'Lot ori. year',
            'sr' => 'SR',
            'eur' => 'Eur1',
            'conf_item' => 'Conf. Item',
            'merg_lot' => 'Merged lot',
            'ord_ref' => 'Ord. ref.',
            'alt_code' => 'Alt. code',
            'alt_desc' => 'Alt. desc.'            
        ];
    }

    protected function defineMap($row): array
    {
        return [
            'id_lot' => $row['id_lot'],
            'id_lot_origine' => $row['id_lot_origine'],
            'item' => $row['id_item'],
            'item_desc' => $row['item_desc'],
            'whs' => $row['warehouse'],
            'loc' => $row['warehouse_location'],
            'w' => $row['la'],
            'l' => $row['lu'],
            'p' => $row['pz'],
            'ed' => $row['de'],
            'id' => $row['di'],
            'cuts' => $row['cutNum'],
            'qty' => Utility::localizeNum($row['qty_stock'], 4),
            'um' => $row['item_um'],
            'lot_dt' => Utility::convertDateFromTimezone($row['date_lot'], 'UTC', auth()->user()->clientTimezoneDB, 'Y-m-d'),
            'lot_ori' => $row['lot_ori_year'],
            'sr' => $row['step_roll'],
            'eur' => $row['eur1'],
            'conf_item' => $row['conf_item'],
            'merg_lot' => $row['merged_lot'],
            'ord_ref' => $row['lot_ord_rif'],
            'alt_code' => $row['altv_code'],
            'alt_desc' => $row['altv_desc']
        ];
    }

}
