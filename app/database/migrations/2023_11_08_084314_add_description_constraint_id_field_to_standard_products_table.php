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
        Schema::table('standard_products', function (Blueprint $table) {
            $table->string('description_constraint_id', 100)->nullable();
            $table->foreign('description_constraint_id')->references('id')->on('constraints');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('standard_products', function (Blueprint $table) {
            $table->dropForeign(['description_constraint_id']);
            $table->dropColumn('description_constraint_id');
        });
    }
};
