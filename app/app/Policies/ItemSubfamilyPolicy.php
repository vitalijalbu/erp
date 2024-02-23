<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ItemSubfamily;
use Illuminate\Auth\Access\Response;

class ItemSubfamilyPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('master_data.items.manage');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ItemSubfamily $itemSubfamily): bool
    {
        return $user->can('master_data.items.manage');
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
    public function update(User $user, ItemSubfamily $itemSubfamily): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ItemSubfamily $itemSubfamily): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ItemSubfamily $itemSubfamily): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ItemSubfamily $itemSubfamily): bool
    {
        return false;
    }
}
