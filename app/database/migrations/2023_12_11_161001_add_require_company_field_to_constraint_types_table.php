<?php

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
        Schema::table('constraint_types', function (Blueprint $table) {
            $table->boolean('require_company')->default(false);
        });

        Schema::table('constraints', function (Blueprint $table) {
            $table->integer('company_id')->nullable();
            $table->foreign('company_id')->references('IDcompany')->on('company');
        });

        $bomConstraint = ConstraintType::find('bom');
        $bomConstraint->require_company = true;
        $bomConstraint->save();

        /*
        $routingConstraint = ConstraintType::find('routing');
        $routingConstraint->require_company = true;
        $routingConstraint->save();
        */
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('constraint_types', function (Blueprint $table) {
            $table->dropColumn('require_company');
        });

        Schema::table('constraints', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
        });

        Schema::table('constraints', function (Blueprint $table) {
            $table->dropColumn('company_id');
        });
    }
};
