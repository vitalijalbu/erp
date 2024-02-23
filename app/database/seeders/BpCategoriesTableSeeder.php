<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BpCategoriesTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        DB::table('bp_categories')->delete();
        
        DB::table('bp_categories')->insert(array (
            0 => 
            array (
                'id' => 'B',
                'description' => 'BRANCH',
            ),
            1 => 
            array (
                'id' => 'D',
                'description' => 'DISTRIBUTOR / RESELLER',
            ),
            2 => 
            array (
                'id' => 'M',
                'description' => 'OEM',
            ),
            3 => 
            array (
                'id' => 'U',
                'description' => 'ENDUSER',
            ),
        ));
        
        
    }
}