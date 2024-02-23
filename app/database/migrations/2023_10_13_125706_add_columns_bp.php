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
            $table->string('sales_address_id', 100)->nullable();
            $table->string('sales_contact_id', 100)->nullable();
            $table->boolean('sales_has_chiorino_stamp')->nullable();
            $table->string('shipping_address_id', 100)->nullable();
            $table->string('shipping_contact_id', 100)->nullable();
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
