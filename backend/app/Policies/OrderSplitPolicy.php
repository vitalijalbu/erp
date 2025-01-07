<?php

namespace App\Policies;

use App\Models\OrderSplitRow;
use App\Models\User;

class OrderSplitPolicy
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
        return $user->can('split_order.manage');
    }

    public function store(User $user)
    {
        return $user->can('split_order.manage');
    }

    public function delete(User $user, OrderSplitRow $split)
    {
        return $user->can('split_order.manage') && $split->IDcompany == $user->IDcompany;
    }

    public function confirm(User $user)
    {
        return $user->can('split_order.manage');
    }
}
