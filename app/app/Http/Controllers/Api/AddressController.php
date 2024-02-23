<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\Request;
use App\Models\Address;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreAddressRequest;

class AddressController extends ApiController
{

    /**
     * @OA\Get(
     *   tags={"BP Addresses"},
     *   path="/addresses",
     *   summary="Get available bp addresses list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/AddressResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new \App\DataTables\AddressesDataTable(
            Address::byUser(auth()->user())->with(['nation', 'province', 'city', 'zip'])
        );
        return $datatable->toJson();
    }


    /**
     * @OA\Post(
     *   tags={"BP Addresses"},
     *   path="/addresses",
     *   summary="Show BP Address",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/AddressResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     * )
     */
    public function show(Address $address)
    {
        $this->authorize('view', $address);
        $address->loadMissing(['nation', 'province', 'city', 'zip']);
        return response()->json($address);
    }


    /**
     * @OA\Get(
     *   tags={"BP Addresses"},
     *   path="/addresses/{id}",
     *   summary="Edit new BP Address",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "name", "address", "street_number", "timezone", "nation_id", "city_id", "zip_id"
     *       },
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="address", type="string"),
     *       @OA\Property(property="street_number", type="string"),
     *       @OA\Property(property="timezone", type="string"),
     *       @OA\Property(property="nation_id", type="string"),
     *       @OA\Property(property="province_id", type="string"),
     *       @OA\Property(property="city_id", type="string"),
     *       @OA\Property(property="zip_id", type="string"),
     *       example={
     *          "name": "Biella",
     *          "address": "Via cavour",
     *          "street_number": "106",
     *          "timezone": "Europe/Rome",
     *          "nation_id": "IT",
     *          "city_id": "845-1",
     *          "province_id": "845-2",
     *          "zip_id": "845-1",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/AddressResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function store(StoreAddressRequest $request)
    {
        $this->authorize('create', Address::class);
        $address = new Address();
        $address->fill($request->all());
        $address->company_id = auth()->user()->IDcompany;
        if(!$address->save()) {
            abort(500);
        }

        return $this->show($address);
    }


    /**
     * @OA\Put(
     *   tags={"BP Addresses"},
     *   path="/addresses/{id}",
     *   summary="Update BP Address",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="address", type="string"),
     *       @OA\Property(property="street_number", type="string"),
     *       @OA\Property(property="timezone", type="string"),
     *       @OA\Property(property="nation_id", type="string"),
     *       @OA\Property(property="province_id", type="string"),
     *       @OA\Property(property="city_id", type="string"),
     *       @OA\Property(property="zip_id", type="string"),
     *       example={
     *          "name": "Biella",
     *          "address": "Via cavour",
     *          "street_number": "106",
     *          "timezone": "Europe/Rome",
     *          "nation_id": "IT",
     *          "city_id": "845-1",
     *          "province_id": "845-2",
     *          "zip_id": "845-1",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/AddressResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function update(StoreAddressRequest $request, Address $address)
    {
        $this->authorize('update', $address);
        $address->fill($request->all());
        
        if(!$address->save()) {
            abort(500);
        }
    }

    /**
     * @OA\Delete(
     *   tags={"BP Addresses"},
     *   path="/addresses/{id}",
     *   summary="Delete BP Address",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/Address")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function destroy(Address $address)
    {
        $this->authorize('delete', $address);
        if(!$address->delete()) {
            abort(500);
        }
    }


    
}
