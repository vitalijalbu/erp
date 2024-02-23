<?php

namespace App\DataTables;

class WACYearLayerReportDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'year_layer' => [
                'data' => 'year_layer',
                'name' => 'year_layer',
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
            'purchasedQty_on_the_year' => [
                'data' => 'purchasedQty_on_the_year',
                'name' => 'purchasedQty_on_the_year',
                'searchable' => true,
                'orderable' => true
            ],
            'purchasedItemValue_on_the_year' => [
                'data' => 'purchasedItemValue_on_the_year',
                'name' => 'purchasedItemValue_on_the_year',
                'searchable' => true,
                'orderable' => true
            ],
            'stock_qty_end_year' => [
                'data' => 'stock_qty_end_year',
                'name' => 'stock_qty_end_year',
                'searchable' => true,
                'orderable' => true
            ],
            'stock_value_end_year' => [
                'data' => 'stock_value_end_year',
                'name' => 'stock_value_end_year',
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