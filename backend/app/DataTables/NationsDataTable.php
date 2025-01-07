<?php

namespace App\DataTables;

class NationsDataTable extends EloquentDataTable {

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
            'iso_alpha_3' => [
                'data' => 'iso_alpha_3',
                'name' => 'iso_alpha_3',
                'searchable' => true,
                'orderable' => true
            ],
        ];
    }
}