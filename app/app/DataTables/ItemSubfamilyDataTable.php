<?php

namespace App\DataTables;
use Illuminate\Database\Eloquent\Builder;


class ItemSubfamilyDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'id' => [
                'data' => 'id',
                'name' => 'id',
            ],
            'company_id' => [
                'data' => 'company_id',
                'name' => 'company_id',
            ],
            'code' => [
                'data' => 'code',
                'name' => 'code',
                'searchable' => true,
                'orderable' => true
            ],
            'description' => [
                'data' => 'description',
                'name' => 'description',
                'searchable' => true,
                'orderable' => true
            ],
            
        ];
    }
}