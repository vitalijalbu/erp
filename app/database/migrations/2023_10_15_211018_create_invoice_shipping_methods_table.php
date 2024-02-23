<?php

use App\Models\InvoiceShippingMethod;
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
        Schema::create('invoice_shipping_methods', function (Blueprint $table) {
            $table->string('code', 100)->primary();
            $table->string('label', 255);
        });

        InvoiceShippingMethod::insert([
            ['code' => 'email', 'label' => 'email'],
            ['code' => 'paper', 'label' => 'paper'],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_shipping_methods');
    }
};
