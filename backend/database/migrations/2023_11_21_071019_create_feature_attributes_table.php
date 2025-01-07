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
        Schema::create('feature_attributes', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->string('name', 100);
            $table->string('group', 100)->nullable();
            $table->boolean('multiple')->default(false);
            $table->integer('order')->default(0)->nullable();
        });


        Schema::table('feature_standard_product', function (Blueprint $table) {
            $table->string('feature_attribute_id', 100)->nullable();
            $table->foreign('feature_attribute_id')->references('id')->on('feature_attributes');
        });

        Schema::table('item', function (Blueprint $table) {
            $table->boolean('configurator_only')->default(false);
        });

        FeatureAttribute::insert([
            [
                'id' => 'main_product',
                'name' => 'Main Product',
                'order' => 0,
                'group' => null
            ],
            [
                'id' => 'lot',
                'name' => 'Lot',
                'order' => 10,
                'group' => null
            ],
            [
                'id' => 'LU',
                'name' => 'Length',
                'order' => 20,
                'group' => 'dimensions'
            ],
            [
                'id' => 'LA',
                'name' => 'Width',
                'order' => 30,
                'group' => 'dimensions'
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('feature_standard_product', function (Blueprint $table) {
            $table->dropForeign(['feature_attribute_id']);
        });

        Schema::table('feature_standard_product', function (Blueprint $table) {
            $table->dropColumn('feature_attribute_id');
        });

        Schema::dropIfExists('feature_attributes');

        Schema::table('item', function (Blueprint $table) {
            $table->dropColumn('configurator_only');
        });

    }
};
