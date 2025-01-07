<?php

namespace App\DataTables;

class StandardProductsDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'id' => [
                'data' => 'id',
                'name' => 'id',
                'searchable' => true,
                'orderable' => true
            ],
            'code' => [
                'data' => 'code',
                'name' => 'code',
                'searchable' => true,
                'orderable' => true
            ],
            'name' => [
                'data' => 'name',
                'name' => 'name',
                'searchable' => true,
                'orderable' => true
            ],
            'company' => [
                'data' => 'company',
                'name' => 'company.desc',
                'searchable' => true,
                'orderable' => true
            ],
            'item_group' => [
                'data' => 'item_group',
                'name' => 'itemGroup.group_desc',
                'searchable' => true,
                'orderable' => true
            ],
            'um' => [
                'data' => 'um',
                'name' => 'um_id',
                'searchable' => true,
                'orderable' => true
            ]
        ];
    }
}