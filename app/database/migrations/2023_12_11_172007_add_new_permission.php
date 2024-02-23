<?php

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {

        activity()->withoutLogs(function () {
            Permission::unguard(true);
            
            $permission = Permission::create([
                'name' => 'workcenters.manage',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Workcenters Managament',
            ]);
            Permission::reguard();

            $admin = Role::findByName('admin');

            $admin->givePermissionTo($permission);

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
