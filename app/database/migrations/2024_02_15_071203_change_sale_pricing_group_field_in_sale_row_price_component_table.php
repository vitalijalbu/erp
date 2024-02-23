<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('sale_row_price_components', function (Blueprint $table) {
            $table->dropForeign(['standard_product_sale_pricing_group_id']);
        });

        Schema::table('sale_row_price_components', function (Blueprint $table) {
            $table->string('standard_product_sale_pricing_group_name', 100)->nullable();
        });

        foreach(DB::table('standard_product_sale_pricing_groups')->get() as $group) {
            DB::table('sale_row_price_components')
              ->where('standard_product_sale_pricing_group_id', $group->id)
              ->update(['standard_product_sale_pricing_group_name' => $group->name]);
        }

        Schema::table('sale_row_price_components', function (Blueprint $table) {
            $table->dropColumn('standard_product_sale_pricing_group_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_row_price_component', function (Blueprint $table) {
            //
        });
    }
};
