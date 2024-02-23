<?php

namespace App\DataTables;

class CustomFunctionsDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'id' => [
                'data' => 'id',
                'name' => 'id',
                'searchable' => true,
                'orderable' => true
            ],
            'label' => [
                'data' => 'label',
                'name' => 'label',
                'searchable' => true,
                'orderable' => true
            ],
            'description' => [
                'data' => 'description',
                'name' => 'description',
                'searchable' => true,
                'orderable' => true
            ],
            'uuid' => [
                'data' => 'uuid',
                'name' => 'uuid',
                'searchable' => true,
                'orderable' => true
            ],
            'custom_function_category' => [
                'data' => 'custom_function_category',
                'name' => 'custom_function_category_id',
                'searchable' => true,
                'orderable' => true
            ]
        ];
    }
}