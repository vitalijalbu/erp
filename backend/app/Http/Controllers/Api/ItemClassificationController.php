<?php

namespace App\Http\Controllers\Api;

use App\DataTables\ItemClassificationDataTable;
use App\Http\Controllers\Controller;
use App\Models\ItemClassification;
use Illuminate\Http\Request;

class ItemClassificationController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(ItemClassification::class, 'itemClassification');
    }
    /**
     * @OA\Get(
     *   tags={"Items Classification"},
     *   path="/items-classification",
     *   summary="Get list of items classification",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/ItemResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = (new ItemClassificationDataTable(
            ItemClassification::query()->with('pivot')
        ));

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
     * Display the specified resource.
     */
    public function show(ItemClassification $itemClassification)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ItemClassification $itemClassification)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ItemClassification $itemClassification)
    {
        //
    }
}
