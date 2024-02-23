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
        Schema::table('sale_rows', function (Blueprint $table) {
            $table->dropColumn('price');
            $table->dropColumn('total_price');
            $table->dropColumn('discount');
        });

        Schema::table('sale_rows', function (Blueprint $table) {
            $table->decimal('price', 16, 4)->nullable();
            $table->decimal('final_price', 16, 4)->nullable();
            $table->decimal('discount', 16, 4)->nullable();
            $table->decimal('cost', 16, 4)->nullable();
            $table->decimal('routing_cost', 16, 4)->nullable();
            $table->decimal('profit', 16, 4)->nullable();
            $table->decimal('total_price', 16, 4)->nullable();
            $table->decimal('total_final_price', 16, 4)->nullable();
            $table->decimal('total_discount', 16, 4)->nullable();
            $table->decimal('total_cost', 16, 4)->nullable();
            $table->decimal('total_routing_cost', 16, 4)->nullable();
            $table->decimal('total_profit', 16, 4)->nullable();
            $table->string('sale_total_discount_matrix_row_id', 100)->nullable();
            $table->decimal('requested_override_total_discount', 16, 4)->nullable();
            $table->decimal('override_total_discount', 16, 4)->nullable();


            $table->foreign('sale_total_discount_matrix_row_id')->references('id')->on('sale_total_discount_matrix_rows');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_rows', function (Blueprint $table) {
            $table->dropForeign(['sale_total_discount_matrix_row_id']);
        });

        Schema::table('sale_rows', function (Blueprint $table) {
            $table->dropColumn('price');
            $table->dropColumn('final_price');
            $table->dropColumn('discount');
            $table->dropColumn('cost');
            $table->dropColumn('routing_cost');
            $table->dropColumn('profit');
            $table->dropColumn('total_price');
            $table->dropColumn('total_final_price');
            $table->dropColumn('total_discount');
            $table->dropColumn('total_cost');
            $table->dropColumn('total_routing_cost');
            $table->dropColumn('total_profit');
            $table->dropColumn('sale_total_discount_matrix_row_id');
            $table->dropColumn('requested_override_total_discount');
            $table->dropColumn('override_total_discount');
        });
        
        Schema::table('sale_rows', function (Blueprint $table) {
            $table->decimal('price', 16, 4)->nullable();
            $table->decimal('total_price', 16, 4)->nullable();
            $table->decimal('discount', 16, 4)->nullable();
        });

        
    }
};
