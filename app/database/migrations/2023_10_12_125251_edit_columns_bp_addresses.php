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
        Schema::table('bp_addresses', function (Blueprint $table) {
            $table->dropColumn('sales_destination');
            $table->dropColumn('shipping_destination');
            $table->dropColumn('invoice_destination');
            $table->dropColumn('sales_origin');
            $table->dropColumn('shipping_origin');
            $table->dropColumn('invoice_origin');
            $table->dropColumn('payment_destination');
            $table->boolean('is_sales')->nullable();
            $table->boolean('is_shipping')->nullable();
            $table->boolean('is_invoice')->nullable();
            $table->boolean('is_purchase')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bp_addresses', function (Blueprint $table) {
            $table->boolean('sales_destination')->nullable();
            $table->boolean('shipping_destination')->nullable();
            $table->boolean('invoice_destination')->nullable();
            $table->boolean('sales_origin')->nullable();
            $table->boolean('shipping_origin')->nullable();
            $table->boolean('invoice_origin')->nullable();
            $table->boolean('payment_destination')->nullable();
            $table->dropColumn('is_sales');
            $table->dropColumn('is_shipping');
            $table->dropColumn('is_invoice');
            $table->dropColumn('is_purchase');
        });
    }
};
