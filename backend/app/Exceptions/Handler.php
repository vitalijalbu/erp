<?php

namespace App\Exceptions;

use App\Pricing\Exception\PricingException;
use Throwable;
use Illuminate\Validation\ValidationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $exception)
    {
        if ($exception instanceof QueryException) { //delete constraint error 
            if($exception?->getPrevious()?->errorInfo && ($exception->getPrevious()->errorInfo[1] ?? null) == 547) {
                if ($request->expectsJson()) {
                    $data = [
                        'message' => 'The item cannot be deleted as it is currently in use'
                    ];
                    if(config('app.debug')){
                        $data['trace'] = $exception->getTrace();
                    }
                    return response()->json($data, 400);
                }
            }
        }
        if ($exception instanceof ModelNotFoundException) {
            if ($request->expectsJson()) {
                $data = [
                    'message' => 'The requested entity has not been found in table '.((new ($exception->getModel()))->getTable())
                ];
                if(config('app.debug')){
                    $data['trace'] = $exception->getTrace();
                }
                return response()->json($data, 404);
            }
        }
        if ($exception instanceof PricingException) {
            if ($request->expectsJson()) {
                $data = [
                    'message' => $exception->getMessage()
                ];
                if(config('app.debug')){
                    $data['trace'] = $exception->getTrace();
                }
                return response()->json($data, 400);
            }
        }

        return parent::render($request, $exception);
    }
}
