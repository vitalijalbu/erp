<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('adjustments_type', function (Blueprint $table) {
            $table->id('IDadjtype');
            $table->string('desc');
            $table->boolean('inventory');
            $table->integer('ordinamento');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('adjustments_type');
    }
};
