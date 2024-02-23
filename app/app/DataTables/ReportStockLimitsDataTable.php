<?php

namespace App\DataTables;

use App\DataTables\QueryDataTable;

class ReportStockLimitsDataTable extends QueryDataTable {

    protected function setSchema(): array
    {
        return [
            'idWarehouse' => [
                'data' => 'idWarehouse',
                'name' => 'idWarehouse'
            ],
            'item' => [
                'data' => 'item',
                'name' => 'item',
            ],
            'itemDesc' => [
                'data' => 'itemDesc',
                'name' => 'itemDesc',
            ],
            'idItem' => [
                'data' => 'idItem',
                'name' => 'idItem',
            ],
           
            'um' => [
                'data' => 'um',
                'name' => 'um',
            ],
           
            'qtyMin' => [
                'data' => 'qtyMin',
                'name' => 'qtyMin',
            ],
           
            'qtyMax' => [
                'data' => 'qtyMax',
                'name' => 'qtyMax',
            ],
           
            'qtyStockWh' => [
                'data' => 'qtyStockWh',
                'name' => 'qtyStockWh',
            ],
           
            'qtyStock' => [
                'data' => 'qtyStock',
                'name' => 'qtyStock',
            ],           
            'wdesc' => [
                'data' => 'wdesc',
                'name' => 'wdesc',
            ],           
        ];
    }

   
}