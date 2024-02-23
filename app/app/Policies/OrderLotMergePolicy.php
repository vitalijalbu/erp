<?php

namespace App\Policies;

use App\Models\OrderMergeRowsPicking;
use App\Models\User;

class OrderLotMergePolicy
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
        return $user->can('order_lot_merge.manage');
    }
    
    public function additionalLotToMerge(User $user)
    {
        return $user->can('order_lot_merge.manage');
    }

    public function store(User $user)
    {
        return $user->can('order_lot_merge.manage');
    }

    public function delete(User $user, OrderMergeRowsPicking $row)
    {
        return $user->can('order_lot_merge.manage') && $user->IDcompany == $row->IDcompany;
    }
}
