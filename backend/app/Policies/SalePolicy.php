<?php

namespace App\Policies;

use App\Models\Sale;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SalePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('sales.create');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Sale $sale): bool
    {
        return $user->can('sales.create') && $sale->company_id == $user->IDcompany;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('sales.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function changeStateToApproved(User $user, Sale $sale): bool
    {
        return $user->can('sales.approved') && $sale->company_id == $user->IDcompany;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function changeStateToCanceled(User $user, Sale $sale): bool
    {
        return $user->can('sales.canceled') && $sale->company_id == $user->IDcompany;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function changeStateToClosed(User $user, Sale $sale): bool
    {
        return $user->can('sales.closed') && $sale->company_id == $user->IDcompany;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Sale $sale): bool
    {
        return $user->can('sales.create') && $sale->company_id == $user->IDcompany;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Sale $sale): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Sale $sale): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Sale $sale): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function approveDiscountOverride(User $user, Sale $sale = null): bool
    {
        return $user->can('sales_override_discount.manage') && ($sale === null || $sale->company_id == $user->IDcompany);
    }
}
