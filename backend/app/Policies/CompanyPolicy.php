<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class CompanyPolicy extends BasePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('users.manage') || $user->can('configurator.manage');
    }

}
