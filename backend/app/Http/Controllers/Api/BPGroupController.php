<?php

namespace App\Http\Controllers\Api;

use App\Models\BPGroup;
use Illuminate\Http\Request;
use App\DataTables\BPGroupDataTable;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUpdateBPGroupRequest;

class BPGroupController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(BPGroup::class, 'bpGroup');
    }
    /**
     * @OA\Get(
     *   tags={"BP Groups"},
     *   path="/bp-groups",
     *   summary="Get list of bp groups",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/BPGroupResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new BPGroupDataTable(
            BPGroup::query()
                ->where('company_id', auth()->user()->IDcompany)
        );

        return $datatable->toJson();
    }

    /**
     * @OA\Post(
     *   tags={"BP Groups"},
     *   path="/bp-groups",
     *   summary="Create new bp group",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "name"
     *       },
     *       @OA\Property(property="name", type="string"),
     *       example={
     *          "name" : "Exclusive",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/BPGroupResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function store(StoreUpdateBPGroupRequest $request)
    {
        $bpGroup = new BPGroup();
        $bpGroup->name = $request->name;
        $bpGroup->company_id = auth()->user()->IDcompany;

        if(!$bpGroup->save()){
            abort(500);
        }

        return $this->show($bpGroup);
    }

     /**
     * @OA\Get(
     *   tags={"BP Groups"},
     *   path="/bp-groups/{id}",
     *   summary="Get details of bp group",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/BPGroupResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(BPGroup $bpGroup)
    {
        return response()->json($bpGroup);
    }

     /**
     * @OA\Put(
     *   tags={"BP Groups"},
     *   path="/bp-groups/{id}",
     *   summary="Update bp group",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "name"
     *       },
     *       @OA\Property(property="name", type="string"),
     *       example={
     *          "name" : "Exclusive",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/BPGroupResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function update(StoreUpdateBPGroupRequest $request, BPGroup $bpGroup)
    {
        $bpGroup->name = $request->name;

        if(!$bpGroup->save()){
            abort(500);
        }

        return $this->show($bpGroup);
    }

     /**
     * @OA\Delete(
     *   tags={"BP Groups"},
     *   path="/bp-groups/{id}",
     *   summary="Delete bp group",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/BPGroupResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function destroy(BPGroup $bpGroup)
    {
        if(!$bpGroup->delete()){
            abort(500);
        }
    }
}
