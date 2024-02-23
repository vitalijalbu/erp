<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     *  @OA\Get(
     *   tags={"Users"},
     *   path="/csrf-cookie",
     *   summary="Get CSRF Token. Set the token in X-XSRF-TOKEN header",
     *   @OA\Response(response=200, description="OK. The token is set in the XSRF-TOKEN cookie")
     * )  
     */
    
    public function csrfCookie()
    {
        return app()->call('\Laravel\Sanctum\Http\Controllers\CsrfCookieController@show');
    }
}
