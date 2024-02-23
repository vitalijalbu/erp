<?php

use App\Models\PaymentMethod;
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
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->string('code', 100)->primary();
            $table->string('label', 255);
        });

        PaymentMethod::insert([
            ['code' => 'direct_remittance', 'label' => 'direct remittance'],
            ['code' => 'bank_transfer', 'label' => 'bank transfer'],
            ['code' => 'cash_on_delivery', 'label' => 'cash on delivery'],
            ['code' => 'bank_receipt', 'label' => 'bank receipt'],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
