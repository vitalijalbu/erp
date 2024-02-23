<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsersTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        DB::table('users')->delete();
        
        DB::table('users')->insert(array (
            array (
                'IDcompany' => '845',
                'username' => 'a.ilici',
                'language' => 'it',
                'IDwarehouseUserDef' => NULL,
                'clientTimezoneDB' => 'Europe/Rome',
                'decimal_symb' => ',',
                'list_separator' => ';',
            ),
            array (
                'IDcompany' => '845',
                'username' => 't.schiavello',
                'language' => 'it',
                'IDwarehouseUserDef' => NULL,
                'clientTimezoneDB' => 'Europe/Rome',
                'decimal_symb' => ',',
                'list_separator' => ';',
            ),
            array (
                'IDcompany' => '845',
                'username' => 'boggiani',
                'language' => 'it',
                'IDwarehouseUserDef' => NULL,
                'clientTimezoneDB' => 'Europe/Rome',
                'decimal_symb' => ',',
                'list_separator' => ';',
            ),
            array (
                'IDcompany' => '845',
                'username' => 'buffon',
                'language' => 'it',
                'IDwarehouseUserDef' => NULL,
                'clientTimezoneDB' => 'Europe/Rome',
                'decimal_symb' => ',',
                'list_separator' => ';',
            ),
            array (
                'IDcompany' => '845',
                'username' => 'desimoni',
                'language' => 'it',
                'IDwarehouseUserDef' => NULL,
                'clientTimezoneDB' => 'Europe/Rome',
                'decimal_symb' => ',',
                'list_separator' => ';',
            ),
            array (
                'IDcompany' => '845',
                'username' => 's.esposito',
                'language' => 'it',
                'IDwarehouseUserDef' => NULL,
                'clientTimezoneDB' => 'Europe/Rome',
                'decimal_symb' => ',',
                'list_separator' => ';',
            ),
        ));
        
        
    }
}