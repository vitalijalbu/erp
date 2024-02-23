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
        Schema::create('sale_discount_matrices', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->boolean('enabled');
            $table->integer('priority');
            $table->string('description', 255);
            $table->string('sales_pricelist_id', 100)->nullable();
            $table->string('currency_id', 3)->nullable();
            $table->string('bp_id', 100)->nullable();
            $table->integer('company_id');

            $table->foreign('sales_pricelist_id')->references('id')->on('sales_price_lists');
            $table->foreign('currency_id')->references('id')->on('currencies');
            $table->foreign('bp_id')->references('IDbp')->on('bp');
            $table->foreign('company_id')->references('IDcompany')->on('company');
        });

        $this->createTrigger('sale_discount_matrices', 'id', 'company_id');

        Schema::create('sale_discount_matrix_rows', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->integer('company_id');
            $table->boolean('enabled');
            $table->integer('position');
            $table->string('item_id', 100)->nullable();
            $table->string('item_group_id', 100)->nullable();
            $table->string('item_subfamily_id', 100)->nullable();
            $table->decimal('quantity')->nullable();
            $table->date('date_from')->nullable();
            $table->date('date_to')->nullable();
            $table->decimal('price');
            $table->text('note')->nullable();
            $table->string('sale_discount_matrix_id', 100);

            $table->foreign('item_id')->references('IDitem')->on('item');
            $table->foreign('item_group_id')->references('id')->on('item_group');
            $table->foreign('item_subfamily_id')->references('id')->on('items_subfamilies');
            $table->foreign('sale_discount_matrix_id')->references('id')->on('sale_discount_matrices');
        });

        $this->createTrigger('sale_discount_matrix_rows', 'id', 'company_id');

        Schema::create('sale_total_discount_matrices', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->boolean('enabled');
            $table->integer('priority');
            $table->string('description', 255);
            $table->string('currency_id', 3)->nullable();
            $table->integer('company_id');

            $table->foreign('currency_id')->references('id')->on('currencies');
            $table->foreign('company_id')->references('IDcompany')->on('company');
        });

        $this->createTrigger('sale_total_discount_matrices', 'id', 'company_id');

        Schema::create('sale_total_discount_matrix_rows', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->integer('company_id');
            $table->boolean('enabled');
            $table->integer('position');
            $table->string('bp_id', 100)->nullable();
            $table->string('bp_group_id', 100)->nullable();
            $table->string('item_id', 100)->nullable();
            $table->string('item_group_id', 100)->nullable();
            $table->string('item_subfamily_id', 100)->nullable();
            $table->string('service_item_id', 100)->nullable();
            $table->decimal('quantity')->nullable();
            $table->decimal('width')->nullable();
            //$table->date('date_from')->nullable();
            //$table->date('date_to')->nullable();
            $table->decimal('value');
            $table->text('note')->nullable();
            $table->string('sale_total_discount_matrix_id', 100);

            $table->foreign('bp_id')->references('IDbp')->on('bp');
            $table->foreign('bp_group_id')->references('id')->on('bp_groups');
            $table->foreign('item_id')->references('IDitem')->on('item');
            $table->foreign('item_group_id')->references('id')->on('item_group');
            $table->foreign('item_subfamily_id')->references('id')->on('items_subfamilies');
            $table->foreign('sale_total_discount_matrix_id')->references('id')->on('sale_total_discount_matrices');
            $table->foreign('service_item_id')->references('IDitem')->on('item');
        });

        $this->createTrigger('sale_total_discount_matrix_rows', 'id', 'company_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_discount_matrix_rows');
        Schema::dropIfExists('sale_discount_matrices');
        Schema::dropIfExists('sale_total_discount_matrix_rows');
        Schema::dropIfExists('sale_total_discount_matrices');
    }
};
