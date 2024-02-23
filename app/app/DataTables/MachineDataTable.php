<?php

namespace App\DataTables;
use Illuminate\Database\Eloquent\Builder;


class MachineDataTable extends EloquentDataTable {

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
            'description' => [
                'data' => 'description',
                'name' => 'description',
                'searchable' => true,
                'orderable' => true
            ],
            'workcenter_id' => [
                'data' => 'workcenter_id',
                'name' => 'workcenter_id',
                'searchable' => true,
                'orderable' => true
            ],
            'cost_item_id' => [
                'data' => 'cost_item_id',
                'name' => 'cost_item_id',
                'searchable' => true,
                'orderable' => true
            ],
            'men_occupation' => [
                'data' => 'men_occupation',
                'name' => 'men_occupation',
                'searchable' => true,
                'orderable' => true
            ],
            'workcenter' => [
                'data' => 'workcenter',
                'name' => 'workcenter.name',
                'searchable' => true,
                'orderable' => true
            ],
            'cost' => [
                'data' => 'cost',
                'name' => 'cost.item',
                'searchable' => true,
                'orderable' => true
            ],
        ];
    }

}