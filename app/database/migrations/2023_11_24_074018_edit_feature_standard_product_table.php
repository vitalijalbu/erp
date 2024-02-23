<?php

use App\Models\ProductConfigurationFeature;
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
        ProductConfigurationFeature::where('main_product', true)->update(['feature_attribute_id' => 'main_product']);

        Schema::table('feature_standard_product', function (Blueprint $table) {
            $table->dropColumn('main_product');
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
