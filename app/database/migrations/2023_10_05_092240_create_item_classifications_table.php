<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('item_classifications', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->string('label', 100);
            $table->integer('level');
            $table->boolean('allow_owner')->nullable();
            $table->boolean('require_level_2')->nullable();
        });

        Schema::create('item_classifications_pivot', function (Blueprint $table) {
            $table->string('level_1_item_classification_id', 100);
            $table->string('level_2_item_classification_id', 100);
            $table->primary(['level_1_item_classification_id', 'level_2_item_classification_id']);

            $table->foreign('level_1_item_classification_id')->references('id')->on('item_classifications');
            $table->foreign('level_2_item_classification_id')->references('id')->on('item_classifications');
        });

        DB::table('item_classifications')->insert([
            ['id' => 'standard', 'label' => 'STANDARD', 'level' => 1, 'require_level_2' => true],
            ['id' => 'not_standard', 'label' => 'NOT STANDARD', 'level' => 1, 'require_level_2' => true],
            ['id' => 'dp', 'label' => 'DP', 'level' => 1, 'require_level_2' => true],
            ['id' => 'not_applicable', 'label' => 'Not Applicable', 'level' => 1, 'require_level_2' => true],
        ]);

        DB::table('item_classifications')->insert([
            ['id' => 'special', 'label' => 'SPECIAL', 'level' => 2, 'allow_owner' => true],
            ['id' => 'tailor_made', 'label' => 'TAILOR MADE', 'level' => 2, 'allow_owner' => true],
            ['id' => 'restricted', 'label' => 'RESTRICTED', 'level' => 2, 'allow_owner' => true],
            ['id' => 'exclusive', 'label' => 'EXCLUSIVE', 'level' => 2, 'allow_owner' => true],
            ['id' => 'not_applicable_l2', 'label' => 'Not Applicable', 'level' => 2, 'allow_owner' => false],
        ]);

        DB::table('item_classifications_pivot')->insert([
            ['level_1_item_classification_id' => 'standard', 'level_2_item_classification_id' => 'not_applicable_l2'],
            ['level_1_item_classification_id' => 'not_standard', 'level_2_item_classification_id' => 'special'],
            ['level_1_item_classification_id' => 'not_standard', 'level_2_item_classification_id' => 'tailor_made'],
            ['level_1_item_classification_id' => 'not_standard', 'level_2_item_classification_id' => 'restricted'],
            ['level_1_item_classification_id' => 'not_standard', 'level_2_item_classification_id' => 'exclusive'],
            ['level_1_item_classification_id' => 'dp', 'level_2_item_classification_id' => 'special'],
            ['level_1_item_classification_id' => 'dp', 'level_2_item_classification_id' => 'tailor_made'],
            ['level_1_item_classification_id' => 'dp', 'level_2_item_classification_id' => 'restricted'],
            ['level_1_item_classification_id' => 'dp', 'level_2_item_classification_id' => 'exclusive'],
            ['level_1_item_classification_id' => 'dp', 'level_2_item_classification_id' => 'not_applicable_l2'],
            ['level_1_item_classification_id' => 'not_applicable', 'level_2_item_classification_id' => 'not_applicable_l2'],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_classifications');
    }
};
