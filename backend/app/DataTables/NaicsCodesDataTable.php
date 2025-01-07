<?php

namespace App\DataTables;

use Illuminate\Contracts\Database\Eloquent\Builder;

class NaicsCodesDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'id' => [
                'data' => 'id',
                'name' => 'id',
                'searchable' => true,
                'orderable' => true
            ],
            'description' => [
                'data' => 'description',
                'name' => 'description',
                'searchable' => true,
                'orderable' => true
            ],
            'parent_id' => [
                'data' => 'parent_id',
                'name' => 'parent_id',
                'searchable' => true,
                'orderable' => true
            ],
            'level' => [
                'data' => 'level',
                'name' => 'level',
                'searchable' => true,
                'orderable' => true
            ]
        ];
    }
}