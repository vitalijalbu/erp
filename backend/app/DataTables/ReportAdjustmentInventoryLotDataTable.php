<?php

namespace App\DataTables;

class ReportAdjustmentInventoryLotDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'lot' => [
                'data' => 'IDlot',
                'name' => 'IDlot',
                'searchable' => true,
            ],
            'item' => [
                'data' => 'lot.item.item',
                'name' => 'lot.item.item',
                'searchable' => true,
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
            'segno' => [
                'data' => 'segno',
                'name' => 'segno',  
            ],
            'dimensions' => [
                'data' => 'dim',
                'name' => 'dim', 
            ],
            'warehouse' => [
                'data' => 'warehouse.desc',
                'name' => 'warehouse.desc',
                'searchable' => true,
            ],
            'location' => [
                'data' => 'warehouse_location.desc',
                'name' => 'warehouseLocation.desc',
                'searchable' => true,
            ],
            'username' => [
                'data' => 'username',
                'name' => 'username',
                'searchable' => true,
            ],
            'inventoryDate' => [
                'data' => 'date_adj',
                'name' => 'date_adj', 
            ],
        ];
    }
}