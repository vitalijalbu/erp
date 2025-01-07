<?php

namespace App\DataTables;

class UsersDataTable extends EloquentDataTable {

    protected function setSchema(): array
    {
        return [
            'id' => [
                'data' => 'id',
                'name' => 'id',
                'searchable' => true,
                'orderable' => true
            ],
            'username' => [
                'data' => 'username',
                'name' => 'username',
                'searchable' => true,
                'orderable' => true
            ],
            'company' => [
                'data' => 'company.desc',
                'name' => 'company.desc',
                'searchable' => true,
                'orderable' => true
            ],
            'default_warehouse' => [
                'data' => 'warehouse.desc',
                'name' => 'warehouse.desc',
                'searchable' => true,
                'orderable' => true
            ],
            'default_timezone' => [
                'data' => 'clientTimezoneDB',
                'name' => 'clientTimezoneDB',
                'searchable' => true,
                'orderable' => true
            ],
            'decimal_symb' => [
                'data' => 'decimal_symb',
                'name' => 'decimal_symb',
                'searchable' => true,
                'orderable' => true
            ],
            'list_separator' => [
                'data' => 'list_separator',
                'name' => 'list_separator',
                'searchable' => true,
                'orderable' => true
            ],
            'roles' => [
                'data' => 'roles',
                'name' => 'roles.label',
                'searchable' => true,
                'orderable' => true
            ],
           
        ];
    }
    
    protected function build(): static
    {
        return $this
            ->editColumn('roles', function($user) {
                return $user->roles()->get()->map->only(['id', 'label'])->toArray();
            });
    }
}