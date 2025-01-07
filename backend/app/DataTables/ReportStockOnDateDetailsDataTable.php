<?php

namespace App\DataTables;

use App\DataTables\QueryDataTable;

class ReportStockOnDateDetailsDataTable extends QueryDataTable {

    protected function setSchema(): array
    {
        return [
            'item' => [
                'data' => 'item',
                'name' => 'item',
                'searchable' => true,
                'orderable' => true
            ],
            'item_desc' => [
                'data' => 'item_desc',
                'name' => 'item_desc',
                'searchable' => true,
                'orderable' => true
            ],
            'IDlot' => [
                'data' => 'IDlot',
                'name' => 'IDlot',
                'searchable' => true,
                'orderable' => true
            ],
            'um' => [
                'data' => 'um',
                'name' => 'um',
                'searchable' => true,
                'orderable' => true

            ],
            'wdesc' => [
                'data' => 'wdesc',
                'name' => 'wdesc',
                'searchable' => true,
                'orderable' => true
            ],
            'wldesc' => [
                'data' => 'wldesc',
                'name' => 'wldesc',
                'searchable' => true,
                'orderable' => true
            ],
            'evaluated' => [
                'data' => 'evaluated',
                'name' => 'evaluated',
                'searchable' => true,
                'orderable' => true
            ],
            'qty' => [
                'data' => 'qty',
                'name' => 'qty',
                'searchable' => true,
                'orderable' => true
            ],
            'lotVal' => [
                'data' => 'lotVal',
                'name' => 'lotVal',
                'searchable' => true,
                'orderable' => true
            ],
            'dateLotOri' => [
                'data' => 'dateLotOri',
                'name' => 'dateLotOri',
                'searchable' => true,
                'orderable' => true
            ],
        ];
    }

    protected function build(): static
    {
        return $this
            ->filterColumn('lotVal', function($builder, $keyword) {
                $builder->whereRaw(
                    'lotVal*qty '.$this->getColumnSearchOperator('date_lot').' ?', 
                    $keyword
                );
            });
    }

   
}