<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\Request;
use App\Models\Role;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreRoleRequest;


class RoleController extends ApiController
{

    public function __construct()
    {
        $this->authorizeResource(Role::class, 'role');
    }

    /**
     * @OA\Get(
     *   tags={"Roles"},
     *   path="/roles",
     *   summary="Roles list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/RoleResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new \App\DataTables\RolesDataTable(
            Role::query()
        );
        return $datatable->toJson();
    }

    /**
     * @OA\Post(
     *   tags={"Roles"},
     *   path="/roles",
     *   summary="Create new Role",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "name", "label", "permissions"
     *       },
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="label", type="string"),
     *       @OA\Property(property="permissions", type="array"),
     *       example={
     *          "name": "user",
     *          "label": "Utente",
     *          "permissions": "[1]"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/RoleResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function store(StoreRoleRequest $request)
    {
        $role = new Role();
        $role->fill($request->all());
        $saved = DB::transaction(function() use ($role, $request) {
            if(!$role->save()) {
                return false;
            }
            $role->permissions()->sync($request->input('permissions', []));
            return true;
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Get(
     *   tags={"Roles"},
     *   path="/roles/{id}",
     *   summary="Role show",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/RoleResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function show(Role $role)
    {
        $role->loadMissing('permissions');
        return response()->json($role);
    }

    /**
     * @OA\Put(
     *   tags={"Roles"},
     *   path="/roles/{id}",
     *   summary="Edit Role",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "name", "label", "permissions"
     *       },
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="label", type="string"),
     *       @OA\Property(property="permissions", type="array"),
     *       example={
     *          "name": "user",
     *          "label": "Utente",
     *          "permissions": "[1]"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/RoleResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function update(StoreRoleRequest $request, Role $role)
    {
        $role->fill($request->all());
        $saved = DB::transaction(function() use ($role, $request) {
            if(!$role->save()) {
                return false;
            }
            if($request->has('permissions')) {
                $role->syncPermissions($request->input('permissions', []));
            }
            return true;
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Delete(
     *   tags={"Roles"},
     *   path="/roles/{id}",
     *   summary="Delete role",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/Role")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function destroy(Role $role)
    {
        $deleted = DB::transaction(function() use ($role) {
            $role->permissions()->detach();
            return $role->delete();
        });

        if(!$deleted) {
            abort(500);
        }
    }
}
