<?php

namespace App\DataTables;

class ProvincesDataTable extends EloquentDataTable {

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
            'company' => [
                'data' => 'company_id',
                'name' => 'company_id',
                'searchable' => true,
                'orderable' => true
            ],
            'nation' => [
                'data' => 'nation',
                'name' => 'nation_id',
                'searchable' => true,
                'orderable' => true
            ],
        ];
    }
}