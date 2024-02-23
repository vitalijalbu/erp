<?php

namespace App\Policies;

use App\Models\User;

class ReportPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        
    }

    public function cuttingHistory(User $user){
        return $user->can('report.show');
    }
    
    public function cuttingWaste(User $user){
        return $user->can('report.show');
    }

    public function cuttingActive(User $user){
        return $user->can('report.show');
    }

    public function lotTracking(User $user){
        return $user->can('report.show');
    }

    public function stockByWidth(User $user){
        return $user->can('report.show');
    }

    public function transactionHistory(User $user){
        return $user->can('report.show');
    }

    public function unloadedItem(User $user){
        return $user->can('report.show');
    }

    public function lotShippedBP(User $user){
        return $user->can('report.show');
    }

    public function lotReceivedBP(User $user){
        return $user->can('report.show');
    }

    public function activityViewer(User $user){
        return $user->can('report.show');
    }

    public function stockLimits(User $user){
        return $user->can('report.show');
    }

    public function openPurchaseBiella(User $user){
        return $user->can('report.show');
    }

    public function graphStockAtDate(User $user){
        return $user->can('report.show');
    }

    public function reportStockValue(User $user){
        return $user->can('report.show') && $user->can('items.value.show');
    }

    public function inventoryLot(User $user)
    {
        return $user->can('report.show') && $user->can('master_data.inventory.manage');
    }

    public function adjustmentInventoryLot(User $user)
    {
        return $user->can('report.show') && $user->can('master_data.inventory.manage');
    }
}
