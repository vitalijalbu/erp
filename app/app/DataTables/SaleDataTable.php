<?php

namespace App\DataTables;

use App\Enum\SaleType;
use Illuminate\Contracts\Database\Eloquent\Builder;

class SaleDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        $schema =  [
            'id' => [
                'data' => 'id',
                'name' => 'id'
            ],
            'sale_type' => [
                'data' => 'sale_type',
                'name' => 'sale_type',
                'searchable' => true,
                'orderable' => true
            ],
            'code' => [
                'data' => 'code',
                'name' => 'code',
                'searchable' => true,
                'orderable' => true
            ],
            'bp_id' => [
                'data' => 'bp_id',
                'name' => 'bp_id',
                'searchable' => true,
                'orderable' => true
            ],
            'bp_desc' => [
                'data' => 'bp.desc',
                'name' => 'bp.desc',
                'searchable' => true,
                'orderable' => true
            ],
            'state' => [
                'data' => 'state',
                'name' => 'state',
                'searchable' => true,
                'orderable' => true
            ],
            'customer_order_ref' => [
                'data' => 'customer_order_ref',
                'name' => 'customer_order_ref',
                'searchable' => true,
                'orderable' => true
            ],
            'created_at' => [
                'data' => 'created_at',
                'name' => 'created_at',
                'searchable' => true,
                'orderable' => true
            ],
            'sale_internal_contact' => [
                'data' => 'sale_internal_contact',
                'name' => 'sale_internal_contact',
                'searchable' => true,
                'orderable' => true
            ]
        ];

        if(!empty($this->request->columns['sale_type']['search']['value'])){
            switch($this->request->columns['sale_type']['search']['value']){
                case SaleType::quotation->name:
                    $schema += [
                        'expires_at' => [
                            'data' => 'expires_at',
                            'name' => 'expires_at',
                            'searchable' => true,
                            'orderable' => true
                        ]
                    ];
                    break;
                case SaleType::sale->name:
                    $schema += [
                        'delivery_date' => [
                            'data' => 'delivery_date',
                            'name' => 'delivery_date',
                            'searchable' => true,
                            'orderable' => true
                        ] 
                    ];
                    break;
            }
        }
        
        return $schema;
    }

    protected function build(): static
    {
        // if(!empty($this->request->columns['sale_type']['search']['value'])){
        //     if($this->request->columns['sale_type']['search']['value'] == SaleType::quotation->name){
                return 
                    $this->addColumn('sale_internal_contact', function($q){
                        if($q->internalContact){
                            return $q->internalContact?->id." ".$q->internalContact?->name;
                        }
                    })
                    ->filterColumn('sale_internal_contact', function($q, $keyword){
                        return $q->whereHas('internalContact', function($q) use ($keyword){
                            $q->whereRaw("id + ' ' + name like ?", ['%'.$keyword.'%']);
                        });
                    });
        //     }
        // }

        // return $this;
    }
}