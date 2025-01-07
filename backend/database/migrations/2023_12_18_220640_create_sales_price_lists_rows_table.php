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
        Schema::create('sales_price_lists_rows', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->integer('company_id');
            $table->integer('order');
            $table->string('item_id', 100)->nullable();
            $table->string('item_group_id', 100)->nullable();
            $table->string('item_subfamily_id', 100)->nullable();
            $table->decimal('quantity')->nullable();
            $table->decimal('width')->nullable();
            $table->string('class', 100)->nullable();
            $table->date('date_from')->nullable();
            $table->date('date_to')->nullable();
            $table->decimal('price');
            $table->text('note')->nullable();
            $table->string('sales_price_list_id', 100);

            $table->foreign('company_id')->references('IDcompany')->on('company');
            $table->foreign('item_id')->references('IDitem')->on('item');
            $table->foreign('item_group_id')->references('id')->on('item_group');
            $table->foreign('item_subfamily_id')->references('id')->on('items_subfamilies');
            $table->foreign('sales_price_list_id')->references('id')->on('sales_price_lists');
        });

        $this->createTrigger('sales_price_lists_rows', 'id', 'company_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_price_lists_rows');

        $this->deleteTrigger('sales_price_lists_rows');
    }
};
