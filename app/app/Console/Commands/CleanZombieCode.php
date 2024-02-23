<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;


class CleanZombieCode extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:clean-zombie-code';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete all code that not belongs to a function or a constraint';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $files = Storage::disk('code_repo')->files('/');
        $files = collect($files)
            ->map(function($file, $k) {
                return basename($file, '.php');
            })
            ->chunk(100)
            ->each(function($chunk) {
                $q1 = DB::table('custom_functions')
                    ->select('uuid')
                    ->whereIn('uuid', $chunk);
                
                $q2 = DB::table('constraints')
                    ->select('uuid')
                    ->whereIn('uuid', $chunk)
                    ->union(($q1));

                $found = $q2->get()->pluck('uuid')->toArray();
                $zombie = array_diff($chunk->toArray(), $found);

                foreach($zombie as $file) {
                    $this->info("Deleting file $file");
                    Storage::disk('code_repo')->delete($file . '.php');
                }
                
            });

    }
}
