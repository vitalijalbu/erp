<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Auth\Access\Response;

class WarehousePolicy extends BasePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('master_data.warehouses.manage');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Warehouse $model): bool
    {
        return $model->IDcompany == $user->IDcompany;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('master_data.warehouses.manage');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Warehouse $model): bool
    {
        return $user->can('master_data.warehouses.manage') && $model->IDcompany == $user->IDcompany;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Warehouse $model): bool
    {
        return $user->can('master_data.warehouses.manage') && $model->IDcompany == $user->IDcompany;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Warehouse $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Warehouse $model): bool
    {
        return false;
    }
}
