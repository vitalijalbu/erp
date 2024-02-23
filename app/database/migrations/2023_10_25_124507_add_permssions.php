<?php

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Permission::insert([
            ['name' => 'bp.block', 'label' => 'Permission to block BP', 'guard_name' => 'web'],
            ['name' => 'sales.approved', 'label' => 'Permission to approve orders', 'guard_name' => 'web'],
            ['name' => 'sales.canceled', 'label' => 'Permission to cancel orders', 'guard_name' => 'web'],
            ['name' => 'sales.closed', 'label' => 'Permission to close orders', 'guard_name' => 'web'],

        ]);  

        activity()->withoutLogs(function () {
            $role = Role::where('name', 'admin')->first();

            $role->givePermissionTo('sales.create');
            $role->givePermissionTo('sales.approved');
            $role->givePermissionTo('sales.canceled');
            $role->givePermissionTo('sales.closed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
