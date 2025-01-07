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
        Schema::table('bp_contact', function (Blueprint $table) {
            $table->boolean('quotation')->default(false);
            $table->boolean('order_confirmation')->default(false);
            $table->boolean('billing')->default(false);
            $table->boolean('delivery_note')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bp_contact', function (Blueprint $table) {
            $table->dropColumn('quotation');
            $table->dropColumn('order_confirmation');
            $table->dropColumn('billing');
            $table->dropColumn('delivery_note');
        });
    }
};
