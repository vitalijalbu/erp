<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Address;
use Illuminate\Auth\Access\Response;

class AddressPolicy extends BasePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Address $model): bool
    {
        return $model->company_id == $user->IDcompany;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('bp.manage');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Address $model): bool
    {
        return $user->can('bp.manage') && $model->company_id == $user->IDcompany;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Address $model): bool
    {
        return $user->can('bp.manage') && $model->company_id == $user->IDcompany;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Address $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Address $model): bool
    {
        return false;
    }
}
