<?php

namespace App\Http\Controllers\Api;

use App\Models\Workcenter;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\DataTables\WorkcenterDataTable;
use App\Http\Requests\StoreUpdateWorkcenterRequest;

class WorkcenterController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Workcenter::class, 'workcenter');
    }
   /**
     * @OA\Get(
     *   tags={"Workcenters"},
     *   path="/workcenters",
     *   summary="Get list of workcenters",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/WorkcenterResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new WorkcenterDataTable(
            Workcenter::query()
                ->where('company_id', auth()->user()->IDcompany)
        );

        return $datatable->toJson();
    }

    /**
     * @OA\Post(
     *   tags={"Workcenters"},
     *   path="/workcenters",
     *   summary="Create new workcenter",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "name"
     *       },
     *       @OA\Property(property="name", type="string"),
     *       example={
     *          "name" : "Workcenter 1"
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
     *         @OA\Items(ref="#/components/schemas/WorkcenterResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function store(StoreUpdateWorkcenterRequest $request)
    {
        $workcenter = new Workcenter();
        $workcenter->name = $request->name;
        $workcenter->company_id = auth()->user()->IDcompany;
        
        if(!$workcenter->save()){
            abort(500);
        }

        return $this->show($workcenter);
    }

    /**
     * @OA\Get(
     *   tags={"Workcenters"},
     *   path="/workcenters/{id}",
     *   summary="Get details of workcenter",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/WorkcenterResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(Workcenter $workcenter)
    {
        return response()->json($workcenter);
    }

    /**
     * @OA\Put(
     *   tags={"Workcenters"},
     *   path="/workcenters/{id}",
     *   summary="Update workcenter",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "name"
     *       },
     *       @OA\Property(property="name", type="string"),
     *       example={
     *          "name" : "Workcenter 12"
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
     *         @OA\Items(ref="#/components/schemas/WorkcenterResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function update(StoreUpdateWorkcenterRequest $request, Workcenter $workcenter)
    {
        $workcenter->name = $request->name;
        
        if(!$workcenter->save()){
            abort(500);
        }

        return $this->show($workcenter);
    }

     /**
     * @OA\Delete(
     *   tags={"Workcenters"},
     *   path="/workcenters/{id}",
     *   summary="Delete workcenter",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/WorkcenterResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function destroy(Workcenter $workcenter)
    {
        if(!$workcenter->delete()){
            abort(500);
        }
    }
}
