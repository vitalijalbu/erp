<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        DB::table('roles')->delete();
        
        DB::table('roles')->insert(array (
            0 => 
            array (
                'name' => 'admin',
                'guard_name' => 'web',
                'created_at' => '2023-04-11 09:17:09.427',
                'updated_at' => '2023-04-11 09:17:09.427',
                'system' => '1',
                'label' => 'Administrator',
            )
        ));
        
        
    }
}