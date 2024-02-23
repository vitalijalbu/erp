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
        Schema::table('bp', function (Blueprint $table) {
            $table->string('group_id', 100)->nullable();

            $table->foreign('group_id')->references('id')->on('bp_groups');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bp', function (Blueprint $table) {
            //
        });
    }
};
