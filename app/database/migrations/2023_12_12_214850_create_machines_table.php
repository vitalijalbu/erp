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
        Schema::create('machines', function (Blueprint $table) {
            $table->string('code', 200)->primary();
            $table->string('workcenter_id', 100);
            $table->string('cost_item_id', 100);
            $table->integer('men_occupation');
            $table->integer('company_id');
            $table->foreign('company_id')->references('IDcompany')->on('company');

            $table->foreign('workcenter_id')->references('id')->on('workcenters');
            $table->foreign('cost_item_id')->references('IDitem')->on('item');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('machines');
    }
};
