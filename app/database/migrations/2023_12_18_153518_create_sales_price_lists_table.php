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
        Schema::create('sales_price_lists', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->string('code', 255);
            $table->integer('company_id');
            $table->string('currency_id', 3);
            $table->string('bp_id', 100)->nullable();
            $table->boolean('is_disabled')->default(false);

            $table->foreign('company_id')->references('IDcompany')->on('company');
            $table->foreign('currency_id')->references('id')->on('currencies');
            $table->foreign('bp_id')->references('IDbp')->on('bp');
        });

        $this->createTrigger('sales_price_lists', 'id', 'company_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_price_lists');
    }
};
