<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class LoadNations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:load-nations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Polupate the nations database table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $nationsIds = collect(\PrinsFrank\Standards\Country\CountryAlpha2::cases())->keyBy('name')->toArray();
        $nationsIso3 = collect(\PrinsFrank\Standards\Country\CountryAlpha3::cases())->keyBy('name')->toArray();
        $nationsNames = collect(\PrinsFrank\Standards\Country\CountryName::cases())->keyBy('name')->toArray();
        
        $nations = [];
        
        foreach($nationsIds as $case => $id) {
            $nation = [
                'id' => $id->value,
                'name' => $nationsNames[$case]->value,
                'iso_alpha_3' => $nationsIso3[$case]->value,
            ];

            $nations[] = $nation;
        }

        \App\Models\Nation::upsert($nations, ['id'], ['name', 'iso_alpha_3']);
    }
}
