<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Database\AvoidSqlServerError\SqlServerErrAvoidConnector;

class SqlsrvErrAvoidServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(
            'db.connector.sqlsrv',
            SqlServerErrAvoidConnector::class,
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
