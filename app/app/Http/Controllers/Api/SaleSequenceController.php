<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\DataTables\SaleSequenceDataTable;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSaleSequenceRequest;
use App\Http\Requests\StoreUpdateContactRequest;
use App\Models\SaleSequence;
use Illuminate\Support\Facades\DB;

class SaleSequenceController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(SaleSequence::class, 'sequence');
    }
    /**
     * @OA\Get(
     *   tags={"Sale Sequences"},
     *   path="/sale-sequences",
     *   summary="Get list of sale sequences",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/SaleSequenceResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $sequences = SaleSequence::byUser(auth()->user());

        return (new SaleSequenceDataTable($sequences))->toJson(); 

    }

   /**
     * @OA\Post(
     *   tags={"Sale Sequences"},
     *   path="/sale-sequences",
     *   summary="Create new sale sequence",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "name", "prefix"
     *       },
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="prefix", type="string"),
     *       @OA\Property(property="quotation_default", type="boolean"),
     *       @OA\Property(property="sale_default", type="boolean"),
     *       example={
     *           "name" : "Ordini di vendita",
     *           "prefix" : "ORDV",
     *           "quotation_default": 1,
     *           "sale_default" : 0,
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/SaleSequenceResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function store(StoreSaleSequenceRequest $request)
    {
        $sequence = new SaleSequence($request->validated());
        $sequence->company_id = auth()->user()->IDcompany;
        DB::transaction(function() use ($sequence) {
            if(!$sequence->save()) {
                abort(500);
            }
        });

        return $this->show($sequence);
    }

    /**
     * @OA\Get(
     *   tags={"Sale Sequences"},
     *   path="/sale-sequences/{id}",
     *   summary="Get details of a sale sequence",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/SaleSequenceResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function show(SaleSequence $sequence)
    {
        return response()->json($sequence);
    }

    /**
     * @OA\Put(
     *   tags={"Sale Sequences"},
     *   path="/sale-sequences/{id}",
     *   summary="Update a sale sequence",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="prefix", type="string"),
     *       @OA\Property(property="quotation_default", type="boolean"),
     *       @OA\Property(property="sale_default", type="boolean"),
     *       example={
     *           "name" : "Ordini di vendita",
     *           "quotation_default": 1,
     *           "sale_default" : 0,
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/SaleSequenceResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function update(StoreSaleSequenceRequest $request, SaleSequence $sequence)
    {
        DB::transaction(function() use ($request, $sequence) {
            if(!$sequence->update($request->safe()->except('prefix'))) {
                abort(500);
            };
        });
    }

    /**
     * @OA\Delete(
     *   tags={"Sale Sequences"},
     *   path="/sale-sequences/{id}",
     *   summary="Delete a sale sequence",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/SaleSequenceResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function destroy(SaleSequence $sequence)
    {
        if(!$sequence->delete()){
            abort(500);
        }
    }
}
