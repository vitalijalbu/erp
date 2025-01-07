<?php

namespace App\Policies;

use App\Models\OrderProductionComponent;
use App\Models\User;

class OrderProductionPolicy
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
        return $user->can('order_production.manage');
    }

    public function store(User $user)
    {
        return $user->can('order_production.manage');
    }

    public function update(User $user)
    {
        return $user->can('order_production.manage');
    }

    public function delete(User $user, OrderProductionComponent $component)
    {
        return $user->can('order_production.manage') && $component->IDcompany == $user->IDcompany;
    }

    public function confirm(User $user)
    {
        return $user->can('order_production.manage');
    }
}
