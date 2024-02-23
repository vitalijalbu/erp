<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ConstraintTypesTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        DB::table('constraint_types')->delete();
        
        DB::table('constraint_types')->insert(array (
            0 => 
            array (
                'id' => 'configurator',
                'label' => 'Product Configuration Constraint',
            ),
        ));
        
        
    }
}