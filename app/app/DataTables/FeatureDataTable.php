<?php

namespace App\DataTables;

class FeatureDataTable extends EloquentDataTable {

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
            'feature_type' => [
                'data' => 'feature_type',
                'name' => 'feature_type_id',
                'searchable' => true,
                'orderable' => true
            ],
        ];
    }
}