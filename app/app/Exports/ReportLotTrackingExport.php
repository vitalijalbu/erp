<?php

namespace App\Exports;

use DateTime;
use DateTimeZone;
use App\Helpers\Utility;

class ReportLotTrackingExport extends ExportCollection
{    
    protected function defineHeader(): array
    {
        return [
            "trans_data" => "Trans. data", 
            "item" => "Item", 
            "desc" => "Desc.", 
            "lot" => "Lot", 
            "lot_prev" => "Lot previus", 
            "lot_origin" => "Lot origin",
            "lot_supplier" => "Lot supplier",
	        "whs" => "Whs", 
            "loc" => "Loc",
            "sign" => "Sign",
            "trans_type" => "Trans. Type",
            "bp" => "Business partner",
            "qty" => "Qty",
            "um" => "UM",
            "dim" => "Dimensions",
            "ord_ref" => "Ord. ref.",
            "username" => "Username",
            "comp" => "Comp.",
            "cut_ord" => "Cutt. ord.",
        ];
    }

    protected function defineMap($row): \ArrayAccess|array
    {
        return [
            "trans_data" => Utility::convertDateFromTimezone($row->data_exec, 'UTC', auth()->user()->clientTimezoneDB, 'Y-m-d H:i'), 
            "item" => $row->item, 
            "desc" => $row->item_desc, 
            "lot" => $row->IDlot, 
            "lot_prev" => $row->IDlot_padre, 
            "lot_origin" => $row->IDlot_origine,
            "lot_supplier" => $row->IDlot_fornitore,
	        "whs" => $row->wdesc, 
            "loc" => $row->wldesc,
            "sign" => $row->segno,
            "trans_type" => $row->ttdesc,
            "bp" => $row->bpdesc,
            "qty" => Utility::localizeNum($row->qty, 4),
            "um" => $row->um,
            "dim" => $row->dimensions,
            "ord_ref" => $row->ord_rif,
            "username" => $row->username,
            "comp" => $row->NumComp,
            "cut_ord" => $row->NumCut,
        ];
    }
}
