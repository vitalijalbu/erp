<?php

namespace App\Exports;

use App\Helpers\Utility;

class ReportStockLimitsExport extends ExportDataTable
{    
    protected function defineHeader(): array
    {
        return [
            'wdesc' => 'Warehouse',
            'item' => 'Item',
            'itemDesc' => 'Item Desc.',
            'qtyStockWh' => 'Qty. stock on wh.',
            'qtyStock' => 'Qty. stock all wh.',
            'qtyMin' => 'Qty min',
            'qtyMax' => 'Qty max',
        ];
    }

    protected function defineMap($row): array
    {
        return [
            'wdesc' => $row['wdesc'],
            'item' => $row['item'],
            'itemDesc' => $row['itemDesc'],
            'qtyStockWh' => Utility::localizeNum($row['qtyStockWh'], 4),
            'qtyStock' => Utility::localizeNum($row['qtyStock'], 4),
            'qtyMin' => Utility::localizeNum($row['qtyMin'], 4),
            'qtyMax' => Utility::localizeNum($row['qtyMax'], 4)
        ];
    }

}
