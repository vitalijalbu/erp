<?php

namespace App\DataTables;
use Illuminate\Database\Eloquent\Builder;


class WorkcenterDataTable extends EloquentDataTable {

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
            ]
        ];
    }
}