<?php

use App\Models\DeliveryTerm;
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
        Schema::create('delivery_terms', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->string('label', 255);
        });

        DeliveryTerm::insert([
            ['id' => 'term1', 'label' => 'term 1'],
            ['id' => 'term2', 'label' => 'term 2'],
            ['id' => 'term3', 'label' => 'term 3'],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_terms');
    }
};
