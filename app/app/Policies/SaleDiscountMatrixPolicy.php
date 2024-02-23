<?php

namespace App\Policies;

use App\Models\User;
use App\Models\SaleDiscountMatrix;
use App\Models\SaleDiscountMatrixRow;
use Illuminate\Auth\Access\Response;

class SaleDiscountMatrixPolicy
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
    public function view(User $user, SaleDiscountMatrix $saleDiscountMatrix): bool
    {
        return $user->can('sales_discount_matrix.manage') && $saleDiscountMatrix->company_id == $user->IDcompany;
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
    public function update(User $user, SaleDiscountMatrix $saleDiscountMatrix): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, SaleDiscountMatrix $saleDiscountMatrix, SaleDiscountMatrixRow $saleDiscountMatrixRow = null): bool
    {
        if($saleDiscountMatrixRow){
            return $user->can('sales_discount_matrix.manage') && $saleDiscountMatrix->company_id == $user->IDcompany && $saleDiscountMatrixRow->sale_discount_matrix_id == $saleDiscountMatrix->id;
        }

        return $user->can('sales_discount_matrix.manage') && $saleDiscountMatrix->company_id == $user->IDcompany;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, SaleDiscountMatrix $saleDiscountMatrix): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, SaleDiscountMatrix $saleDiscountMatrix): bool
    {
        return false;
    }

    public function toggle(User $user, SaleDiscountMatrix $saleDiscountMatrix, SaleDiscountMatrixRow $saleDiscountMatrixRow = null): bool
    {
        if($saleDiscountMatrixRow){
            return $user->can('sales_discount_matrix.manage') && $saleDiscountMatrix->company_id == $user->IDcompany && $saleDiscountMatrixRow->sale_discount_matrix_id == $saleDiscountMatrix->id;
        }
        
        return $user->can('sales_discount_matrix.manage') && $saleDiscountMatrix->company_id == $user->IDcompany;
    }
    public function clone(User $user, SaleDiscountMatrix $saleDiscountMatrix): bool
    {        
        return $user->can('sales_discount_matrix.manage') && $saleDiscountMatrix->company_id == $user->IDcompany;
    }
}
