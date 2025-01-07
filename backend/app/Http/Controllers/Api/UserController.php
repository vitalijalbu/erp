<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Console\Application;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreUserRequest;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\UpdateUserRegionalRequest;
use App\Http\Requests\UpdateUserTimezoneRequest;

class UserController extends ApiController
{

    public function __construct()
    {
        $this->authorizeResource(User::class, 'user');
    }

    /**
     * @OA\Post(
     *   tags={"Users", "index.php"},
     *   path="/login",
     *   summary="Login",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={"username", "password"},
     *       @OA\Property(property="username", type="string"),
     *       @OA\Property(property="password", type="string"),
     *       example={"username": "nome.utente", "password": "password"}
     *     ),
     *   ),
     *   @OA\Response(response=200, description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/User")
     *   ),
     *   @OA\Response(response=401, description="Unauthorized"),
     * )
     */
    public function login(Request $request)
    {
        if (Auth::attempt($request->only(['username', 'password']))) {
            $request->session()->regenerate();

            return response()->json(
                Auth::user()
                    ->makeHidden('permissions')
                    ->append('default_warehouse_location_id')
                    ->append('is_authorized')
                    ->loadMissing('company')
            );
        }
        abort(401);
    }
    
    /**
     * @OA\Post(
     *   tags={"Users", "logout.php"},
     *   path="/logout",
     *   summary="Logout",
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=403, description="Unauthorized"),
     * )
     */
    public function logout(Request $request)
    {
        auth('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }

    /**
     * @OA\Get(
     *   tags={"Users", "index.php"},
     *   path="/user",
     *   summary="Get current user",
     *   @OA\Response(response=200, description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/User")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     * )
     */
    public function user(Request $request)
    {
        Auth::user()->roles->makeHidden('permissions');
        return response()->json(
            Auth::user()
                ->makeHidden('permissions')
                ->append('default_warehouse_location_id')
                ->append('is_authorized')
                ->loadMissing('company')
        );
    }

    /**
     * @OA\Get(
     *   tags={"User"},
     *   path="/users",
     *   summary="Users list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/UserResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new \App\DataTables\UsersDataTable(
            User::query()->select('*')->with(['company', 'warehouse', 'roles'])
        );
        return $datatable->toJson();
    }

    /**
     * @OA\Post(
     *   tags={"Users"},
     *   path="/users",
     *   summary="Create new user",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "IDcompany", "username", "language", "IDwarehouseUserDef", 
     *          "clientTimezoneDB", "decimal_symb", "list_separator", "roles"
     *       },
     *       @OA\Property(property="IDcompany", type="string"),
     *       @OA\Property(property="username", type="string"),
     *       @OA\Property(property="language", type="string"),
     *       @OA\Property(property="IDwarehouseUserDef", type="string"),
     *       @OA\Property(property="clientTimezoneDB", type="string"),
     *       @OA\Property(property="decimal_symb", type="string"),
     *       @OA\Property(property="list_separator", type="string"),
     *       @OA\Property(property="roles", type="array"),
     *       @OA\Property(property="employee_contact_id", type="string"),
     *       example={
     *          "IDcompany": 845,
     *          "username": "utente",
     *          "language": "it", 
     *          "IDwarehouseUserDef": 0,
     *          "clientTimezoneDB": "Europe/Rome",
     *          "decimal_symb": ",",
     *          "list_separator": ";",
     *          "roles": "[1]",
     *          "employee_contact_id": "845-15",
     *          "default_workcenter" : "845-1"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/UserResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function store(StoreUserRequest $request)
    {
        $user = new User();
        $user->fill($request->all());
        $saved = DB::transaction(function() use ($user, $request) {
            if(!$user->save()) {
                return false;
            }
            $user->roles()->sync($request->input('roles', []));
            return true;
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Get(
     *   tags={"Users"},
     *   path="/users/{id}",
     *   summary="User show",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/UserResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function show(User $user)
    {
        $user->loadMissing('roles')
            ->append('last_modification')
            ->append('creation');
        
        return response()->json([
            ...($user->makeHidden('roles')->toArray()),
            'roles' => $user->roles->pluck('id')
        ]);
    }

    /**
     * @OA\Put(
     *   tags={"Users"},
     *   path="/users/{id}",
     *   summary="Update user",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "IDcompany", "username", "language", "IDwarehouseUserDef", 
     *          "clientTimezoneDB", "decimal_symb", "list_separator", "roles"
     *       },
     *       @OA\Property(property="IDcompany", type="string"),
     *       @OA\Property(property="username", type="string"),
     *       @OA\Property(property="language", type="string"),
     *       @OA\Property(property="IDwarehouseUserDef", type="string"),
     *       @OA\Property(property="clientTimezoneDB", type="string"),
     *       @OA\Property(property="decimal_symb", type="string"),
     *       @OA\Property(property="list_separator", type="string"),
     *       @OA\Property(property="roles", type="array"),
     *       @OA\Property(property="employee_contact_id", type="string"),
     *       example={
     *          "IDcompany": 845,
     *          "username": "utente",
     *          "language": "it", 
     *          "IDwarehouseUserDef": 0,
     *          "clientTimezoneDB": "Europe/Rome",
     *          "decimal_symb": ",",
     *          "list_separator": ";",
     *          "roles": "[1]",
     *          "employee_contact_id": "845-15",
     *          "default_workcenter" : "845-1"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/UserResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function update(StoreUserRequest $request, User $user)
    {
        $user->fill($request->all());
        $saved = DB::transaction(function() use ($user, $request) {
            if(!$user->save()) {
                return false;
            }
            if($request->has('roles')) {
                $user->roles()->sync($request->input('roles', []));
            }
            return true;
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Delete(
     *   tags={"Users"},
     *   path="/users/{id}",
     *   summary="Delete user",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/User")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function destroy(User $user)
    {
        $deleted = DB::transaction(function() use ($user) {
            $user->roles()->detach();
            return $user->delete();
        });

        if(!$deleted) {
            abort(500);
        }
    }

    /**
     * @OA\Put(
     *   tags={"User"},
     *   path="/user/timezone",
     *   summary="Update user timezone",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *         "timezone"
     *       },
     *       @OA\Property(property="timezone", type="string"),
     *       example={
     *          "timezone": "Europe/Rome",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/UserResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */

    public function updateTimezone(UpdateUserTimezoneRequest $request)
    {
        $user = auth()->user();
        $user->clientTimezoneDB = $request->timezone;

        if(!$user->save()){
            abort(500);
        }
    }

    /**
     * @OA\Put(
     *   tags={"User"},
     *   path="/user/regional",
     *   summary="Update user regional",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *         "decimalSymb", "listSeparator"
     *       },
     *       @OA\Property(property="decimalSymb", type="string"),
     *       @OA\Property(property="listSeparator", type="string"),
     *       example={
     *          "decimalSymb": ",",
     *          "listSeparator": ";"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/UserResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */

    public function updateRegional(UpdateUserRegionalRequest $request)
    {
        $user = auth()->user();
        $user->decimal_symb = $request->decimalSymb;
        $user->list_separator = $request->listSeparator;

        if(!$user->save()){
            abort(500);
        }
    }
}
