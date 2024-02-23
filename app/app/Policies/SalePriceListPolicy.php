<?php

namespace App\Policies;

use App\Models\User;
use App\Models\SalePriceList;
use App\Models\SalePriceListRow;
use Illuminate\Auth\Access\Response;

class SalePriceListPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('sales_price_lists.manage');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, SalePriceList $salePriceList): bool
    {
        return $user->can('sales_price_lists.manage') && $salePriceList->company_id == $user->IDcompany;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('sales_price_lists.manage');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, SalePriceList $salePriceList): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, SalePriceList $salePriceList, SalePriceListRow $salePriceListRow = null): bool
    {
        if($salePriceListRow){
            return $user->can('sales_price_lists.manage') && $salePriceList->company_id == $user->IDcompany && $salePriceListRow->sales_price_list_id == $salePriceList->id;
        }

        return $user->can('sales_price_lists.manage') && $salePriceList->company_id == $user->IDcompany;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, SalePriceList $salePriceList): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, SalePriceList $salePriceList): bool
    {
        return false;
    }

    public function toggle(User $user, SalePriceList $salePriceList, SalePriceListRow $salePriceListRow = null): bool
    {
        if($salePriceListRow){
            return $user->can('sales_price_lists.manage') && $salePriceList->company_id == $user->IDcompany && $salePriceListRow->sales_price_list_id == $salePriceList->id;
        }
        
        return $user->can('sales_price_lists.manage') && $salePriceList->company_id == $user->IDcompany;
    }
    public function clone(User $user, SalePriceList $salePriceList): bool
    {        
        return $user->can('sales_price_lists.manage') && $salePriceList->company_id == $user->IDcompany;
    }
    public function changePrice(User $user, SalePriceList $salePriceList): bool
    {        
        return $user->can('sales_price_lists.manage') && $salePriceList->company_id == $user->IDcompany;
    }
}
