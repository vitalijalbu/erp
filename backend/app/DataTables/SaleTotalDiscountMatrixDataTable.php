<?php

namespace App\DataTables;
use Illuminate\Database\Eloquent\Builder;

class SaleTotalDiscountMatrixDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'id' => [
                'data' => 'id',
                'name' => 'id',
                'searchable' => true,
                'orderable' => true
            ],
            'priority' => [
                'data' => 'priority',
                'name' => 'priority',
                'searchable' => true,
                'orderable' => true
            ],
            'description' => [
                'data' => 'description',
                'name' => 'description',
                'searchable' => true,
                'orderable' => true
            ],
            'currency_id' => [
                'data' => 'currency_id',
                'name' => 'currency_id',
                'searchable' => true,
                'orderable' => true
            ],
            'is_disabled' => [
                'data' => 'is_disabled',
                'name' => 'is_disabled',
                'searchable' => true,
                'orderable' => true
            ],
        ];
    }

}