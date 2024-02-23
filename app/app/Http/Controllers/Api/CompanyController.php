<?php

namespace App\Http\Controllers\Api;

use App\Models\Company;
use App\Models\Contact;
use App\Models\Warehouse;
use App\Models\Workcenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\ApiController;


class CompanyController extends ApiController
{


    /**
     * @OA\Get(
     *   tags={"Companies"},
     *   path="/companies",
     *   summary="Avalilable companies list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
    *        @OA\Items(ref="#/components/schemas/CompanyResource")
     *     )
     *   )
     * )
     */
    public function index()
    {
        $this->authorize('viewAny', Company::class);
        $companies = Company::when(request()->query('all', false) == false, function ($query) {
            return $query->where('IDcompany', '<>', 0);
        })->get();

        return response()->json($companies);
    }


    /**
     * @OA\Get(
     *   tags={"Companies"},
     *   path="/companies/{id}/warehouses",
     *   summary="Avalilable company warehouses list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
    *        @OA\Items(ref="#/components/schemas/WarehouseResource")
     *     )
     *   )
     * )
     */
    public function warehouses(Company $company)
    {
        $this->authorize('viewAny', Company::class);
        $warehouses = Warehouse::where('IDcompany', $company->IDcompany)
            ->orderBy('desc')
            ->get();

        return response()->json($warehouses);
    }

    /**
     * @OA\Get(
     *   tags={"Companies"},
     *   path="/companies/{id}/workcenters",
     *   summary="Avalilable company workcenters list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
    *        @OA\Items(ref="#/components/schemas/WorkcenterResource")
     *     )
     *   )
     * )
     */
    public function workcenters(Company $company)
    {
        $this->authorize('viewAny', Company::class);
        $workcenters = Workcenter::where('company_id', $company->IDcompany)
            ->orderBy('name')
            ->get();

        return response()->json($workcenters);
    }

    /**
     * @OA\Get(
     *   tags={"Companies"},
     *   path="/companies/{id}/employees",
     *   summary="Avalilable company employees list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
    *        @OA\Items(ref="#/components/schemas/ContactResource")
     *     )
     *   )
     * )
     */
    public function employees(Company $company)
    {
        $this->authorize('viewAny', Company::class);
        $employees = 
            Contact::where('company_id', $company->IDcompany)
                ->where('is_employee', true)
                ->orderBy('name')
                ->get();

        return response()->json($employees);
    }

}
