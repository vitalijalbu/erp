<?php

namespace App\DataTables;

class ConstraintsDataTable extends EloquentDataTable {

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
            'subtype' => [
                'data' => 'subtype',
                'name' => 'subtype',
                'searchable' => true,
                'orderable' => true
            ],
            'constraint_type' => [
                'data' => 'constraint_type',
                'name' => 'constraint_type_id',
                'searchable' => true,
                'orderable' => true
            ],
            'is_draft' => [
                'data' => 'is_draft',
                'name' => 'is_draft',
                'searchable' => true,
                'orderable' => true
            ],
            'company' => [
                'data' => 'company.desc',
                'name' => 'company.desc',
                'searchable' => true,
                'orderable' => true
            ]
        ];
    }
}