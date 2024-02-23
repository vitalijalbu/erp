<?php

namespace App\Http\Controllers\Api;

use App\Models\Machine;
use Illuminate\Http\Request;
use App\DataTables\MachineDataTable;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUpdateMachineRequest;

class MachineController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Machine::class, 'machine');
    }
    /**
     * @OA\Get(
     *   tags={"Machines"},
     *   path="/machines",
     *   summary="Get list of machines",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/MachineResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new MachineDataTable(
            Machine::query()
                ->where('company_id', auth()->user()->IDcompany)
                ->with(['cost', 'workcenter'])
        );

        return $datatable->toJson();
    }

     /**
     * @OA\Post(
     *   tags={"Machines"},
     *   path="/machines",
     *   summary="Create new machine",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "code", "workcenter_id", "cost_item_id", "men_occupation"
     *       },
     *       @OA\Property(property="code", type="string"),
     *       @OA\Property(property="workcenter_id", type="string"),
     *       @OA\Property(property="cost_item_id", type="string"),
     *       @OA\Property(property="description", type="string"),
     *       @OA\Property(property="men_occupation", type="int"),
     *       example={
     *          "code" : "machine_1",
     *          "workcenter_id" : "845-1",
     *          "cost_item_id" : "845-1028",
     *          "men_occupation" : 2,
     *          "description": "test"
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
    public function store(StoreUpdateMachineRequest $request)
    {
        $machine = new Machine();
        $machine->fill($request->validated());
        $machine->company_id = auth()->user()->IDcompany;

        if(!$machine->save()){
            abort(500);
        }

        return $this->show($machine);
    }

     /**
     * @OA\Get(
     *   tags={"Machines"},
     *   path="/machines/{id}",
     *   summary="Get details of machine",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/MachineResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(Machine $machine)
    {
        $machine->loadMissing(['cost', 'workcenter']);

        return response()->json($machine);
    }

    /**
     * @OA\Put(
     *   tags={"Machines"},
     *   path="/machines/{id}",
     *   summary="Update machine",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *         "workcenter_id", "cost_item_id", "men_occupation"
     *       },
     *       @OA\Property(property="workcenter_id", type="string"),
     *       @OA\Property(property="cost_item_id", type="string"),
     *       @OA\Property(property="description", type="string"),
     *       @OA\Property(property="men_occupation", type="int"),
     *       example={
     *          "workcenter_id" : "845-1",
     *          "cost_item_id" : "845-1028",
     *          "men_occupation" : 2,
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
    public function update(StoreUpdateMachineRequest $request, Machine $machine)
    {
        $machine->fill($request->validated());

        if(!$machine->save()){
            abort(500);
        }

        return $this->show($machine);
    }

     /**
     * @OA\Delete(
     *   tags={"Machines"},
     *   path="/machines/{id}",
     *   summary="Delete machine",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/MachineResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function destroy(Machine $machine)
    {
        if(!$machine->delete()){
            abort(500);
        }
    }
}
