<?php

namespace App\DataTables;

use App\DataTables\QueryDataTable;

class ReportStockValueByGroupDataTable extends QueryDataTable {

    protected function setSchema(): array
    {
        return [
            'item_group' => [
                'data' => 'item_group',
                'name' => 'item_group',
                'searchable' => true,
                'orderable' => true
            ],
            'cfg' => [
                'data' => 'conf_item',
                'name' => 'conf_item',
                'searchable' => true,
                'orderable' => true
            ],
            'um' => [
                'data' => 'um',
                'name' => 'um',
                'searchable' => true,
                'orderable' => true

            ],
            'stock_qty' => [
                'data' => 'qty',
                'name' => 'qty',
                'searchable' => true,
                'orderable' => true
            ],
            'value' => [
                'data' => 'tval',
                'name' => 'tval',
                'searchable' => true,
                'orderable' => true
            ],
            'currency' => [
                'data' => 'curr',
                'name' => 'curr',
                'searchable' => true,
                'orderable' => true
            ],
            'chiorino_item' => [
                'data' => 'ChiorinoItem',
                'name' => 'ChiorinoItem',
                'searchable' => true,
                'orderable' => true
            ],
        ];
    }

   
}