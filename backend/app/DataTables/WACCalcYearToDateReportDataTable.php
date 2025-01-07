<?php

namespace App\DataTables;

class WACCalcYearToDateReportDataTable extends QueryDataTable {

    protected function setSchema(): array
    {
        return [
            'year_layer' => [
                'data' => 'year_layer',
                'name' => 'year_layer',
                'searchable' => true,
                'orderable' => true
            ],
            'IDitem' => [
                'data' => 'IDitem',
                'name' => 'w.IDitem',
                'searchable' => true,
                'orderable' => true
            ],
            'item' => [
                'data' => 'item',
                'name' => 'item.item',
                'searchable' => true,
                'orderable' => true
            ],
            'item_desc' => [
                'data' => 'item_desc',
                'name' => 'item.item_desc',
                'searchable' => true,
                'orderable' => true
            ],
            'conf_item' => [
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
            'stock_qty_start_year' => [
                'data' => 'stock_qty_start_year',
                'name' => 'stock_qty_start_year',
                'searchable' => true,
                'orderable' => true
            ],
            'stock_value_start_year' => [
                'data' => 'stock_value_start_year',
                'name' => 'stock_value_start_year',
                'searchable' => true,
                'orderable' => true
            ],
            'stock_value_end_year' => [
                'data' => 'stock_value_end_year',
                'name' => 'stock_value_end_year',
                'searchable' => true,
                'orderable' => true
            ],
            'purchased_qty' => [
                'data' => 'purchased_qty',
                'name' => 'purchased_qty',
                'searchable' => true,
                'orderable' => true
            ],
            'purchased_value' => [
                'data' => 'purchased_value',
                'name' => 'purchased_value',
                'searchable' => true,
                'orderable' => true
            ],
            'stock_qty_end_year' => [
                'data' => 'stock_qty_end_year',
                'name' => 'stock_qty_end_year',
                'searchable' => true,
                'orderable' => true
            ],
            'qty_stock' => [
                'data' => 'qty_stock',
                'name' => 'qty_stock',
                'searchable' => true,
                'orderable' => true
            ],
            'consumed_qty' => [
                'data' => 'consumed_qty',
                'name' => 'consumed_qty',
                'searchable' => true,
                'orderable' => true
            ],
            'avg_cost' => [
                'data' => 'avg_cost',
                'name' => 'avg_cost',
                'searchable' => true,
                'orderable' => true
            ],
            'notes' => [
                'data' => 'notes',
                'name' => 'notes',
                'searchable' => true,
                'orderable' => true
            ],
        ];
    }
    
    protected function build(): static
    {
        return $this;
    }
}