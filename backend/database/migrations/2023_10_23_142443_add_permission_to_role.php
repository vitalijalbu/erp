<?php

use App\Models\Role;
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
            $role = Role::where('name', 'admin')->first();

            $role->givePermissionTo('sales.create');
        });
    }
};
