<?php

namespace App\Exports;

use App\Helpers\Utility;

class ReportStockValueOnDateExport extends ExportDataTable
{    
    protected function defineHeader(): array
    {
        return [
            'item' => 'Item',
            'item_desc' => 'Desc',
            'item_group' => 'Item Group',
            'um' => 'UM',
            'qty_stock_stock' => 'S.qty',
            'qty_stock_trans' => 'T.qty',
            'qty_stock_qltco' => 'Q.qty',
            'tval_stock_stock' => 'S.val',
            'tval_stock_trans' => 'T.val',
            'tval_stock_qltco' => 'Q.val',
            'qty_min' => 'SL.min',
            'qty_max' => 'SL.max',
            'alert_stock_limit_i' => 'SL',
            'currency' => 'SL.max',
            'qty_sold_1mm' => 'Sold prv. month',
            'qty_sold_3mm' => 'Sold prv. 3 months/3',
            'qty_sold_12mm' => 'Sold prv. 12 months/12',
            'idx1' => 'Idx stock 1',
            'idx3' => 'Idx stock 3',
            'idx12' => 'Idx stock 12',
            'eval_loc' => 'Evaluated loc.'
        ];
    }

    protected function defineMap($row): array
    {
        
        return [
            'item' => $row['item'],
            'item_desc' => $row['item_desc'],
            'item_group' => $row['item_group'],
            'um' => $row['um'],
            'qty_stock_stock' => Utility::localizeNum($row['qty_stock_stock'], 4),
            'qty_stock_trans' => Utility::localizeNum($row['qty_stock_trans'], 4),
            'qty_stock_qltco' => Utility::localizeNum($row['qty_stock_qltco'], 4),
            'tval_stock_stock' => Utility::localizeNum($row['tval_stock_stock'], 4),
            'tval_stock_trans' => Utility::localizeNum($row['tval_stock_trans'], 4),
            'tval_stock_qltco' => Utility::localizeNum($row['tval_stock_qltco'], 4),
            'qty_min' => Utility::localizeNum($row['qty_min'], 4),
            'qty_max' => Utility::localizeNum($row['qty_max'], 4),
            'alert_stock_limit_i' => $row['qty_stock_stock'] < $row['qty_min'] && $row['qty_min'] <> 0 ?
                'K' : ($row['qty_stock_stock'] > $row['qty_max'] && $row['qty_max'] <> 0 ? 'K' : 'O'),
            'currency' => $row['currency'],
            'qty_sold_1mm' => Utility::localizeNum($row['qty_sold_1mm'], 4),
            'qty_sold_3mm' => Utility::localizeNum($row['qty_sold_3mm'], 4),
            'qty_sold_12mm' => Utility::localizeNum($row['qty_sold_12mm'], 4),
            'idx1' => $row['qty_sold_1mm'] != 0 ? number_format($row['qty_stock_stock'] / $row['qty_sold_1mm'], 2, ',', ' ') : '',
            'idx3' => $row['qty_sold_3mm'] != 0 ? number_format($row['qty_stock_stock'] / $row['qty_sold_3mm'], 2, ',', ' ') : '',
            'idx12' => $row['qty_sold_12mm'] != 0 ? number_format($row['qty_stock_stock'] / $row['qty_sold_12mm'], 2, ',', ' ') : '',
            'eval_loc' => ''
        ];
    }

}
