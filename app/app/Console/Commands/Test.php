<?php

namespace App\Console\Commands;

use App\Models\BP;
use App\Models\Company;
use App\Models\Currency;
use App\Models\Item;
use App\Pricing\PriceCalculator;
use App\Services\Configurator\BOM\BOMGenerator;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class Test extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'debug:test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command used for testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        
        $dump = database_path() . DIRECTORY_SEPARATOR . 'schema' . DIRECTORY_SEPARATOR . 'default.sql';
        $dump = file_get_contents($dump);

        $queries = explode('GO', $dump);
        $dbName = DB::connection()->getDatabaseName();

        $bar = $this->output->createProgressBar(count($queries));
        $bar->start();
        $retries = [];
        foreach($queries as $query) {
            $query = trim($query);
            $query = str_replace('test_import', $dbName, $query);
            try {
                DB::statement($query);
            }
            catch(\Illuminate\Database\QueryException $e) {
                $retries[] = $query;
            }
            $bar->advance();
        }
        $bar->finish();

        if(!empty($retries)) {
            $this->info("retries some query");
            $bar = $this->output->createProgressBar(count($retries));
            $bar->start();
            foreach($retries as $query) {
                try {
                    DB::statement($query);
                }
                catch(\Illuminate\Database\QueryException $e) {
                    $this->error("Cannot execute query");
                }
                $bar->advance();
            }
            $bar->finish();
        }
    }
}
