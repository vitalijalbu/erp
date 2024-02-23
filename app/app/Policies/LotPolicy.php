<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Lot;
use Illuminate\Auth\Access\Response;

class LotPolicy extends BasePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('stocks_items.show');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Lot $model): bool
    {
        return $user->can('stocks_items.show') && $model->IDcompany == $user->IDcompany;
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
    public function update(User $user, Lot $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Lot $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Lot $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Lot $model): bool
    {
        return false;
    }

    public function viewValue(User $user, Lot $model): bool
    {
        return $user->can('items.value.show') && $model->IDcompany == $user->IDcompany;
    }

    public function setValue(User $user, Lot $model): bool
    {
        return $user->can('items.value.manage') && $model->IDcompany == $user->IDcompany;
    }

    public function viewAnyValues(User $user): bool
    {
        return $user->can('items.value.manage');
    }

    public function inventoryCheck(User $user)
    {
        return $user->can('stocks_items.show') && $user->can('master_data.inventory.manage');
    }

    public function updateText(User $user, Lot $model)
    {
        return $user->can('stocks_items.show') && $model->IDcompany == $user->IDcompany;
    }

    public function getStocks(User $user, Lot $model)
    {
        return $user->can('warehouse_adjustments.manage') && $user->IDcompany == $model->IDcompany;
    }

    public function updateInfo(User $user, Lot $model)
    {
        return $user->can('warehouse_adjustments.manage') && $model->IDcompany == $user->IDcompany;
    }

}
