<?php

use App\Models\WeightUm;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('weights_um', function (Blueprint $table) {
            $table->string('id', 100)->unique()->primary();
            $table->string('label', 255);
        });

        WeightUm::insert([
            ['id' => 'g', 'label' => 'grams'],
            ['id' => 'hg', 'label' => 'hectograms'],
            ['id' => 'kg', 'label' => 'kilograms'],
            ['id' => 'q', 'label' => 'quintals'],
            ['id' => 't', 'label' => 'tons'],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weights_um');
    }
};
