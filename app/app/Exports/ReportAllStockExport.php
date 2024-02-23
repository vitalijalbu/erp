<?php

namespace App\Exports;

class ReportAllStockExport extends ExportCollection
{    

    protected function defineHeader(): array
    {
        return [
            "IDlot" => "Lot", 
            "IDlot_origine" => "Lot Ori.", 
            "item" => "Item", 
            "item_desc" => "Desc.", 
            "item_group" => "Item Group", 
            "whdesc" => "WHS",
            "lcdesc" => "LOC",
	        "loc_type" => "LOC type", 
            "loc_evaluated" => "Evaluated LOC",
            "LA" => "W",  
            "LU" => "L", 
            "PZ" => "P", 
            "DE" => "ED", 
            "DI" => "ID", 
            "cutNum" => "Cuts", 
            "qty_stock" => "Qty", 
            "um" => "UM",  
            "date_lot" => "Lot Dt.", 
            "dateLotOri" => "Lot Ori. Dt.",
            "stepRoll" => "SR", 
            "ord_rif" => "Ord. ref.", 
            "NumComp" => "Components", 
            "note" => "Lot text",
            "eur1" => "Eur 1", 
            "conf_item" => "Configured Item", 
            "merged_lot" => "Merged lot",
	        "totValue" => "Current value (Total)", 
            "UnitValue" => "Current value (Unit)", 
            "MaxUnitValue" => "Max Value (Unit)", 
            "DiffPercVal" => "% Current\max value", 
            "ValueNote" => "Note value", 
        ];
    }

    protected function defineMap($row): array
    {
        return [
            "IDlot" => $row->IDlot,
            "IDlot_origine" => $row->IDlot_origine,
            "item" => $row->item,
            "item_desc" => $row->item_desc,
            "item_group" => $row->item_group,
            "whdesc" => $row->whdesc,
            "lcdesc" => $row->lcdesc,
            "loc_type" => $row->loc_type,
            "loc_evaluated" => $row->loc_evaluated ? 'Yes' : 'No',
            "LA" => $row->LA,
            "LU" => $row->LU,
            "PZ" => $row->PZ,
            "DE" => $row->DE,
            "DI" => $row->DI,
            "cutNum" => $row->cutNum,
            "qty_stock" => $row->qty_stock,
            "um" => $row->um,
            "date_lot" => $row->date_lot,
            "dateLotOri" => $row->dateLotOri,
            "stepRoll" => $row->stepRoll ? 'Yes' : 'No',
            "ord_rif" => $row->ord_rif,
            "NumComp" => $row->NumComp,
            "note" => $row->note,
            "eur1" => $row->eur1 ? 'Yes' : 'No',
            "conf_item" => $row->conf_item ? 'Yes' : 'No',
            "merged_lot" => $row->merged_lot ? 'Yes' : 'No',
            "totValue" => $row->totValue,
            "UnitValue" => $row->UnitValue,
            "MaxUnitValue" => $row->MaxUnitValue,
            "DiffPercVal" => $row->DiffPercVal,
            "ValueNote" => $row->ValueNote,
        ];
    }
}
