<?php

namespace App\Console\Commands;

use App\Models\Company;
use App\Models\Currency;
use App\Models\ExchangeRate;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ExchangeRates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:exchange-rates {company_id : Company ID} {date : date in format YYYY-mm-dd}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Download the exchange rates for a given company and date';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if(!$this->argument('company_id') || !($company = Company::find($this->argument('company_id')))) {
            $this->error('Invalid company');
            exit(1);
        }
        if(!$this->argument('date') || !preg_match('/\A\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])\z/i', $this->argument('date'))) {
            $this->error('Invalid date');
            exit(1);
        }

        $response = Http::withHeaders([
            'Accept' => 'application/json',
        ])->get('https://tassidicambio.bancaditalia.it/terzevalute-wf-web/rest/v1.0/dailyRates', [
            'lang' => 'en',
            'currencyIsoCode' => $company->curr,
            'referenceDate' => $this->argument('date')
        ]);
        
        if($response->ok()) {
            $validCurrencies = Currency::all()->pluck('id')->all();
            $updates = [];
            $rates = $response->json()['rates'] ?? [];
            foreach($rates as $rate) {
                if(in_array($rate['isoCode'], $validCurrencies) && $rate['avgRate'] != null && $rate['avgRate'] != 'N.A.') {
                    $updates[] = [
                        'company_id' => $company->IDcompany,
                        'company_currency_id' => $company->curr,
                        'foreign_currency_id' => $rate['isoCode'],
                        'rate' => round(strtolower($rate['exchangeConventionCode']) == 'c' ? $rate['avgRate'] : (1/$rate['avgRate']), 4),
                        'date' => $this->argument('date')
                    ];
                }
            }
            DB::transaction(function() use ($updates, $company) {
                ExchangeRate::where('company_id', $company->IDcompany)
                    ->where('company_currency_id', $company->curr)
                    ->where('date', $this->argument('date'))
                    ->delete();

                ExchangeRate::insert($updates);
            });
        }
    }
}
