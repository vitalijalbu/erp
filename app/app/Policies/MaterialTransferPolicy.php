<?php

namespace App\Policies;

use App\Models\User;

class MaterialTransferPolicy
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
        return $user->can('materials.manage');
    }
    
    public function store(User $user)
    {
        return $user->can('materials.manage');
    }

    public function update(User $user)
    {
        return $user->can('materials.manage');
    }
    
    public function delete(User $user)
    {
        return $user->can('materials.manage');
    }
    
    public function confirm(User $user)
    {
        return $user->can('materials.manage');
    }

}
