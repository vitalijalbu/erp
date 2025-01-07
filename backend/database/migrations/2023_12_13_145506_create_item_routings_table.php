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
        Schema::create('item_routings', function (Blueprint $table) {
            $table->id();
            $table->string('item_id', 100);
            $table->string('process_id', 100);
            $table->string('price_item_id', 100)->nullable();
            $table->decimal('quantity', 8, 4, true);
            $table->string('setup_price_item_id', 100)->nullable();
            $table->string('operator_cost_item_id', 100)->nullable();
            $table->string('machine_cost_item_id', 100)->nullable();
            $table->integer('execution_time')->nullable();
            $table->integer('setup_time')->nullable();
            $table->integer('operation_men_occupation')->nullable();
            $table->integer('machine_men_occupation')->nullable();
            $table->integer('position');
            $table->text('note')->nullable();

            $table->foreign('item_id')->references('IDitem')->on('item')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('process_id')->references('id')->on('processes');
            $table->foreign('price_item_id')->references('IDitem')->on('item');
            $table->foreign('setup_price_item_id')->references('IDitem')->on('item');
            $table->foreign('operator_cost_item_id')->references('IDitem')->on('item');
            $table->foreign('machine_cost_item_id')->references('IDitem')->on('item');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_routings');
    }
};
