<?php

namespace App\DataTables;

use App\DataTables\QueryDataTable;

class ReportTransactionHistoryDataTable extends QueryDataTable {

    protected function setSchema(): array
    {
        return [
            'dataExec' => [
                'data' => 'data_exec',
                'name' => 'data_exec',
                'searchable' => false,
                'orderable' => false
            ],
            'idLot' => [
                'data' => 'IDlot',
                'name' => 'IDlot',
                'searchable' => false,
                'orderable' => false
            ],
            'item' => [
                'data' => 'item',
                'name' => 'item',
                'searchable' => false,
                'orderable' => false

            ],
            'itemDesc' => [
                'data' => 'item_desc',
                'name' => 'item_desc',
                'searchable' => false,
                'orderable' => false
            ],
            'whdesc' => [
                'data' => 'whdesc',
                'name' => 'whdesc',
                'searchable' => false,
                'orderable' => false
            ],
            'whldesc' => [
                'data' => 'whldesc',
                'name' => 'whldesc',
                'searchable' => false,
                'orderable' => false
            ],
            'segno' => [
                'data' => 'segno',
                'name' => 'segno',
                'searchable' => false,
                'orderable' => false
            ],
            'qty' => [
                'data' => 'qty',
                'name' => 'qty',
                'searchable' => false,
                'orderable' => false
            ],
            'um' => [
                'data' => 'um',
                'name' => 'um',
                'searchable' => false,
                'orderable' => false
            ],
            'trdesc' => [
                'data' => 'trdesc',
                'name' => 'trdesc',
                'searchable' => false,
                'orderable' => false
            ],
            'ordRif' => [
                'data' => 'ord_rif',
                'name' => 'ord_rif',
                'searchable' => false,
                'orderable' => false
            ],
            'username' => [
                'data' => 'username',
                'name' => 'username',
                'searchable' => false,
                'orderable' => false
            ],
            'bpdesc' => [
                'data' => 'bpdesc',
                'name' => 'bpdesc',
                'searchable' => false,
                'orderable' => false
            ],
            'dimensions' => [
                'data' => 'dimensions',
                'name' => 'dimensions',
                'searchable' => false,
                'orderable' => false
            ],
            'note' => [
                'data' => 'note',
                'name' => 'note',
                'searchable' => false,
                'orderable' => false
            ],
            'numComp' => [
                'data' => 'NumComp',
                'name' => 'NumComp',
                'searchable' => false,
                'orderable' => false
            ],
            'la' => [
                'data' => 'la',
                'name' => 'la',
                'searchable' => false,
                'orderable' => false
            ],
            'lu' => [
                'data' => 'lu',
                'name' => 'lu',
                'searchable' => false,
                'orderable' => false
            ],
            'pz' => [
                'data' => 'pz',
                'name' => 'pz',
                'searchable' => false,
                'orderable' => false
            ],
            'eur1' => [
                'data' => 'eur1',
                'name' => 'eur1',
                'searchable' => false,
                'orderable' => false
            ],
            'ordProdLot' => [
                'data' => 'OrdPrdLot',
                'name' => 'OrdPrdLot',
                'searchable' => false,
                'orderable' => false
            ],
        ];
    }
   
}