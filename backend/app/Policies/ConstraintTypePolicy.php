<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ConstraintType;

class ConstraintTypePolicy extends BasePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('configurator.manage');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ConstraintType $model): bool
    {
        return $user->can('configurator.manage');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ConstraintType $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ConstraintType $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ConstraintType $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ConstraintType $model): bool
    {
        return false;
    }
}
