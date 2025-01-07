<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Workcenter;
use Illuminate\Auth\Access\Response;

class WorkcenterPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('workcenters.manage');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Workcenter $workcenter): bool
    {
        return $user->can('workcenters.manage') && $workcenter->company_id == $user->IDcompany;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('workcenters.manage');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Workcenter $workcenter): bool
    {
        return $user->can('workcenters.manage') && $workcenter->company_id == $user->IDcompany;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Workcenter $workcenter): bool
    {
        return $user->can('workcenters.manage') && $workcenter->company_id == $user->IDcompany;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Workcenter $workcenter): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Workcenter $workcenter): bool
    {
        return false;
    }
}
