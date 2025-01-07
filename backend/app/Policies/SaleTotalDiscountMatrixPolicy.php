<?php

namespace App\Policies;

use App\Models\User;
use App\Models\SaleTotalDiscountMatrix;
use App\Models\SaleTotalDiscountMatrixRow;
use Illuminate\Auth\Access\Response;

class SaleTotalDiscountMatrixPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('sales_discount_matrix.manage');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, SaleTotalDiscountMatrix $saleTotalDiscountMatrix): bool
    {
        return $user->can('sales_discount_matrix.manage') && $saleTotalDiscountMatrix->company_id == $user->IDcompany;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('sales_discount_matrix.manage');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, SaleTotalDiscountMatrix $saleTotalDiscountMatrix): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, SaleTotalDiscountMatrix $saleTotalDiscountMatrix, SaleTotalDiscountMatrixRow $saleTotalDiscountMatrixRow = null): bool
    {
        if($saleTotalDiscountMatrixRow){
            return $user->can('sales_discount_matrix.manage') && $saleTotalDiscountMatrix->company_id == $user->IDcompany && $saleTotalDiscountMatrixRow->sale_total_discount_matrix_id == $saleTotalDiscountMatrix->id;
        }

        return $user->can('sales_discount_matrix.manage') && $saleTotalDiscountMatrix->company_id == $user->IDcompany;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, SaleTotalDiscountMatrix $saleTotalDiscountMatrix): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, SaleTotalDiscountMatrix $saleTotalDiscountMatrix): bool
    {
        return false;
    }

    public function toggle(User $user, SaleTotalDiscountMatrix $saleTotalDiscountMatrix, SaleTotalDiscountMatrixRow $saleTotalDiscountMatrixRow = null): bool
    {
        if($saleTotalDiscountMatrixRow){
            return $user->can('sales_discount_matrix.manage') && $saleTotalDiscountMatrix->company_id == $user->IDcompany && $saleTotalDiscountMatrixRow->sale_total_discount_matrix_id == $saleTotalDiscountMatrix->id;
        }
        
        return $user->can('sales_discount_matrix.manage') && $saleTotalDiscountMatrix->company_id == $user->IDcompany;
    }
    // public function clone(User $user, SaleTotalDiscountMatrix $saleTotalDiscountMatrix): bool
    // {        
    //     return $user->can('sales_discount_matrix.manage') && $saleTotalDiscountMatrix->company_id == $user->IDcompany;
    // }
}
