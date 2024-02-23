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
        Schema::table('bp', function (Blueprint $table) {
            $table->dropForeign('bp_FK_11');
            $table->dropForeign('bp_FK_17');
            $table->dropForeign('bp_FK_10');
            $table->dropForeign('bp_FK_18');
            $table->dropForeign('bp_FK_19');
            $table->dropForeign('bp_FK_20');
            $table->dropForeign('bp_FK_21');
            $table->dropForeign('bp_FK_22');
            $table->dropForeign('bp_FK_23');
            $table->dropForeign('bp_FK_24');
            $table->dropForeign('bp_FK_25');
            $table->dropForeign('bp_FK_3');
            $table->dropForeign('bp_FK_4');
            $table->dropForeign('bp_FK_5');
            $table->dropForeign('bp_FK_6');
            $table->dropForeign('bp_FK_7');
            $table->dropForeign('bp_FK_8');
            $table->dropForeign('bp_FK_9');

            $table->dropColumn([
                'is_sales_destination',
                'is_shipping_destination',
                'is_invoice_destination',
                'is_sales_origin',
                'is_shipping_origin',
                'is_invoice_origin',
                'is_payment_destination',
                'sales_destination_address_id',
                'sales_destination_contact_id',
                'sales_destination_int_contact_id',
                'sales_destination_ext_contact_id',
                'sales_destination_terms_of_delivery',
                'sales_destination_has_chiorino_stamp',
                'shipping_destination_address_id',
                'shipping_destination_contact_id',
                'shipping_destination_carrier_bp_id',
                'invoice_destination_address_id',
                'invoice_destination_contact_id',
                'payment_destination_address_id',
                'payment_destination_contact_id',
                'sales_origin_address_id',
                'sales_origin_contact_id',
                'sales_origin_pm_contact_id',
                'shipping_origin_address_id',
                'shipping_origin_contact_id',
                'shipping_origin_carrier_bp_id',
                'shipping_origin_has_inspection',
                'invoice_origin_address_id',
                'invoice_origin_contact_id',
            ]);

            $table->boolean('is_sales')->nullable();
            $table->boolean('is_shipping')->nullable();
            $table->boolean('is_invoice')->nullable();
            $table->boolean('is_purchase')->nullable();
            $table->boolean('is_blocked')->nullable();
            $table->boolean('is_carrier')->nullable();
            
            $table->string('sales_internal_contact_id', 100)->nullable();
            $table->string('sales_external_contact_id', 100)->nullable();
            $table->string('sales_document_language_id', 100)->nullable();

            DB::statement("ALTER TABLE bp ADD sales_currency_id VARCHAR (3)");
           
            $table->string('shipping_carrier_id', 100)->nullable();
            $table->string('shipping_document_language_id', 100)->nullable();           
            
            $table->foreign('sales_currency_id')->references('id')->on('currencies');
            $table->foreign('sales_internal_contact_id')->references('id')->on('contacts');
            $table->foreign('sales_external_contact_id')->references('id')->on('contacts');
            $table->foreign('shipping_carrier_id')->references('IDbp')->on('bp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        
    }
};
