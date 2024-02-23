<?php

use App\Models\ConstraintSubtype;
use App\Models\ConstraintType;
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
        ConstraintType::create([
            'id' => 'routing',
            'label' => 'Routing Constraint',
            'require_subtype' => true
        ]);

        ConstraintSubtype::create([
            'id' => 'routing_activation',
            'label' => 'Activation',
            'constraint_type_id' => 'routing'
        ]);

        ConstraintSubtype::create([
            'id' => 'routing_workload',
            'label' => 'Workload',
            'constraint_type_id' => 'routing'
        ]);

        Schema::create('routing_constraint_standard_product', function (Blueprint $table) {
            $table->id();
            $table->integer('position', false, true);
            $table->string('process_id', 100);
            $table->string('activation_constraint_id', 100);
            $table->string('workload_constraint_id', 100);
            $table->string('standard_product_id', 100);

            $table->foreign('process_id')->references('id')->on('processes');
            $table->foreign('activation_constraint_id')->references('id')->on('constraints');
            $table->foreign('workload_constraint_id')->references('id')->on('constraints');
            $table->foreign('standard_product_id')->references('id')->on('standard_products')
                ->onDelete('cascade')
                ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
       Schema::dropIfExists('routing_constraint_standard_product');
       ConstraintType::where('id', 'routing')->delete();
       ConstraintSubtype::where('constraint_type_id', 'routing')->delete();
    }
};
