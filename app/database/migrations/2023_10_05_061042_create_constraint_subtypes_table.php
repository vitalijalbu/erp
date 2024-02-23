<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('constraint_subtypes', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->string('label', 100);
            $table->string('constraint_type_id', 100);

            $table->foreign('constraint_type_id')->references('id')->on('constraint_types');
        });

        DB::table('constraint_subtypes')->insert([
            ['id' => 'activation', 'label' => 'Activation', 'constraint_type_id' => 'configurator'],
            ['id' => 'validation', 'label' => 'Validation', 'constraint_type_id' => 'configurator'],
            ['id' => 'value', 'label' => 'Value', 'constraint_type_id' => 'configurator'],
            ['id' => 'dataset', 'label' => 'Dataset', 'constraint_type_id' => 'configurator'],
        ]);

        Schema::table('constraint_types', function (Blueprint $table) {
            $table->boolean('require_subtype')->nullable();
        });

        DB::table('constraint_types')
            ->where('id', 'configurator')
            ->update(['require_subtype' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('constraint_subtypes');
    }
};
