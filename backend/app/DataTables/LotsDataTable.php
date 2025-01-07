<?php

namespace App\DataTables;

class LotsDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'IDcompany' => [
                'data' => 'IDcompany',
                'name' => 'IDcompany',
                'searchable' => true,
            ],
            'IDlot' => [
                'data' => 'IDlot',
                'name' => 'IDlot',
                'searchable' => true,
            ],
            'IDitem' => [
                'data' => 'IDitem',
                'name' => 'IDitem',
                'searchable' => true,
            ],
        ];
    }
}