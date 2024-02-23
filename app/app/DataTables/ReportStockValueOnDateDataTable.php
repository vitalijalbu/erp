<?php

namespace App\DataTables;

use App\DataTables\QueryDataTable;

class ReportStockValueOnDateDataTable extends QueryDataTable {

    protected function setSchema(): array
    {
        return [
            'item' => [
                'data' => 'item',
                'name' => 'item',
                'searchable' => true,
                'orderable' => true
            ],
            'item_desc' => [
                'data' => 'item_desc',
                'name' => 'item_desc',
                'searchable' => true,
                'orderable' => true
            ],
            'item_group' => [
                'data' => 'item_group',
                'name' => 'item_group',
                'searchable' => true,
                'orderable' => true
            ],
            'um' => [
                'data' => 'um',
                'name' => 'um',
                'searchable' => true,
                'orderable' => true

            ],
            'currency' => [
                'data' => 'curr',
                'name' => 'curr',
                'searchable' => true,
                'orderable' => true
            ],
            'qty_stock_stock' => [
                'data' => 'qty_stock_stock',
                'name' => 'qty_stock_stock',
                'searchable' => true,
                'orderable' => true
            ],
            'qty_stock_trans' => [
                'data' => 'qty_stock_trans',
                'name' => 'qty_stock_trans',
                'searchable' => true,
                'orderable' => true
            ],
            'qty_stock_qltco' => [
                'data' => 'qty_stock_qltco',
                'name' => 'qty_stock_qltco',
                'searchable' => true,
                'orderable' => true
            ],
            'tval_stock_stock' => [
                'data' => 'tval_stock_stock',
                'name' => 'tval_stock_stock',
                'searchable' => true,
                'orderable' => true
            ],
            'tval_stock_trans' => [
                'data' => 'tval_stock_trans',
                'name' => 'tval_stock_trans',
                'searchable' => true,
                'orderable' => true
            ],
            'tval_stock_qltco' => [
                'data' => 'tval_stock_qltco',
                'name' => 'tval_stock_qltco',
                'searchable' => true,
                'orderable' => true
            ],
            'qty_sold_1mm' => [
                'data' => 'qty_sold_1mm',
                'name' => 'qty_sold_1mm',
                'searchable' => true,
                'orderable' => true
            ],
            'qty_sold_3mm' => [
                'data' => 'qty_sold_3mm',
                'name' => 'qty_sold_3mm',
                'searchable' => true,
                'orderable' => true
            ],
            'qty_sold_12mm' => [
                'data' => 'qty_sold_12mm',
                'name' => 'qty_sold_12mm',
                'searchable' => true,
                'orderable' => true
            ],
            'qty_min' => [
                'data' => 'qty_min',
                'name' => 'qty_min',
                'searchable' => true,
                'orderable' => true
            ],
            'qty_max' => [
                'data' => 'qty_max',
                'name' => 'qty_max',
                'searchable' => true,
                'orderable' => true
            ],
        ];
    }

   
}