<?php

use App\Models\OrderType;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('order_types', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->string('label', 255);
        });

        OrderType::insert([
            ['id' => 'standard', 'label' => 'standard'],
            ['id' => 'purchase_for_resale', 'label' => 'purchase for resale'],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_types');
    }
};
