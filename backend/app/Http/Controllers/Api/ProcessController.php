<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreUpdateProcessRequest;
use App\Models\Process;
use Illuminate\Http\Request;
use App\DataTables\ProcessDataTable;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class ProcessController extends Controller
{

    public function __construct()
    {
        $this->authorizeResource(Process::class, 'process');
    }
    /**
     * @OA\Get(
     *   tags={"Processes"},
     *   path="/processes",
     *   summary="Get list of processes",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/ProcessResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new ProcessDataTable(
            Process::byUser(auth()->user())->with([
                'priceItem',
                'setupPriceItem',
                'operatorCostItem'
            ])
        );

        return $datatable->toJson();
    }
    


    /**
     * @OA\Get(
     *   tags={"Processes"},
     *   path="/processes/autocomplete",
     *   summary="Processes search for autocomplete",
     *   @OA\Parameter(
     *     name="search",
     *     in="query",
     *     required=true,
     *     type="string"
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *       @OA\Property(
     *         property="data",
     *         type="object",
     *         @OA\Items(ref="#/components/schemas/ProcessResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function autocomplete(Request $request)
    {
        $this->authorize('viewAny', Process::class);
        $request->validate([
            'search' => ['required', 'string'],
        ]);

        $processes = Process::searchByDesc(
            $request->search,
        )->scopes(['byUser' => [auth()->user()]])->get();

        return response()->json($processes);
    }

   /**
     * @OA\Post(
     *   tags={"Processes"},
     *   path="/processes",
     *   summary="Create new process",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "code", 
     *          "name"
     *       },
     *       @OA\Property(property="code", type="string"),
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="price_item_id", type="string"),
     *       @OA\Property(property="setup_price_item_id", type="string"),
     *       @OA\Property(property="operator_cost_item_id", type="string"),
     *       @OA\Property(property="execution_time", type="integer"),
     *       @OA\Property(property="setup_time", type="integer"),
     *       @OA\Property(property="men_occupation", type="integer"),
     *       @OA\Property(property="need_machine", type="boolean"),
     *       @OA\Property(property="machines", type="object"),
     *       example={
     *          "id" : "process_4",
     *          "name" : "Process 4",
     *          "price_item_id": "845-1",
     *          "setup_price_item_id": "845-2",
     *          "operator_cost_item_id": "845-3",
     *          "execution_time": 60,
     *          "setup_time": 120,
     *          "men_occupation": 2,
     *          "need_machine": true,
     *          "machines": {
     *              {
     *                  "machine_id": "845-1",
     *                  "workcenter_default": true
     *              },
     *              {
     *                  "machine_id": "845-2",
     *                  "workcenter_default": false
     *              }
     *          }
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
     *         @OA\Items(ref="#/components/schemas/ProcessResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function store(StoreUpdateProcessRequest $request)
    {
        $process = new Process($request->validated());
        $process->company_id = auth()->user()->IDcompany;
        
        DB::transaction(function() use ($process, $request) {
            if(!$process->save()){
                abort(500);
            }

            $process->machines()->sync(
                $request->need_machine ?
                    collect($request->machines)->keyBy('machine_id')->map(fn($e) => collect($e)->only('workcenter_default'))->toArray() 
                    : []
            );
        });

        return $this->show($process);
    }

     /**
     * @OA\Get(
     *   tags={"Processes"},
     *   path="/processes/{id}",
     *   summary="Get details of process",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/ProcessResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(Process $process)
    {
        $process->loadMissing([
            'machines.workcenter',
            'priceItem',
            'setupPriceItem',
            'operatorCostItem'
        ]);

        return response()->json($process);
    }

    /**
     * @OA\Put(
     *   tags={"Processes"},
     *   path="/processes{id}",
     *   summary="Update existing process",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="code", type="string"),
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="price_item_id", type="string"),
     *       @OA\Property(property="setup_price_item_id", type="string"),
     *       @OA\Property(property="operator_cost_item_id", type="string"),
     *       @OA\Property(property="execution_time", type="integer"),
     *       @OA\Property(property="setup_time", type="integer"),
     *       @OA\Property(property="men_occupation", type="integer"),
     *       @OA\Property(property="need_machine", type="boolean"),
     *       example={
     *          "id" : "process_4",
     *          "name" : "Process 4",
     *          "price_item_id": "845-1",
     *          "setup_price_item_id": "845-2",
     *          "operator_cost_item_id": "845-3",
     *          "execution_time": 60,
     *          "setup_time": 120,
     *          "men_occupation": 2,
     *          "need_machine": true,
     *          "machines": {
     *              {
     *                  "machine_id": "845-1",
     *                  "workcenter_default": true
     *              },
     *              {
     *                  "machine_id": "845-2",
     *                  "workcenter_default": false
     *              }
     *          }
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
     *         @OA\Items(ref="#/components/schemas/ProcessResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function update(StoreUpdateProcessRequest $request, Process $process)
    {
        $process->fill($request->validated());
        
        DB::transaction(function() use ($process, $request) {
            if(!$process->save()){
                abort(500);
            }

            $process->machines()->sync(
                $request->need_machine ?
                    collect($request->machines)->keyBy('machine_id')->map(fn($e) => collect($e)->only('workcenter_default'))->toArray() 
                    : []
            );
        });


        return $this->show($process);
    }

    /**
     * @OA\Delete(
     *   tags={"Processes"},
     *   path="/processes/{id}",
     *   summary="Delete process",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/ProcessResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function destroy(Process $process)
    {
        $process->delete();
    }
}
