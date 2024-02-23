<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CustomFunction;
use App\Models\Constraint;
use Illuminate\Support\Facades\DB;

class RegenerateCode extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:regenerate-code';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Regenerate the code for custom functions and constraints';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $functions = CustomFunction::all();
        foreach($functions as $function) {
            $this->info("Regenerating code for function $function->id");
            $function->generateCode();
        }

        $constraints = Constraint::all();
        foreach($constraints as $constraint) {
            $this->info("Regenerating code for constraint $constraint->id");
            $constraint->generateCode();
        }
    }
}
