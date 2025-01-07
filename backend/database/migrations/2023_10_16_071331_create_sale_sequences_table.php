<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\Traits\TriggerMigration;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Query\Expression;
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
        Schema::create('sale_sequences', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->string('name');
            $table->string('prefix', 4);
            $table->integer('year')->default(new Expression('YEAR(GETDATE())'));
            $table->integer('current', unsigned: true)->default(0);
            $table->boolean('quotation_default')->default(false);
            $table->boolean('sale_default')->default(false);
            $table->integer('company_id');

            $table->foreign('company_id')->on('company')->references('IDcompany');
        });

        $this->createTrigger('sale_sequences', 'id', 'company_id');

        activity()->withoutLogs(function () {
            Permission::unguard(true);
            $permission = Permission::create([
                'name' => 'sale_sequences.manage',
                'guard_name' => 'web',
                'created_at' => NULL,
                'updated_at' => NULL,
                'label' => 'Manage sale sequences',
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
        Schema::dropIfExists('sale_sequences');
    }
};
