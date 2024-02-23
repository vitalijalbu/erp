<?php

namespace App\Policies;

use App\Models\ItemLine;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ItemLinePolicy
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
    public function view(User $user, ItemLine $itemLine): bool
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
    public function update(User $user, ItemLine $itemLine): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ItemLine $itemLine): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ItemLine $itemLine): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ItemLine $itemLine): bool
    {
        return false;
    }
}
