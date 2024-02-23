<?php

use App\Models\ConstraintSubtype;
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
        ConstraintSubtype::find('routing_workload')->delete();

        Schema::table('routing_constraint_standard_product', function (Blueprint $table) {
            $table->dropForeign(['workload_constraint_id']);
        });

        Schema::table('routing_constraint_standard_product', function (Blueprint $table) {
            $table->dropColumn('workload_constraint_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        ConstraintSubtype::create([
            'id' => 'routing_workload',
            'label' => 'Workload',
            'constraint_type_id' => 'routing'
        ]);

        Schema::table('routing_constraint_standard_product', function (Blueprint $table) {
            $table->string('workload_constraint_id');
            $table->foreign('workload_constraint_id')->references('id')->on('constraints');
        });
    }
};
