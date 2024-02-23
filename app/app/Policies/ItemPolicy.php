<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Item;
use Illuminate\Auth\Access\Response;

class ItemPolicy extends BasePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('warehouse_adjustments.manage') || $user->can('master_data.items.manage') || $user->can('items_receipts.manage');
    }

    public function viewAnyCompany(User $user): bool
    {
        return $user->can('configurator.manage');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Item $model): bool
    {
        return $model->IDcompany == $user->IDcompany || !$model->IDcompany;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('master_data.items.manage');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Item $model): bool
    {
        return $user->can('master_data.items.manage') && $model->IDcompany == $user->IDcompany;
    }

    public function updateAlternative(User $user, Item $model): bool
    {
        return $user->can('master_data.items.manage') && ($model->IDcompany == $user->IDcompany || !$model->IDcompany);
    }

    public function toggle(User $user, Item $model): bool
    {
        return $user->can('master_data.items.manage') && ($model->IDcompany == $user->IDcompany || !$model->IDcompany);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Item $model): bool
    {
        return $user->can('master_data.items.manage') && $model->IDcompany == $user->IDcompany;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Item $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Item $model): bool
    {
        return false;
    }
}
