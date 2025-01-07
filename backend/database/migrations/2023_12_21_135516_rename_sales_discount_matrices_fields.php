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
        Schema::table('sale_discount_matrices', function (Blueprint $table) {
            $table->dropForeign(['sales_pricelist_id']);
        });

        Schema::table('sale_discount_matrices', function (Blueprint $table) {
            $table->dropColumn('sales_pricelist_id')->nullable();
        });

        Schema::table('sale_discount_matrices', function (Blueprint $table) {
            $table->string('sales_price_list_id', 100)->nullable();
            $table->foreign('sales_price_list_id')->references('id')->on('sales_price_lists');
        });

        Schema::table('sale_discount_matrix_rows', function (Blueprint $table) {
            $table->dropColumn('price');
            $table->decimal('value', 8, 4);
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
