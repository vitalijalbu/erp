<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Traits\TriggerMigration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('processes', function (Blueprint $table) {
            $table->dropPrimary('processes_id_primary');
        });
        Schema::table('processes', function (Blueprint $table) {
            $table->string('id', 100)->primary()->change();
        });

        Schema::create('item_materials', function (Blueprint $table) {
            $table->id();
            $table->integer('position', false, true);
            $table->string('item_id', 100);
            $table->decimal('quantity', 10, 4, true);
            $table->string('process_id', 100);
            $table->string('configured_item_id', 100);

            $table->foreign('item_id')->references('IDitem')->on('item');
            $table->foreign('process_id')->references('id')->on('processes');
            $table->foreign('configured_item_id')->references('IDitem')->on('item')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_materials');
    }
};
