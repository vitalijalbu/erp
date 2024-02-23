<?php

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
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->id();
            $table->integer('company_id');
            $table->string('company_currency_id', 3);
            $table->string('foreign_currency_id', 3);
            $table->decimal('rate', 16, 4);
            $table->date('date');

            $table->foreign('company_id')->references('IDcompany')->on('company');
            $table->foreign('company_currency_id')->references('id')->on('currencies');
            $table->foreign('foreign_currency_id')->references('id')->on('currencies');

            $table->index(['company_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exchange_rates');
    }
};
