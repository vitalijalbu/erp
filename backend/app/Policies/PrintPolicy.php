<?php

namespace App\Policies;

use App\Models\User;

class PrintPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }

    public function cuttingOrder(User $user)
    {
        return $user->can('cuttings.manage');
    }

    public function labels(User $user)
    {
        return $user->can('cuttings.manage') || $user->can('items_receipts.manage') || $user->can('split_order.manage') || $user->can('stocks_items.show');
    }

    public function labelRange(User $user)
    {
        return $user->can('items_receipts.manage');
    }

    public function mergeOrder(User $user)
    {
        return false;
    }
}
