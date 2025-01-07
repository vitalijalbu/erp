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
        Schema::table('sale_row_price_components', function (Blueprint $table) {
            $table->decimal('cost', 16, 4, true)->default(0);
            $table->decimal('total_cost', 16, 4, true)->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_row_price_components', function (Blueprint $table) {
            $table->dropColumn('cost');
            $table->dropColumn('total_cost');
        });
    }
};
