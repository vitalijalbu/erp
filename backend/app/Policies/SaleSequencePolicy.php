<?php

namespace App\Policies;

use App\Models\Contact;
use App\Models\SaleSequence;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SaleSequencePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('sales.create') || $user->can('sale_sequences.manage');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, SaleSequence $sequence): bool
    {
        return $user->IDcompany == $sequence->company_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('sale_sequences.manage');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, SaleSequence $sequence): bool
    {
        return $user->can('sale_sequences.manage') && $user->IDcompany == $sequence->company_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, SaleSequence $sequence): bool
    {
        return $user->can('sale_sequences.manage') && $user->IDcompany == $sequence->company_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Contact $contact): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Contact $contact): bool
    {
        return false;
    }
}
