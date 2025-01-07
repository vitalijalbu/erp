<?php

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
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->string('name', 255);
            $table->string('address_id', 100);
            $table->string('swift_code', 100);
            $table->string('iban', 100);
            $table->string('bp_id', 100);
            $table->integer('company_id');

            $table->foreign('address_id')->references('id')->on('addresses');
            $table->foreign('bp_id')->references('IDbp')->on('bp');
            $table->foreign('company_id')->references('IDcompany')->on('company');

            $table->unique(['iban', 'bp_id', 'company_id']);
        });

        $this->createTrigger('bank_accounts', 'id', 'company_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_accounts');

        $this->deleteTrigger('bank_accounts');
    }
};
