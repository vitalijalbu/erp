<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(CurrenciesTableSeeder::class);
        $this->call(NationsTableSeeder::class);
        $this->call(NaicsCodesTableSeeder::class);
        $this->call(FeatureTypesTableSeeder::class);
        $this->call(ConstraintTypesTableSeeder::class);
        $this->call(PermissionsTableSeeder::class);
        $this->call(CompanyTableSeeder::class);
        $this->call(RolesTableSeeder::class);
        $this->call(RoleHasPermissionsTableSeeder::class);
        $this->call(UsersTableSeeder::class);
        $this->call(ModelHasRolesTableSeeder::class);
        $this->call(BpCategoriesTableSeeder::class);
    }
}
