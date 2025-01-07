<?php

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
        
        Schema::table('machine_process', function (Blueprint $table) {
            $table->dropForeign(['machine_id']);
        });

        Schema::table('machines', function (Blueprint $table) {
            $table->dropPrimary(['code']);
            $table->string('id', 100)->nullable();
        });

        DB::update('update machines set id=code');

        Schema::table('machines', function (Blueprint $table) {
            $table->string('id', 100)->nullable(false)->primary()->change();
        });

        Schema::table('machine_process', function (Blueprint $table) {
            $table->foreign('machine_id')->references('id')->on('machines');
        });

        $this->createTrigger('machines', 'id', 'company_id');
        

        Schema::table('machines', function (Blueprint $table) {
            $table->text('description')->nullable();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('machines', function (Blueprint $table) {
            //
        });
    }
};
