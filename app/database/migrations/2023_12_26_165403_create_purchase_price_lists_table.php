<?php

use Illuminate\Support\Facades\Schema;
use App\Models\Traits\TriggerMigration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    use TriggerMigration;
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('purchase_price_lists', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->string('code', 255);
            $table->integer('company_id');
            $table->string('currency_id', 3);
            $table->string('bp_id', 100)->nullable();
            $table->boolean('is_disabled')->default(false);

            $table->foreign('company_id')->references('IDcompany')->on('company');
            $table->foreign('currency_id')->references('id')->on('currencies');
            $table->foreign('bp_id')->references('IDbp')->on('bp');
        });

        $this->createTrigger('purchase_price_lists', 'id', 'company_id');

        Schema::create('purchase_price_lists_rows', function (Blueprint $table) {
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
            $table->string('purchase_price_list_id', 100);
            $table->boolean('is_disabled')->default(false);

            $table->foreign('company_id')->references('IDcompany')->on('company');
            $table->foreign('item_id')->references('IDitem')->on('item');
            $table->foreign('item_group_id')->references('id')->on('item_group');
            $table->foreign('item_subfamily_id')->references('id')->on('items_subfamilies');
            $table->foreign('purchase_price_list_id')->references('id')->on('purchase_price_lists');
        });

        $this->createTrigger('purchase_price_lists_rows', 'id', 'company_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_price_lists');

        $this->deleteTrigger('purchase_price_lists');

        $this->deleteTrigger('purchase_price_lists_rows');
    }
};
