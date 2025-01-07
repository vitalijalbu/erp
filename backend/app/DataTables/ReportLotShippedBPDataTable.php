<?php

namespace App\DataTables;

use App\DataTables\QueryDataTable;

class ReportLotShippedBPDataTable extends QueryDataTable {

    protected function setSchema(): array
    {
        return [
            'dateShip' => [
                'data' => 'dateShip',
                'name' => 'dateShip',
            ],
            'idLot' => [
                'data' => 'idLot',
                'name' => 'idLot',
            ],
            'eur1' => [
                'data' => 'eur1',
                'name' => 'eur1',
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
            'dimensions' => [
                'data' => 'dimensions',
                'name' => 'dimensions',   
            ],
            'ordRif' => [
                'data' => 'ordRif',
                'name' => 'ordRif',   
            ],
            'note' => [
                'data' => 'note',
                'name' => 'note',   
            ],
            'bpdDesc' => [
                'data' => 'bpdDesc',
                'name' => 'bpdDesc',   
            ],
            'NumComp' => [
                'data' => 'NumComp',
                'name' => 'NumComp',
            ]
            
        ];
    }

   
}