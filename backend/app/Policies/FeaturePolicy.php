<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Feature;
use Illuminate\Auth\Access\Response;

class FeaturePolicy extends BasePolicy
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
    public function view(User $user, Feature $model): bool
    {
        return $user->can('configurator.manage');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('configurator.manage');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Feature $model): bool
    {
        return $user->can('configurator.manage');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Feature $model): bool
    {
        return $user->can('configurator.manage');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Feature $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Feature $model): bool
    {
        return false;
    }
}
