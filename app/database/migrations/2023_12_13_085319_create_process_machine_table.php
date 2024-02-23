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
        Schema::table('machines', function (Blueprint $table) {
            $table->dropPrimary(['code']);
        });

        Schema::table('machines', function (Blueprint $table) {
            $table->string('code', 100)->change();
            $table->primary('code');
        });

        Schema::create('machine_process', function (Blueprint $table) {
            $table->string('process_id', 100);
            $table->string('machine_id', 100);
            $table->boolean('workcenter_default');
            
            $table->primary(['process_id', 'machine_id']);
            $table->foreign('process_id')->references('id')->on('processes')->onUpdate('cascade')->onDelete('cascade');
            $table->foreign('machine_id')->references('code')->on('machines');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('machine_process');
    }
};
