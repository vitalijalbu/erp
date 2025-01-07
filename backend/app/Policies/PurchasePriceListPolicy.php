<?php

namespace App\Policies;

use App\Models\User;
use App\Models\PurchasePriceList;
use App\Models\PurchasePriceListRow;
use Illuminate\Auth\Access\Response;

class PurchasePriceListPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('purchase_price_lists.manage');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, PurchasePriceList $purchasePriceList): bool
    {
        return $user->can('purchase_price_lists.manage') && $purchasePriceList->company_id == $user->IDcompany;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('purchase_price_lists.manage');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, PurchasePriceList $purchasePriceList): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, PurchasePriceList $purchasePriceList, PurchasePriceListRow $purchasePriceListRow = null): bool
    {
        if($purchasePriceListRow){
            return $user->can('purchase_price_lists.manage') && $purchasePriceList->company_id == $user->IDcompany && $purchasePriceListRow->purchase_price_list_id == $purchasePriceList->id;
        }

        return $user->can('purchase_price_lists.manage') && $purchasePriceList->company_id == $user->IDcompany;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, PurchasePriceList $purchasePriceList): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, PurchasePriceList $purchasePriceList): bool
    {
        return false;
    }

    public function toggle(User $user, PurchasePriceList $purchasePriceList, PurchasePriceListRow $purchasePriceListRow = null): bool
    {
        if($purchasePriceListRow){
            return $user->can('purchase_price_lists.manage') && $purchasePriceList->company_id == $user->IDcompany && $purchasePriceListRow->purchase_price_list_id == $purchasePriceList->id;
        }
        
        return $user->can('purchase_price_lists.manage') && $purchasePriceList->company_id == $user->IDcompany;
    }

    public function clone(User $user, PurchasePriceList $purchasePriceList): bool
    {        
        return $user->can('purchase_price_lists.manage') && $purchasePriceList->company_id == $user->IDcompany;
    }

    public function changePrice(User $user, PurchasePriceList $purchasePriceList): bool
    {        
        return $user->can('purchase_price_lists.manage') && $purchasePriceList->company_id == $user->IDcompany;
    }
}
