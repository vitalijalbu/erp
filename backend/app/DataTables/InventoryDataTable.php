<?php

namespace App\DataTables;

class InventoryDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'idInventory' => [
                'data' => 'IDinventory',
                'name' => 'IDinventory',
            ],
            'desc' => [
                'data' => 'desc',
                'name' => 'desc',
                'searchable' => true,
                'orderable' => true
            ],
            'state' => [
                'data' => 'completed',
                'name' => 'completed',
                'searchable' => true,
                'orderable' => true
            ],
            'startDate' => [
                'data' => 'start_date',
                'name' => 'start_date',
                'searchable' => true,
                'orderable' => true
            ],
            'endDate' => [
                'data' => 'end_date',
                'name' => 'end_date',
                'searchable' => true,
                'orderable' => true
            ],
            'username' => [
                'data' => 'username',
                'name' => 'username',
                'searchable' => true,
                'orderable' => true
            ],
        ];
    }
}