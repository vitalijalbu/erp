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
            $table->string('invoice_address_id', 100)->nullable();
            $table->string('invoice_contact_id', 100)->nullable();
            $table->string('invoice_payment_term_id', 100)->nullable();
            $table->string('invoice_payment_method_id', 100)->nullable();
            $table->string('invoice_shipping_method_id', 100)->nullable();
            $table->string('invoice_document_language_id', 100)->nullable();


            $table->foreign('invoice_address_id')->references('id')->on('addresses');
            $table->foreign('invoice_contact_id')->references('id')->on('contacts');
            $table->foreign('invoice_payment_term_id')->references('code')->on('payment_terms');
            $table->foreign('invoice_payment_method_id')->references('code')->on('payment_methods');
            $table->foreign('invoice_shipping_method_id')->references('code')->on('invoice_shipping_methods');
            $table->foreign('invoice_document_language_id')->references('id')->on('document_languages');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
