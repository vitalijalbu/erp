<?php

use App\Models\Traits\TriggerMigration;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    use TriggerMigration;

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sale_row_routing_cost_components', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->integer('company_id');
            $table->string('item_id', 100);
            $table->decimal('quantity');
            $table->string('sales_price_list_id', 100);
            $table->string('sales_price_lists_row_id', 100);
            $table->decimal('price', 16, 4);
            $table->decimal('total_price', 16, 4);
            $table->string('sale_discount_matrix_id', 100)->nullable();
            $table->string('sale_discount_matrix_row_id', 100)->nullable();
            $table->decimal('discount', 16, 4)->nullable();
            $table->decimal('total', 16, 4);
            $table->string('process_id', 100);
            $table->text('note')->nullable();
            $table->string('sale_row_id', 100);
            $table->integer('position')->default(1);

            $table->foreign('company_id')->references('IDcompany')->on('company');
            $table->foreign('item_id')->references('IDitem')->on('item');
            $table->foreign('sales_price_list_id')->references('id')->on('sales_price_lists');
            $table->foreign('sales_price_lists_row_id')->references('id')->on('sales_price_lists_rows');
            $table->foreign('sale_discount_matrix_id')->references('id')->on('sale_discount_matrices');
            $table->foreign('sale_discount_matrix_row_id')->references('id')->on('sale_discount_matrix_rows');
            $table->foreign('process_id')->references('id')->on('processes');
            $table->foreign('sale_row_id')->references('id')->on('sale_rows');

            $table->index('company_id');
            $table->index('sale_row_id');
            $table->index('item_id');
        });

        $this->createTrigger('sale_row_routing_cost_components', 'id', 'company_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_row_routing_cost_components');
    }
};
