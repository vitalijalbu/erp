<?php

namespace App\Policies;

use App\Models\User;

class ReceiptPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }

    public function purchase(User $user)
    {
        return $user->can('items_receipts.manage');
    }

    public function fromChiorino(User $user)
    {
        return $user->can('items_receipts.manage');
    }

    public function confirm(User $user)
    {
        return $user->can('items_receipts.manage');
    }
}
