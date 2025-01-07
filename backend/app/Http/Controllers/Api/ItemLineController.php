<?php

namespace App\Http\Controllers\Api;

use App\DataTables\ItemLineDataTable;
use App\Http\Controllers\Controller;
use App\Models\ItemLine;
use Illuminate\Http\Request;

class ItemLineController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(ItemLine::class, 'itemLine');
    }
   /**
     * @OA\Get(
     *   tags={"Items Lines"},
     *   path="/items-lines",
     *   summary="Get list of items lines",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/ItemLineResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new ItemLineDataTable(
            ItemLine::query()
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
     *   tags={"Items Lines"},
     *   path="/items-lines/{id}",
     *   summary="Get details of single item line",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/ItemLineResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(ItemLine $itemLine)
    {
        return response()->json($itemLine);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ItemLine $itemLine)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ItemLine $itemLine)
    {
        //
    }
}
