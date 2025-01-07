<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Stock;
use App\Policies\BasePolicy;
use Illuminate\Auth\Access\Response;

class StockPolicy extends BasePolicy
{
    public function index(User $user): bool
    {
        return $user->can('stocks_items.show');
    }

    public function inventoryAddLot(User $user): bool
    {
        return $user->can('stocks_items.show');
    }

    public function inventoryDelLot(User $user): bool
    {
        return $user->can('stocks_items.show');
    }

    public function export(User $user): bool
    {
        return $user->can('stocks_items.show');
    }

    public function getLotDimensions(User $user, Stock $stock)
    {
        return $user->can('warehouse_adjustments.manage') && $user->IDcompany == $stock->IDcompany;
    }

    public function eraseAndAddNewLot(User $user, Stock $stock)
    {
        return $user->can('warehouse_adjustments.manage') && $user->IDcompany == $stock->IDcompany;
    }
}
