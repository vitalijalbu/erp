<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use App\Models\Permission;
use Illuminate\Http\Request;
use App\Models\Role;
use Illuminate\Support\Facades\DB;


class PermissionController extends ApiController
{

    /**
     * @OA\Get(
     *   tags={"Permissions"},
     *   path="/permissions",
     *   summary="Permissions list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *       @OA\Property(
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/PermissionResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        return response()->json(
            Permission::query()->orderBy('label', 'asc')->get()
        );
    }

}
