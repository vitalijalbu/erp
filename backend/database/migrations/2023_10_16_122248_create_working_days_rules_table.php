<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\Traits\TriggerMigration;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    use TriggerMigration;

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('working_days_rules', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->boolean('type')->default(false);
            $table->date('start');
            $table->date('end')->nullable();
            $table->json('days_of_week')->nullable()->default('[]');
            $table->boolean('repeat')->default(0);
            $table->integer('company_id');

            $table->foreign('company_id')->on('company')->references('IDcompany')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        $this->createTrigger('working_days_rules', 'id', 'company_id');
        
        activity()->withoutLogs(function () {
            Permission::unguard(true);
            $permission = Permission::create([
                'name' => 'calendar.manage',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Manage working days calendar',
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
        Schema::dropIfExists('working_days_rules');
    }
};
