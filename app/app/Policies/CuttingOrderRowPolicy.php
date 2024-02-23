<?php

namespace App\Policies;

use App\Models\CuttingOrderRow;
use App\Models\User;

class CuttingOrderRowPolicy
{
    public function delete(User $user, CuttingOrderRow $cutting)
    {
        return $user->can('cuttings.manage') && $user->IDcompany == $cutting->IDcompany;
    }

}
