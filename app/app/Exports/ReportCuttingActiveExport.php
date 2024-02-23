<?php

namespace App\Exports;

use App\Helpers\Utility;

class ReportCuttingActiveExport extends ExportCollection
{    
    private $cont = 0;

    protected function defineHeader(): array
    {
        return [
            "num" => "Num", 
            "date_planned" => "Date planned", 
            "date_creation" => "Date creation", 
            "lot_in_cutting" => "Lot in cutting", 
            "item" => "Item", 
            "desc" => "Desc.",
            "um" => "UM",
	        "stock_qty" => "Stock qty", 
            "plan_cuts_qty" => "Plan. cuts qty",
            "plan_cuts_count" => "Plan. cuts count"
        ];
    }

    protected function defineMap($row): \ArrayAccess|array
    {
        $this->cont++;

        return [
            "num" => $this->cont, 
            "date_planned" => Utility::convertDateFromTimezone($row->date_planned, 'UTC', auth()->user()->clientTimezoneDB, 'Y-m-d'),
            "date_creation" => Utility::convertDateFromTimezone($row->date_creation, 'UTC', auth()->user()->clientTimezoneDB, 'Y-m-d'), 
            "lot_in_cutting" => $row->IDlot, 
            "item" => $row->item, 
            "desc" => $row->item_desc,
            "um" => $row->um,
	        "stock_qty" => Utility::localizeNum($row->qty_stock, 4), 
            "plan_cuts_qty" => $row->qty_planned,
            "plan_cuts_count" => $row->cuts
        ];
    }
}
