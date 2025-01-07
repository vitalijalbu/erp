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
        Schema::table('sale_row_price_components', function (Blueprint $table) {
            $table->dropForeign(['sale_row_id']);
        });
        Schema::table('sale_row_price_components', function (Blueprint $table) {
            $table->foreign('sale_row_id')->references('id')->on('sale_rows')->onUpdate('cascade')->onDelete('cascade');
        });
        Schema::table('sale_row_routing_cost_components', function (Blueprint $table) {
            $table->dropForeign(['sale_row_id']);
        });
        Schema::table('sale_row_routing_cost_components', function (Blueprint $table) {
            $table->foreign('sale_row_id')->references('id')->on('sale_rows')->onUpdate('cascade')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_row_price_components', function (Blueprint $table) {
            //
        });
    }
};
