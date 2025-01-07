<?php

namespace App\DataTables;

class WarehouseLocationDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'warehouse_id' => [
                'data' => 'warehouse.IDwarehouse',
                'name' => 'warehouse.IDwarehouse',
                'searchable' => true,
                'orderable' => true
            ],
            'location_id' => [
                'data' => 'IDlocation',
                'name' => 'IDlocation',
                'searchable' => true,
                'orderable' => true
            ],
            'country_id' => [
                'data' => 'warehouse.country.IDcountry',
                'name' => 'warehouse.country.IDcountry',
                'searchable' => true,
                'orderable' => true
            ],
            'warehouse_description' => [
                'data' => 'warehouse.desc',
                'name' => 'warehouse.desc',
                'searchable' => true,
                'orderable' => true
            ],
            'location_description' => [
                'data' => 'desc',
                'name' => 'desc',
                'searchable' => true,
                'orderable' => true
            ],
            'location_note' => [
                'data' => 'note',
                'name' => 'note',
                'searchable' => true,
                'orderable' => true
            ],
            'country_description' => [
                'data' => 'warehouse.country.desc',
                'name' => 'warehouse.country.desc',
                'searchable' => true,
                'orderable' => true
            ],
            'location_type' => [
                'data' => 'warehouse_location_type.tname',
                'name' => 'warehouseLocationType.tname',
                'searchable' => true,
                'orderable' => true
            ],
           
        ];
    }
    
    protected function build(): static
    {
        return $this;
    }
}