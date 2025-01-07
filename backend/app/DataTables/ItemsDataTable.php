<?php

namespace App\DataTables;

class ItemsDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'id' => [
                'data' => 'IDitem',
                'name' => 'IDitem',
                'searchable' => true,
                'orderable' => true
            ],
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
            'um' => [
                'data' => 'um',
                'name' => 'um',
                'searchable' => true,
                'orderable' => true
            ],
            'item_group' => [
                'data' => 'item_group',
                'name' => 'item_group',
                'searchable' => true,
                'orderable' => true
            ],
            'default_unit_value' => [
                'data' => 'DefaultUnitValue',
                'name' => 'DefaultUnitValue',
            ],
            'company.id' => [
                'data' => 'company.IDcompany',
                'name' => 'company.IDcompany',
            ],
            'company.desc' => [
                'data' => 'company.desc',
                'name' => 'company.desc',
            ],
            'altv_code' => [
                'data' => 'item_enabled_company.altv_code',
                'name' => 'item_enabled_company.altv_code',
            ],
            'altv_desc' => [
                'data' => 'item_enabled_company.altv_desc',
                'name' => 'item_enabled_company.altv_desc',
            ],
            'enabled' => [
                'data' => 'item_enabled_company.IDitem',
                'name' => 'item_enabled_company.IDitem',
                'searchable' => true,
            ],
            'type' => [
                'data' => 'type',
                'name' => 'type',
                'searchable' => true,
                'orderable' => true
            ],
            'configured_item' => [
                'data' => 'configured_item',
                'name' => 'configured_item',
                'searchable' => true,
                'orderable' => true
            ],
            'standard_product' => [
                'data' => 'standard_product',
                'name' => 'standard_product',
            ],
        ];
    }

    protected function build(): static
    {
        return $this
            ->editColumn('enabled', function($value) {
                return $value->itemEnabledCompany?->IDitem ? 1 : 0;
            })
            ->addColumn('editable', function($value){
                return $value->IDcompany <> 0;
            })
            ->addColumn('configuration_details', function($value){
                return $value->configuration_details;
            })
            ->filterColumn('enabled', function($builder, $keyword) {
                if($keyword === '' || $keyword === null) {
                    return $builder;
                }
                if($keyword) {
                    return $builder->whereHas('itemEnabledCompany');
                }
                else {
                    return $builder->doesntHave('itemEnabledCompany');
                }
                
            });
    }
}