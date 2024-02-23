<?php

namespace App\DataTables;

class AdditionalLotToMergeDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'IDstock' => [
                'data' => 'IDstock',
                'name' => 'stock.IDstock',
            ],
            'IDlot' => [
                'data' => 'IDlot',
                'name' => 'stock.IDlot',
                'searchable' => true,
            ],
            'IDlot_padre' => [
                'data' => 'lot.IDlot_padre',
                'name' => 'lot.IDlot_padre',
            ],
            'loc_desc' => [
                'data' => 'desc',
                'name' => 'warehouseLocation.desc',
                'searchable' => true,
            ],
            'stepRoll' => [
                'data' => 'lot.stepRoll',
                'name' => 'lot.stepRoll',
            ],
            'dateLot' => [
                'data' => 'lot.date_lot',
                'name' => 'lot.date_lot',
            ],
            'qty' => [
                'data' => 'qty_stock',
                'name' => 'stock.qty_stock',
            ],
            'LA' => [
                'data' => 'LA',
                'name' => 'd.LA',
            ],
            'LU' => [
                'data' => 'LU',
                'name' => 'd.LU',
            ],
            'PZ' => [
                'data' => 'PZ',
                'name' => 'd.PZ',
            ],
        ];
    }

    protected function build(): static
    {
        return $this
            ->editColumn('loc_desc', function($value) {
                return $value->warehouseLocation->desc;
            });
    }
}