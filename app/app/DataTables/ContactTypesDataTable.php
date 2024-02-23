<?php

namespace App\DataTables;

use Illuminate\Contracts\Database\Eloquent\Builder;

class ContactTypesDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'id' => [
                'data' => 'id',
                'name' => 'id',
                'searchable' => true,
                'orderable' => true,
            ],
            'name' => [
                'data' => 'name',
                'name' => 'name',
                'searchable' => true,
                'orderable' => true,
            ],
        ];
    }

}