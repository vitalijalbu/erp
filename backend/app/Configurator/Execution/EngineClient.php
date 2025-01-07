<?php

namespace App\Configurator\Execution;

use App\Configurator\Debug\DevTools;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EngineClient implements EngineClientInterface
{
    protected $host = null;
    protected $retry = null;
    protected $retryWait = null;

    public function __construct($host, $retry, $retryWait)
    {
        $this->host = $host;
        $this->retry = $retry;
        $this->retryWait = $retryWait;
    }


    public function execute(Plan $plan, array $context, array $options = []) {
        $options = $options + [
            'debug' => true
        ];
        
        $response = Http::retry($this->retry, $this->retryWait, throw: false)
            ->post('http://' . $this->host .'/execute', [
                'context' => $context,
                'plan' => $plan->toRequestData(),
                'debug' => $options['debug']
            ]);

        Log::channel('configurator')->debug("Status: ". $response->status());
        Log::channel('configurator')->debug($response->json());

        if(isset($response->json()['debug'])) {
            DevTools::emitFullDebug($response->status(), $response->json()['debug']);
        }

        return [
            'status' => $response->ok(),
            'data' => $response->json()
        ];
    }

    public function callFunction(string $function, array $args = [], array $context = [], array $options = []) {
        $options = $options + [
            'debug' => true
        ];
        
        $response = Http::retry($this->retry, $this->retryWait, throw: false)
            ->post('http://' . $this->host .'/functions/call', [
                'id' => $function,
                'args' => $args,
                'debug' => $options['debug'],
                'context' => $context
            ]);
        
        Log::channel('configurator')->debug("Status: ". $response->status());
        Log::channel('configurator')->debug($response->json());

        if(isset($response->json()['debug'])) {
            DevTools::emitFullDebug($response->status(), $response->json()['debug']);
        }

        return [
            'status' => $response->ok(),
            'data' => $response->json()
        ];
    }


    
}