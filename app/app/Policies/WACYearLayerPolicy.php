<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WACYearLayer;
use Illuminate\Auth\Access\Response;

class WACYearLayerPolicy extends BasePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('wac.manage');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, WACYearLayer $model): bool
    {
        return $user->can('wac.show') && $model->IDcompany == $user->IDcompany;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('wac.manage');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, WACYearLayer $model): bool
    {
        return $user->can('wac.manage') && $model->IDcompany == $user->IDcompany;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, WACYearLayer $model): bool
    {
        return $user->can('wac.manage') && $model->IDcompany == $user->IDcompany;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, WACYearLayer $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, WACYearLayer $model): bool
    {
        return false;
    }
}
