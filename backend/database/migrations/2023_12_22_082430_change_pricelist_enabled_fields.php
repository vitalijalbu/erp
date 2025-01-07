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
        Schema::table('sale_discount_matrices', function (Blueprint $table) {
            $table->dropColumn('enabled');
            $table->boolean('is_disabled')->default(false);
        });

        Schema::table('sale_discount_matrix_rows', function (Blueprint $table) {
            $table->dropColumn('enabled');
            $table->boolean('is_disabled')->default(false);
        });

        Schema::table('sale_total_discount_matrices', function (Blueprint $table) {
            $table->dropColumn('enabled');
            $table->boolean('is_disabled')->default(false);
        });

        Schema::table('sale_total_discount_matrix_rows', function (Blueprint $table) {
            $table->dropColumn('enabled');
            $table->boolean('is_disabled')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
