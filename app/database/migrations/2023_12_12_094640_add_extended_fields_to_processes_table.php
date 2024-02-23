<?php

use App\Models\Process;
use App\Models\Traits\TriggerMigration;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    use TriggerMigration;

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('processes', function (Blueprint $table) {
            $table->integer('company_id')->nullable();
            $table->string('code')->nullable();
            $table->string('price_item_id', 100)->nullable();
            $table->string('setup_price_item_id', 100)->nullable();
            $table->string('operator_cost_item_id', 100)->nullable();
            $table->integer('execution_time')->nullable();
            $table->integer('setup_time')->nullable();
            $table->integer('men_occupation')->nullable();
            $table->boolean('need_machine')->nullable();
        });

        Process::query()->update([
            'code' => DB::raw('id'),
            'company_id' => 0
        ]);

        Schema::table('processes', function (Blueprint $table) {
            $table->integer('company_id')->nullable(false)->change();
            $table->string('code')->nullable(false)->change();
        });

        Schema::table('processes', function (Blueprint $table) {
            $table->foreign('company_id')->references('IDcompany')->on('company');
            $table->foreign('price_item_id')->references('IDitem')->on('item');
            $table->foreign('setup_price_item_id')->references('IDitem')->on('item');
            $table->foreign('operator_cost_item_id')->references('IDitem')->on('item');
            $table->unique(['code', 'company_id']);
        });

        $this->createTrigger('processes', 'id', 'company_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('processes', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropForeign(['price_item_id']);
            $table->dropForeign(['setup_price_item_id']);
            $table->dropForeign(['operator_cost_item_id']);
            $table->dropUnique(['code', 'company_id']);
        });

        Schema::table('processes', function (Blueprint $table) {
            $table->dropColumn('company_id');
            $table->dropColumn('code');
            $table->dropColumn('price_item_id');
            $table->dropColumn('setup_price_item_id');
            $table->dropColumn('operator_cost_item_id');
            $table->dropColumn('execution_time');
            $table->dropColumn('setup_time');
            $table->dropColumn('men_occupation');
            $table->dropColumn('need_machine');
        });

        $this->deleteTrigger('processes');
    }
};
