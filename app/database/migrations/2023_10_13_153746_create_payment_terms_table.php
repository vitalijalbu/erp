<?php

use App\Models\PaymentTerm;
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
        Schema::create('payment_terms', function (Blueprint $table) {
            // code, label, period, month_end, number_of_installments, is_free
            $table->string('code', 100)->primary();
            $table->string('label', 255);
            $table->integer('period')->nullable();
            $table->boolean('month_end')->default(0);
            $table->integer('number_of_installments')->nullable();
            $table->boolean('is_free')->default(0);
        });

        PaymentTerm::insert([
            ['code' => '30_days_invoice_date', 'label' => '30 days invoice date'],
            ['code' => '60_days_invoice_date', 'label' => '60 days invoice date'],
            ['code' => '120_days_invoice_date', 'label' => '120 days invoice date'],
            ['code' => 'immediate_payment', 'label' => 'immediate payment'],
            ['code' => 'prepayment', 'label' => 'prepayment'],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_terms');
    }
};
