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
            $table->text('sale_note')->nullable();
            $table->text('billing_note')->nullable();
            $table->text('production_note')->nullable();
            $table->text('shipping_note')->nullable();
            $table->text('packaging_note')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_rows', function (Blueprint $table) {
            //
        });
    }
};
