<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('IDcompany')->constrained('companies')->cascadeOnDelete();
            $table->string('username');
            $table->foreignId('IDgroup')->constrained('groups')->cascadeOnDelete();
            $table->string('language', 10)->nullable();
            $table->foreignId('IDwarehouseUserDef')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->string('clientTimezoneDB', 50)->nullable();
            $table->string('decimal_symb', 5)->nullable();
            $table->string('list_separator', 5)->nullable();
            $table->foreignId('employee_contact_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('default_workcenter', 100)->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
