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

        Schema::table('bp', function (Blueprint $table) {
            $table->dropForeign('bp_purchase_currency_id_foreign');
            $table->dropForeign('bp_sales_currency_id_foreign');
        });

        Schema::table('currencies', function (Blueprint $table) {
            $table->dropPrimary('currencies_PK');
        });

        Schema::table('currencies', function (Blueprint $table) {
            $table->string('id', 3)->primary()->change();
        });

        Schema::table('bp', function (Blueprint $table) {
            $table->string('purchase_currency_id', 3)->nullable()->change();
            $table->string('sales_currency_id', 3)->nullable()->change();
            $table->foreign('purchase_currency_id')->references('id')->on('currencies');
            $table->foreign('sales_currency_id')->references('id')->on('currencies');
        });

        Schema::create('sales', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->string('sale_type', 100);
            $table->string('code', 100);
            $table->string('sale_sequence_id', 100);
            $table->string('bp_id', 100);
            $table->integer('company_id');
            $table->string('order_type_id', 100)->nullable();
            $table->date('created_at');
            $table->date('delivery_date')->nullable();
            $table->string('state', 100);
            $table->text('customer_order_ref')->nullable();
            $table->text('order_ref_a')->nullable();
            $table->text('order_ref_b')->nullable();
            $table->text('order_ref_c')->nullable();
            $table->string('destination_address_id', 100)->nullable();
            $table->string('invoice_address_id', 100)->nullable();
            $table->string('payment_term_code', 100)->nullable();
            $table->string('payment_method_code', 100)->nullable();
            $table->string('currency_id', 3);
            $table->string('sales_internal_contact_id', 100)->nullable();
            $table->string('sales_external_contact_id', 100)->nullable();
            $table->string('carrier_id', 100)->nullable();
            $table->string('delivery_term_id', 100)->nullable();
            

            $table->foreign('sale_sequence_id')->references('id')->on('sale_sequences');
            $table->foreign('order_type_id')->references('id')->on('order_types');
            $table->foreign('bp_id')->references('IDbp')->on('bp');
            $table->foreign('company_id')->references('IDcompany')->on('company');
            $table->foreign('destination_address_id')->references('id')->on('addresses');
            $table->foreign('invoice_address_id')->references('id')->on('addresses');
            $table->foreign('payment_term_code')->references('code')->on('payment_terms');
            $table->foreign('payment_method_code')->references('code')->on('payment_methods');
            $table->foreign('currency_id')->references('id')->on('currencies');
            $table->foreign('sales_internal_contact_id')->references('id')->on('contacts');
            $table->foreign('sales_external_contact_id')->references('id')->on('contacts');
            $table->foreign('carrier_id')->references('IDbp')->on('bp');
            $table->foreign('delivery_term_id')->references('id')->on('delivery_terms');

        });


        Schema::create('sale_rows', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->integer('position');
            $table->date('created_at');
            $table->string('item_id', 100);
            $table->string('lot_id', 20)->nullable();
            $table->decimal('quantity', 10, 2);
            $table->date('delivery_date')->nullable();
            $table->string('order_type_id', 100)->nullable();
            $table->string('state', 100);
            $table->text('customer_order_ref')->nullable();
            $table->text('order_ref_a')->nullable();
            $table->text('order_ref_b')->nullable();
            $table->text('order_ref_c')->nullable();
            $table->decimal('price', 10, 4);
            $table->decimal('total_price', 10, 4);
            $table->decimal('discount', 10, 4);
            $table->string('destination_address_id', 100)->nullable();
            $table->string('delivery_term_id', 100)->nullable();
            $table->integer('company_id');
            $table->string('carrier_id', 100)->nullable();
            $table->string('tax_code', 100)->nullable();
            $table->string('sale_id', 100);
            
            
            $table->foreign('item_id')->references('IDitem')->on('item');
            $table->foreign('lot_id')->references('IDlot')->on('lot');
            $table->foreign('order_type_id')->references('id')->on('order_types');
            $table->foreign('destination_address_id')->references('id')->on('addresses');
            $table->foreign('delivery_term_id')->references('id')->on('delivery_terms');
            $table->foreign('carrier_id')->references('IDbp')->on('bp');
            $table->foreign('company_id')->references('IDcompany')->on('company');
            $table->foreign('sale_id')->references('id')->on('sales');

        });

        $this->createTrigger('sales', 'id', 'company_id');
        $this->createTrigger('sale_rows', 'id', 'company_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
        Schema::dropIfExists('sale_rows');
    }
};
