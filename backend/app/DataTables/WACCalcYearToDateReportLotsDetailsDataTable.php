<?php

namespace App\DataTables;

class WACCalcYearToDateReportLotsDetailsDataTable extends QueryDataTable {

    public $toDate = null;

    protected function setSchema(): array
    {
        return [
            'Whs' => [
                'data' => 'Whs',
                'name' => 'Whs',
                'searchable' => true,
                'orderable' => true
            ],
            'IDlot' => [
                'data' => 'IDlot',
                'name' => 'IDlot',
                'searchable' => true,
                'orderable' => true
            ],
            'date_lot' => [
                'data' => 'date_lot',
                'name' => 'date_lot',
                'searchable' => true,
                'orderable' => true
            ],
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
            'um' => [
                'data' => 'um',
                'name' => 'um',
                'searchable' => true,
                'orderable' => true
            ],
            'conf_item' => [
                'data' => 'conf_item',
                'name' => 'conf_item',
                'searchable' => true,
                'orderable' => true
            ],
            'notes' => [
                'data' => 'notes',
                'name' => 'notes',
                'searchable' => true,
                'orderable' => true
            ],
            'WAC_cost' => [
                'data' => 'WAC_cost',
                'name' => 'WAC_cost',
                'searchable' => true,
                'orderable' => true
            ],
            'qty' => [
                'data' => 'qty',
                'name' => 'qty',
                'searchable' => true,
                'orderable' => true
            ],
            'stock_valorized_wac' => [
                'data' => 'stock_valorized_wac',
                'name' => 'stock_valorized_wac',
                'searchable' => true,
                'orderable' => true
            ],
            'year_layer' => [
                'data' => 'year_layer',
                'name' => 'year_layer',
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