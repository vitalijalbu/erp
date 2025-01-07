<?php

namespace App\Policies;

use App\Models\Inventory;
use App\Models\User;

class InventoryPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }

    public function index(User $user)
    {
        return $user->can('master_data.inventory.manage');
    }

    public function store(User $user)
    {
        return $user->can('master_data.inventory.manage');
    }

    public function conclude(User $user, Inventory $inventory)
    {
        return $user->can('master_data.inventory.manage') && $inventory->IDcompany == $user->IDcompany;
    }
    public function show(User $user, Inventory $inventory)
    {
        return $user->can('master_data.inventory.manage') && $inventory->IDcompany == $user->IDcompany;
    }
}
