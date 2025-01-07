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
        Schema::table('item', function (Blueprint $table) {
            $table->text('long_description')->nullable();
        });

        Schema::table('standard_products', function (Blueprint $table) {
            $table->string('long_description_constraint_id', 100)->nullable();
            $table->foreign('long_description_constraint_id')->references('id')->on('constraints');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

        Schema::table('standard_products', function (Blueprint $table) {
            $table->dropForeign(['long_description_constraint_id']);
        });
        
        Schema::table('standard_products', function (Blueprint $table) {
            $table->dropColumn('long_description_constraint_id');
        });

        Schema::table('item', function (Blueprint $table) {
            $table->dropColumn('long_description');
        });

    }
};
