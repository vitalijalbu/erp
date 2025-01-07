<?php

namespace App\DataTables;
use Illuminate\Database\Eloquent\Builder;


class ProcessDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'id' => [
                'data' => 'id',
                'name' => 'id',
                'searchable' => true,
                'orderable' => true
            ],
            'name' => [
                'data' => 'name',
                'name' => 'name',
                'searchable' => true,
                'orderable' => true
            ],
            'code' => [
                'data' => 'code',
                'name' => 'code',
                'searchable' => true,
                'orderable' => true
            ],
            'price_item' => [
                'data' => 'price_item',
                'name' => 'priceItem.item',
                'searchable' => true,
                'orderable' => true
            ],
            'setup_price_item' => [
                'data' => 'setup_price_item',
                'name' => 'setupPriceItem.item',
                'searchable' => true,
                'orderable' => true
            ],
            'operator_cost_item' => [
                'data' => 'operator_cost_item',
                'name' => 'operatorCostItem.item',
                'searchable' => true,
                'orderable' => true
            ],
            'execution_time' => [
                'data' => 'execution_time',
                'name' => 'execution_time',
                'searchable' => true,
                'orderable' => true
            ],
            'setup_time' => [
                'data' => 'setup_time',
                'name' => 'setup_time',
                'searchable' => true,
                'orderable' => true
            ],
            'men_occupation' => [
                'data' => 'men_occupation',
                'name' => 'men_occupation',
                'searchable' => true,
                'orderable' => true
            ],
            'need_machine' => [
                'data' => 'need_machine',
                'name' => 'need_machine',
                'searchable' => true,
                'orderable' => true
            ],
        ];
    }
}