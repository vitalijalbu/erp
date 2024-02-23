<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use FreeDSx\Ldap\LdapClient;
use Illuminate\Contracts\Foundation\Application;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        Sanctum::ignoreMigrations();
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->app->bind(LdapClient::class, function ($app) {
            $config = config('services.ldap');
            $ldap = new LdapClient([
                'servers' => [$config['host']],
            ]);
            return $ldap;
        });

        $this->app->singleton(\Spatie\Activitylog\LogBatch::class, function (Application $app) {
            return new \Spatie\Activitylog\LogBatch();
        });

        $this->app->bind(
            \App\Configurator\Conversion\ConverterInterface::class, 
            \App\Configurator\Conversion\BlocklyConverter::class
        );

        $this->app->bind(
            \App\Configurator\Conversion\CodeRepositoryInterface::class, 
            \App\Configurator\Conversion\CodeRepository::class
        );

        $this->app->bind(
            \App\Configurator\Execution\EngineClientInterface::class, 
            function() {
                return new \App\Configurator\Execution\EngineClient(
                    config('engine.host'),
                    config('engine.retry'),
                    config('engine.retry_wait')
                );
            }
        );

        $this->app->bind(
            \SocketIO\Emitter::class, 
            function() {
                return new \SocketIO\Emitter(app('redis')->connection()->client(), ['key' => 'socket.io']);
            }
        );
    }
}
