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
        Schema::table('sales_price_lists', function (Blueprint $table) {
            $table->index('company_id');
        });

        Schema::table('sales_price_lists_rows', function (Blueprint $table) {
            $table->index('sales_price_list_id');
        });

        Schema::table('sale_discount_matrices', function (Blueprint $table) {
            $table->index('company_id');
        });

        Schema::table('sale_discount_matrix_rows', function (Blueprint $table) {
            $table->index('sale_discount_matrix_id');
        });

        Schema::table('sale_total_discount_matrices', function (Blueprint $table) {
            $table->index('company_id');
        });

        Schema::table('sale_total_discount_matrix_rows', function (Blueprint $table) {
            $table->index('sale_total_discount_matrix_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_price_lists', function (Blueprint $table) {
            $table->dropIndex(['company_id']);
        });

        Schema::table('sales_price_lists_rows', function (Blueprint $table) {
            $table->dropIndex(['sales_price_list_id']);
        });

        Schema::table('sale_discount_matrices', function (Blueprint $table) {
            $table->dropIndex(['company_id']);
        });

        Schema::table('sale_discount_matrix_rows', function (Blueprint $table) {
            $table->dropIndex(['sale_discount_matrix_id']);
        });

        Schema::table('sale_total_discount_matrices', function (Blueprint $table) {
            $table->dropIndex(['company_id']);
        });

        Schema::table('sale_total_discount_matrix_rows', function (Blueprint $table) {
            $table->dropIndex(['sale_total_discount_matrix_id']);
        });
    }
};
