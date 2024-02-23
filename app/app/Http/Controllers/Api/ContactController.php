<?php

namespace App\Http\Controllers\Api;

use App\Models\Contact;
use Illuminate\Http\Request;
use App\DataTables\ContactDataTable;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUpdateContactRequest;

class ContactController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Contact::class, 'contact');
    }
    /**
     * @OA\Get(
     *   tags={"Contacts"},
     *   path="/contacts",
     *   summary="Get list of contacts",
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
        $contacts = 
            Contact::query()
                ->with(['address' => function($builder) {
                    $builder->with(['city', 'province', 'nation', 'zip']);
                }])
                ->where('contacts.company_id', auth()->user()->IDcompany);

        return (new ContactDataTable($contacts))->toJson(); 

    }

   /**
     * @OA\Post(
     *   tags={"Contacts"},
     *   path="/contacts",
     *   summary="Create new contact",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "type", "name", "language", "is_employee"
     *       },
     *       @OA\Property(property="type", type="string"),
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="note", type="string"),
     *       @OA\Property(property="contact_type_id", type="integer"),
     *       @OA\Property(property="department", type="string"),
     *       @OA\Property(property="address_id", type="string"),
     *       @OA\Property(property="office_phone", type="string"),
     *       @OA\Property(property="mobile_phone", type="string"),
     *       @OA\Property(property="email", type="string"),
     *       @OA\Property(property="language", type="string"),
     *       @OA\Property(property="is_employee", type="boolean"),
     *       example={
     *           "type": "person",
     *           "name" : "John",
     *           "note" : "note",
     *           "contact_type_id": 1,
     *           "department" : "Production",
     *           "address_id" : null,
     *           "office_phone" : null,
     *           "mobile_phone" : null,
     *           "email" : null,
     *           "language" : "en",
     *           "is_employee": 1
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ContactResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function store(StoreUpdateContactRequest $request)
    {
        $contact = new Contact($request->validated());
        $contact->company_id = auth()->user()->IDcompany;
        
        if(!$contact->save()) {
            abort(500);
        }
        
        return $this->show($contact);
    }

    /**
     * @OA\Get(
     *   tags={"Contacts"},
     *   path="/contacts/{id}",
     *   summary="Get details of single contact",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ContactResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function show(Contact $contact)
    {
        return response()->json($contact);
    }

    /**
     * @OA\Put(
     *   tags={"Contacts"},
     *   path="/contacts/{id}",
     *   summary="Update contact",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "type", "name", "language", "is_employee"
     *       },
     *       @OA\Property(property="type", type="string"),
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="note", type="string"),
     *       @OA\Property(property="contact_type_id", type="integer"),
     *       @OA\Property(property="department", type="string"),
     *       @OA\Property(property="address_id", type="string"),
     *       @OA\Property(property="office_phone", type="string"),
     *       @OA\Property(property="mobile_phone", type="string"),
     *       @OA\Property(property="email", type="string"),
     *       @OA\Property(property="language", type="string"),
     *       @OA\Property(property="is_employee", type="boolean"),
     *       example={
     *           "type": "person",
     *           "name" : "John",
     *           "note" : "note",
     *           "contact_type_id": 1,
     *           "department" : "Production",
     *           "address_id" : null,
     *           "office_phone" : null,
     *           "mobile_phone" : null,
     *           "email" : null,
     *           "language" : "en",
     *           "is_employee": 1
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ContactResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function update(StoreUpdateContactRequest $request, Contact $contact)
    {
        $contact->update($request->validated());
    }

    /**
     * @OA\Delete(
     *   tags={"Contacts"},
     *   path="/contacts/{id}",
     *   summary="Delete contact",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ContactResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function destroy(Contact $contact)
    {
        if(!$contact->delete()){
            abort(500);
        }
    }
}
