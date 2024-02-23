<?php

namespace App\Policies;

use App\Models\User;

class TransactionPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }

    public function lastBySupplierAndItem(User $user)
    {
        return $user->can('items_receipts.manage');
    }
}
