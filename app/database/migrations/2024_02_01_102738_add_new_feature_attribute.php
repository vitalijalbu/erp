<?php

use App\Models\FeatureAttribute;
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
            $table->text('production_description')->nullable();
        });

        Schema::table('standard_products', function (Blueprint $table) {
            $table->string('production_description_constraint_id', 100)->nullable();
            $table->foreign('production_description_constraint_id')->references('id')->on('constraints');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('standard_products', function (Blueprint $table) {
            $table->dropForeign(['production_description_constraint_id']);
        });
        
        Schema::table('standard_products', function (Blueprint $table) {
            $table->dropColumn('production_description_constraint_id');
        });

        Schema::table('item', function (Blueprint $table) {
            $table->dropColumn('production_description');
        });
    }
};
