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
        activity()->withoutLogs(function () {
            Permission::unguard(true);
                
            $permission = Permission::create([
                'name' => 'routing.manage',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Routing Managament',
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
