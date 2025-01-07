<?php

namespace App\Policies;

use App\Models\CuttingOrderRow;
use App\Models\User;

class CuttingOrderPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        
    }

    public function index(User $user)
    {
        return $user->can('cuttings.manage');
    }

    public function store(User $user)
    {
        return $user->can('cuttings.manage');
    }
    
    public function update(User $user)
    {
        return $user->can('cuttings.manage');
    }

    public function confirm(User $user)
    {
        return $user->can('cuttings.manage');
    }

    public function print(User $user)
    {
        return $user->can('cuttings.manage');
    }

    public function printLabels(User $user)
    {
        return $user->can('cuttings.manage');
    }


}
