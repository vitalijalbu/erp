<?php

namespace App\DataTables;
use Illuminate\Database\Eloquent\Builder;


class PaymentTermDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'code' => [
                'data' => 'code',
                'name' => 'code',
                'searchable' => true,
                'orderable' => true
            ],
            'label' => [
                'data' => 'label',
                'name' => 'label',
                'searchable' => true,
                'orderable' => true
            ],
            'period' => [
                'data' => 'period',
                'name' => 'period',
                'searchable' => true,
                'orderable' => true
            ],
            'month_end' => [
                'data' => 'month_end',
                'name' => 'month_end',
                'searchable' => true,
                'orderable' => true
            ],
            'number_of_installments' => [
                'data' => 'number_of_installments',
                'name' => 'number_of_installments',
                'searchable' => true,
                'orderable' => true
            ],
            'is_free' => [
                'data' => 'is_free',
                'name' => 'is_free',
                'searchable' => true,
                'orderable' => true
            ],
        ];
    }
}