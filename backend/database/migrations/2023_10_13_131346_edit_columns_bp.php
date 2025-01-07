<?php

use App\Models\BP;
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
        Schema::table('bp', function (Blueprint $table) {

            
            $table->boolean('is_sales')->default(0)->change();
            $table->boolean('is_shipping')->default(0)->change();
            $table->boolean('is_invoice')->default(0)->change();
            $table->boolean('is_purchase')->default(0)->change();
            $table->boolean('is_blocked')->default(0)->change();
            $table->boolean('is_carrier')->default(0)->change();
            $table->boolean('is_active')->default(0)->change();
            $table->boolean('sales_has_chiorino_stamp')->default(0)->change();

            BP::whereNull('is_sales')->update(['is_sales' => 0]);
            BP::whereNull('is_shipping')->update(['is_shipping' => 0]);
            BP::whereNull('is_invoice')->update(['is_invoice' => 0]);
            BP::whereNull('is_purchase')->update(['is_purchase' => 0]);
            BP::whereNull('is_blocked')->update(['is_blocked' => 0]);
            BP::whereNull('is_carrier')->update(['is_carrier' => 0]);
            BP::whereNull('is_active')->update(['is_active' => 0]);
            BP::whereNull('sales_has_chiorino_stamp')->update(['sales_has_chiorino_stamp' => 0]);
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
