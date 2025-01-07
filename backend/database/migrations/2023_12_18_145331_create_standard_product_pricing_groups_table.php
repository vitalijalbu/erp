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
        Schema::create('standard_product_sale_pricing_groups', function (Blueprint $table) {
            $table->id();
            $table->integer('position');
            $table->string('name');
            $table->string('standard_product_id', 100);

            $table->foreign('standard_product_id')->references('id')->on('standard_products')->onDelete('cascade')->onDelete('cascade');
        });

        Schema::create('sale_pricing_constraint_standard_product', function (Blueprint $table) {
            $table->id();
            $table->integer('position', false, true);
            $table->string('constraint_id', 100);
            $table->string('standard_product_id', 100);
            $table->bigInteger('standard_product_sale_pricing_group_id');

            $table->foreign('constraint_id')->references('id')->on('constraints');
            $table->foreign('standard_product_sale_pricing_group_id')->references('id')->on('standard_product_sale_pricing_groups')
                ->onDelete('cascade')
                ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pricing_constraint_standard_product');
        Schema::dropIfExists('standard_product_pricing_groups');
    }
};
