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
        Schema::create('bom_constraint_standard_product', function (Blueprint $table) {
            $table->id();
            $table->integer('position', false, true);
            $table->string('constraint_id', 100);
            $table->string('standard_product_id', 100);

            $table->foreign('constraint_id')->references('id')->on('constraints');
            $table->foreign('standard_product_id')->references('id')->on('standard_products')
                ->onDelete('cascade')
                ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bom_constraint_standard_product');
    }
};
