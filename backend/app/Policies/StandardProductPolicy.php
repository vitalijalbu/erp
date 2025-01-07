<?php

namespace App\Policies;

use App\Models\User;
use App\Models\StandardProduct;
use Illuminate\Auth\Access\Response;

class StandardProductPolicy extends BasePolicy
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
    public function view(User $user, StandardProduct $model): bool
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
    public function update(User $user, StandardProduct $model): bool
    {
        return $user->can('configurator.manage');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, StandardProduct $model): bool
    {
        return $user->can('configurator.manage');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, StandardProduct $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, StandardProduct $model): bool
    {
        return false;
    }

    public function addFeatures(User $user, StandardProduct $model): bool
    {
        return $user->can('configurator.manage');
    }

    public function addBOMRules(User $user, StandardProduct $model): bool
    {
        return $user->can('configurator.manage');
    }

    public function addRoutings(User $user, StandardProduct $model): bool
    {
        return $user->can('configurator.manage');
    }

    public function addPricingRules(User $user, StandardProduct $model): bool
    {
        return $user->can('configurator.manage');
    }

    /**
     * Determine whether the user can sale the product.
     */
    public function sale(User $user, StandardProduct $model): bool
    {
        return (
            $user->can('sales.create') && ($model->company_id == $user->IDcompany || $model->company_id == 0)
        ) || $user->can('configurator.manage');
    }
}
