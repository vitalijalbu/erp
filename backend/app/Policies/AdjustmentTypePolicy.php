<?php

namespace App\Policies;

use App\Models\User;

class AdjustmentTypePolicy
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
        return $user->can('warehouse_adjustments.manage');
    }
}
