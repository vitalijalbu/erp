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
            $table->string('purchase_address_id', 100)->nullable();
            $table->string('purchase_contact_id', 100)->nullable();

            DB::statement("ALTER TABLE bp ADD purchase_currency_id VARCHAR (3)");
            $table->string('purchase_payment_term_id', 100)->nullable();
            $table->string('purchase_payment_method_id', 100)->nullable();
            $table->string('purchase_document_language_id', 100)->nullable();


            $table->foreign('purchase_address_id')->references('id')->on('addresses');
            $table->foreign('purchase_contact_id')->references('id')->on('contacts');
            $table->foreign('purchase_payment_term_id')->references('code')->on('payment_terms');
            $table->foreign('purchase_payment_method_id')->references('code')->on('payment_methods');
            $table->foreign('purchase_currency_id')->references('id')->on('currencies');
            $table->foreign('purchase_document_language_id')->references('id')->on('document_languages');
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
