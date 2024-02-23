<?php

namespace App\DataTables;

class ReportInventoryLotDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'lot' => [
                'data' => 'IDlot',
                'name' => 'IDlot',
                'searchable' => true,
                'orderable' => false
            ],
            'item' => [
                'data' => 'lot.item.item',
                'name' => 'lot.item.item',
                'searchable' => true,
                'orderable' => false
            ],
            'desc' => [
                'data' => 'lot.item.item_desc',
                'name' => 'lot.item.item_desc',
            ],
            'um' => [
                'data' => 'lot.item.um',
                'name' => 'lot.item.um',
            ],
            'qty' => [
                'data' => 'qty',
                'name' => 'ih.qty',  
            ],
            'dimensions' => [
                'data' => 'dim',
                'name' => 'dim', 
            ],
            'warehouse' => [
                'data' => 'warehouse.desc',
                'name' => 'warehouse.desc',
            ],
            'location' => [
                'data' => 'warehouse_location.desc',
                'name' => 'warehouse_location.desc',
            ],
            'username' => [
                'data' => 'invUsername',
                'name' => 'invUsername',
                'searchable' => true,
                'orderable' => false
            ],
            'inventoryDate' => [
                'data' => 'invDate_ins',
                'name' => 'invDate_ins', 
            ],
        ];
    }
}