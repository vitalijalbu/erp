<?php

namespace App\Http\Controllers\Api;

use App\DataTables\DocumentLanguageDataTable;
use App\Http\Controllers\Controller;
use App\Models\DocumentLanguage;
use Illuminate\Http\Request;

class DocumentLanguageController extends Controller
{
    /**
     * @OA\Get(
     *   tags={"Document languages"},
     *   path="/document-languages",
     *   summary="Get list of document languages",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/DocumentLanguageResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new DocumentLanguageDataTable(
            DocumentLanguage::query()
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
    *   tags={"Document languages"},
     *   path="/document-languages/{id}",
     *   summary="Get details of single document language",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/OrderTypeResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(DocumentLanguage $documentLanguage)
    {
        return response()->json($documentLanguage);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DocumentLanguage $documentLanguage)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DocumentLanguage $documentLanguage)
    {
        //
    }
}
