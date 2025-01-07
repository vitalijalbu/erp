<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\DataTables\SaleSequenceDataTable;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSaleSequenceRequest;
use App\Http\Requests\StoreWorkingDaysRuleRequest;
use App\Models\WorkingDaysRule;
use App\Services\Calendar\WorkingDaysChecker;
use Illuminate\Support\Facades\DB;

class WorkingDaysRuleController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(WorkingDaysRule::class, 'rule');
    }
    /**
     * @OA\Get(
     *   tags={"Working Days Rule"},
     *   path="/working-days-rules",
     *   summary="Get list of working days rules",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/WorkingDaysRuleResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $rules = WorkingDaysRule::byUser(auth()->user())->orderBy('start')->get();

        return response()->json($rules);
    }


    /**
     * @OA\Get(
     *   tags={"Working Days Rule"},
     *   path="/working-days-rules/check",
     *   summary="Get all open / close days in a period",
     *   @OA\Parameter(name="start", in="query", required="true"),
     *   @OA\Parameter(name="end", in="query", required="true"),
     *   @OA\Parameter(name="type", in="query", required="true", description="0 for close, 1 for open days"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array"
     *       ),
     *     )
     *   )
     * )
     */
    public function check(Request $request)
    {
        $request->validate([
            'start' => [
                'required', 
                'date_format:Y-m-d'
            ],
            'end' => [
                'required', 
                'date_format:Y-m-d',
                'after_or_equal:start'
            ],
            'type' => [
                'required', 
                'boolean'
            ]
        ]);

        $result = WorkingDaysChecker::checkPeriod(
            $request->date('start', 'Y-m-d'),
            $request->date('end', 'Y-m-d'),
            $request->type,
            auth()->user()->IDcompany
        );

        return response()->json($result);
    }

   /**
     * @OA\Post(
     *   tags={"Working Days Rule"},
     *   path="/working-days-rules",
     *   summary="Create new working days rule",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "type", "start", "repeat"
     *       },
     *       @OA\Property(property="type", type="boolean"),
     *       @OA\Property(property="start", type="string"),
     *       @OA\Property(property="end", type="string"),
     *       @OA\Property(property="days_of_week", type="object"),
     *       @OA\Property(property="repeat", type="boolean"),
     *       example={
     *           "type" : 1,
     *           "start" : "2023-12-24",
     *           "end" : "2023-12-26",
     *           "days_of_week" : {1, 2},
     *           "repeat": 1,
     *           "note": "Christmas"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/WorkingDaysRuleResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function store(StoreWorkingDaysRuleRequest $request)
    {
        $rule = new WorkingDaysRule($request->validated());
        $rule->company_id = auth()->user()->IDcompany;
        if(!$rule->save()) {
            abort(500);
        }

        return $this->show($rule);
    }

    /**
     * @OA\Get(
     *   tags={"Working Days Rule"},
     *   path="/working-days-rules/{id}",
     *   summary="Get details of a sale sequence",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/WorkingDaysRuleResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function show(WorkingDaysRule $rule)
    {
        return response()->json($rule);
    }

    /**
     * @OA\Put(
     *   tags={"Working Days Rule"},
     *   path="/working-days-rules/{id}",
     *   summary="Update a sale sequence",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       @OA\Property(property="type", type="boolean"),
     *       @OA\Property(property="start", type="string"),
     *       @OA\Property(property="end", type="string"),
     *       @OA\Property(property="days_of_week", type="object"),
     *       @OA\Property(property="repeat", type="boolean"),
     *       example={
     *           "type" : 1,
     *           "start" : "2023-12-24",
     *           "end" : "2023-12-26",
     *           "days_of_week" : {1, 2},
     *           "repeat": 1,
     *           "note": "Christmas"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/WorkingDaysRuleResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function update(StoreWorkingDaysRuleRequest $request, WorkingDaysRule $rule)
    {
        if(!$rule->update($request->validated())) {
            abort(500);
        };
    }

    /**
     * @OA\Delete(
     *   tags={"Working Days Rule"},
     *   path="/working-days-rules/{id}",
     *   summary="Delete a sale sequence",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/WorkingDaysRuleResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function destroy(WorkingDaysRule $rule)
    {
        if(!$rule->delete()){
            abort(500);
        }
    }
}
