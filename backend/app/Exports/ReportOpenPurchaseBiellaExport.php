<?php

namespace App\Exports;

use Carbon\Carbon;
use App\Helpers\Utility;
use App\Exports\ExportDataTable;

class ReportOpenPurchaseBiellaExport extends ExportDataTable
{    
    protected function defineHeader(): array
    {
        return [
            'Sales order' => "salesOrder",
            'Reference order' => "refOrder",
            'Item code' => "item",
            'Configured item' => "cfg",
            'Biella unit of measures' => "lUm",
            'CSM unit of measures' => "cUm",
            'Ordered quantity' => "qty",
            'Width(mm)' => "w",
            'Length(mm)' => "l",
            'Pieces' => "p",
            'External diameter (mm)' => "e",
            'Internal diameter (mm)' => "i",
            'Date of entry order' => "dateIns",
            'Planned date of delivery' => "datePlan",
            'Quantity boxed (LN um)' => "lBox",
            'Quantity ready for the ship (LN um)' => "lShp",
            'Quantity delivered (LN um)' => "lDel",
            'Leftover quantity (LN um)' => "lLft",
            'Quantity boxed (CSM um)' => "cBox",
            'Quantity ready for the ship (CSM um)' => "cShp",
            'Quantity delivered (CSM um)' => "cDel",
            'Leftover quantity (CSM um)' => "cLft"
        ];
    }

    protected function defineMap($row): array
    {
        return [
            'Sales order' => $row['salesOrder'],
            'Reference order' => $row['refOrder'],
            'Item code' => $row['item'],
            'Configured item' => $row['cfg'],
            'Biella unit of measures' => $row["lUm"],
            'CSM unit of measures' => $row["cUm"],
            'Ordered quantity' => Utility::localizeNum($row["qty"], 3),
            'Width(mm)' => Utility::localizeNum($row["w"], 3),
            'Length(mm)' => Utility::localizeNum($row["l"], 3),
            'Pieces' => Utility::localizeNum($row["p"], 3),
            'External diameter (mm)' => Utility::localizeNum($row["e"], 3),
            'Internal diameter (mm)' => Utility::localizeNum($row["i"], 3),
            'Date of entry order' => Utility::convertDateFromTimezone($row["dateIns"], 'UTC', auth()->user()->clientTimezoneDB, 'Y-n-j'),
            'Planned date of delivery' => Carbon::parse($row["datePlan"])->format('Y-n'),
            'Quantity boxed (LN um)' => Utility::localizeNum($row["lBox"], 3),
            'Quantity ready for the ship (LN um)' => Utility::localizeNum($row["lShp"], 3),
            'Quantity delivered (LN um)' => Utility::localizeNum($row["lDel"], 3),
            'Leftover quantity (LN um)' => Utility::localizeNum($row["lLft"], 3),
            'Quantity boxed (CSM um)' => Utility::localizeNum($row["cBox"], 3),
            'Quantity ready for the ship (CSM um)' => Utility::localizeNum($row["cShp"], 3),
            'Quantity delivered (CSM um)' => Utility::localizeNum($row["cDel"], 3),
            'Leftover quantity (CSM um)' => Utility::localizeNum($row["cLft"], 3)
        ];
    }
}
