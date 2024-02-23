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
            $table->string('sales_order_type_id', 100)->nullable();
            $table->foreign('sales_order_type_id')->references('id')->on('order_types');
            $table->foreign('sales_address_id')->references('id')->on('addresses');
            $table->foreign('sales_contact_id')->references('id')->on('contacts');
            $table->foreign('shipping_address_id')->references('id')->on('addresses');
            $table->foreign('shipping_contact_id')->references('id')->on('contacts');
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
