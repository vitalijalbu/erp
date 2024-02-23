<?php

namespace App\Http\Controllers\Api;

use App\Models\Contact;
use Illuminate\Http\Request;
use App\DataTables\ContactDataTable;
use App\DataTables\ContactTypesDataTable;
use App\Http\Controllers\Controller;
use App\Models\ContactType;

class ContactTypeController extends Controller
{
    /**
     * @OA\Get(
     *   tags={"Contact Types"},
     *   path="/contacts/types",
     *   summary="Get available contact types",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/ContactTypeResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index(Request $request)
    {
        $contactTypes = ContactType::query();
        $dataTable = new ContactTypesDataTable($contactTypes);

        if(!$request->has('order')) {
            $dataTable->order(function($query) {
                $query->orderBy('name');
            });
        }

        return $dataTable->toJson(); 
    }

}
