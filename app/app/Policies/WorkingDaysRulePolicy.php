<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WorkingDaysRule;
use Illuminate\Auth\Access\Response;

class WorkingDaysRulePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('calendar.manage');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, WorkingDaysRule $workingDaysRule): bool
    {
        return $user->can('calendar.manage') && $user->IDcompany = $workingDaysRule->company_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('calendar.manage');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, WorkingDaysRule $workingDaysRule): bool
    {
        return $user->can('calendar.manage') && $user->IDcompany = $workingDaysRule->company_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, WorkingDaysRule $workingDaysRule): bool
    {
        return $user->can('calendar.manage') && $user->IDcompany = $workingDaysRule->company_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, WorkingDaysRule $workingDaysRule): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, WorkingDaysRule $workingDaysRule): bool
    {
        return false;
    }
}
