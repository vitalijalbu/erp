<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\ItemSubfamily;
use App\Http\Controllers\Controller;
use App\DataTables\ItemSubfamilyDataTable;

class ItemSubfamilyController extends Controller
{

    public function __construct()
    {
        $this->authorizeResource(ItemSubfamily::class, 'itemSubfamily');
    }

    /**
     * @OA\Get(
     *   tags={"Items Sufamilies"},
     *   path="/items-subfamilies",
     *   summary="Get list of items subfamilies",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/ContactResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new ItemSubfamilyDataTable(
            ItemSubfamily::query()
        );

        return $datatable->toJson();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * @OA\Get(
     *   tags={"Items Sufamilies"},
     *   path="/items-subfamilies/{id}",
     *   summary="Get details of single item subfamily",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/ContactResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(ItemSubfamily $itemSubfamily)
    {
        return response()->json($itemSubfamily);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ItemSubfamily $itemSubfamily)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ItemSubfamily $itemSubfamily)
    {
        //
    }
}
