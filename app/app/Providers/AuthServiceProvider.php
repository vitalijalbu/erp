<?php

namespace App\Providers;

use App\Models\User;
use App\Policies\PrintPolicy;
use App\Policies\ReportPolicy;
use App\Models\CuttingOrderRow;
use App\Policies\ReceiptPolicy;
use App\Models\MaterialIssueTemp;
use App\Auth\MixedLdapUserProvider;
use App\Models\MaterialTransferTemp;
use App\Policies\CuttingOrderPolicy;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use App\Models\OrderMergeRowsPicking;
use App\Policies\MaterialIssuePolicy;
use App\Policies\OrderLotMergePolicy;
use App\Policies\OrderProductionPolicy;
use App\Models\OrderProductionComponent;
use App\Models\OrderSplitRow;
use App\Policies\MaterialTransferPolicy;
use App\Policies\OrderSplitPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
        'report' => ReportPolicy::class,
        MaterialTransferTemp::class => MaterialTransferPolicy::class,
        MaterialIssueTemp::class => MaterialIssuePolicy::class,
        'print' => PrintPolicy::class,
        'receipt' => ReceiptPolicy::class,
        OrderMergeRowsPicking::class => OrderLotMergePolicy::class,
        OrderProductionComponent::class => OrderProductionPolicy::class,
        // CuttingOrderRow::class => CuttingOrderPolicy::class,
        OrderSplitRow::class => OrderSplitPolicy::class
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        Auth::provider('ldap', function ($app, array $config) {
            return $this->app->makeWith(MixedLdapUserProvider::class, ['model' => $config['model']]);
        });

        // Gate::before(function (User $user) {
        //     return $user->getRoleNames()->contains('admin');
        // });
    }
}
