<?php

namespace App\DataTables;
use Illuminate\Database\Eloquent\Builder;


class PaymentMethodDataTable extends EloquentDataTable {

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
            ]
        ];
    }
}