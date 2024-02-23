<?php

namespace App\DataTables;
use Illuminate\Database\Eloquent\Builder;


class ItemClassificationDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'id' => [
                'data' => 'id',
                'name' => 'id',
                'searchable' => true,
                'orderable' => true
            ],
            'label' => [
                'data' => 'label',
                'name' => 'label',
                'searchable' => true,
                'orderable' => true
            ],
            'level' => [
                'data' => 'level',
                'name' => 'level',
                'searchable' => true,
                'orderable' => true
            ],
            'allow_owner' => [
                'data' => 'allow_owner',
                'name' => 'allow_owner',
                'searchable' => true,
                'orderable' => true
            ],
            'require_level_2' => [
                'data' => 'require_level_2',
                'name' => 'require_level_2',
                'searchable' => true,
                'orderable' => true
            ],
            
        ];
    }

    protected function build(): static
    {
        return 
            $this->addColumn('pivot', function($q){
                return $q->pivot->pluck('level_2_item_classification_id')->toArray();
            });
    }
}