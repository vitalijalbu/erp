<?php

namespace App\DataTables;

use App\DataTables\QueryDataTable;

class ReportLotReceivedBPDataTable extends QueryDataTable {

    protected function setSchema(): array
    {
        return [
            'dateTran' => [
                'data' => 'dateTran',
                'name' => 'dateTran',
            ],
            'IDlot' => [
                'data' => 'IDlot',
                'name' => 'IDlot',
            ],
            'item' => [
                'data' => 'item',
                'name' => 'item',
            ],
            'itemDesc' => [
                'data' => 'itemDesc',
                'name' => 'itemDesc',
            ],
            'qty' => [
                'data' => 'qty',
                'name' => 'qty',   
            ],
            'um' => [
                'data' => 'um',
                'name' => 'um',   
            ],
            'ordRif' => [
                'data' => 'ordRif',
                'name' => 'ordRif',   
            ],
            'note' => [
                'data' => 'note',
                'name' => 'note',   
            ],
            'numComp' => [
                'data' => 'numComp',
                'name' => 'numComp',
            ],
            'eur1' => [
                'data' => 'eur1',
                'name' => 'eur1',
            ],
            'LA' => [
                'data' => 'LA',
                'name' => 'LA',   
            ],
            'LU' => [
                'data' => 'LU',
                'name' => 'LU',   
            ],
            'PZ' => [
                'data' => 'PZ',
                'name' => 'PZ',   
            ],
            'DE' => [
                'data' => 'DE',
                'name' => 'DE',   
            ],
            'DI' => [
                'data' => 'DI',
                'name' => 'DI',   
            ],
        ];
    }
}