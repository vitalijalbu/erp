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
        Schema::table('item', function (Blueprint $table) {
            $table->string('item_subgroup', 100)->nullable();
            $table->string('weight_um', 100)->nullable();
            $table->decimal('weight', 10, 2, true)->nullable();
            $table->string('base_item_id', 100)->nullable();
            $table->string('product_line', 100)->nullable();
            $table->string('customs_code', 100)->nullable();
            $table->string('std_joint', 100)->nullable();
            $table->string('std_joint_guides', 100)->nullable();
            $table->string('number_of_plies', 100)->nullable();
            $table->string('classification_l1', 100)->nullable();
            $table->string('classification_l2', 100)->nullable();
            $table->string('owner', 100)->nullable();
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
