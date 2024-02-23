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
        Schema::table('sale_rows', function (Blueprint $table) {
            $table->dropColumn('requested_override_total_discount');
            $table->boolean('override_total_discount_to_approve')->default(false);

            $table->index(['company_id', 'override_total_discount_to_approve', 'sale_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_rows', function (Blueprint $table) {
            $table->dropIndex(['company_id', 'override_total_discount_to_approve', 'sale_id']);
        });

        Schema::table('sale_rows', function (Blueprint $table) {
            $table->decimal('requested_override_total_discount', 16, 4)->nullable();
            $table->dropColumn('override_total_discount_to_approve');
        });
    }
};
