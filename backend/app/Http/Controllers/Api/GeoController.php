<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\Request;
use App\Models\Nation;
use App\Models\Province;
use App\Models\City;
use App\Models\Zip;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreProvinceRequest;
use App\Http\Requests\StoreCityRequest;
use App\Http\Requests\StoreZipRequest;


class GeoController extends ApiController
{

    /**
     * @OA\Get(
     *   tags={"Geographic"},
     *   path="/geo/nations",
     *   summary="Get available nation list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/NationResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function nations()
    {
        $datatable = new \App\DataTables\NationsDataTable(
            Nation::query()
        );
        return $datatable->toJson();
    }


    /**
     * @OA\Get(
     *   tags={"Geographic"},
     *   path="/geo/provinces",
     *   summary="Get available province list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/ProvinceResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function provinces()
    {
        $this->authorize('viewAny', Province::class);
        $datatable = new \App\DataTables\ProvincesDataTable(
            Province::byUser(auth()->user())->with(['nation'])->selectRaw('provinces.*')
        );
        return $datatable->toJson();
    }

    /**
     * @OA\Post(
     *   tags={"Geographic"},
     *   path="/geo/provinces",
     *   summary="Create new province",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "name", "code", "nation_id"
     *       },
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="code", type="string"),
     *       @OA\Property(property="nation_id", type="string"),
     *       example={
     *          "name": "Biella",
     *          "code": "BI",
     *          "nation_id": "IT"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ProvinceResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function addProvince(StoreProvinceRequest $request)
    {
        $this->authorize('create', Province::class);
        $province = new Province();
        $province->fill($request->all());
        $province->company_id = auth()->user()->IDcompany;
        if(!DB::transaction(function() use ($province) {
            return $province->save();
        })) {
            abort(500);
        }

        return response()->json($province);
    }


    /**
     * @OA\Put(
     *   tags={"Geographic"},
     *   path="/geo/provinces/{id}",
     *   summary="Edit a province",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="code", type="string"),
     *       @OA\Property(property="nation_id", type="string"),
     *       example={
     *          "name": "Biella",
     *          "code": "BI",
     *          "nation_id": "IT"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ProvinceResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function editProvince(StoreProvinceRequest $request, Province $province)
    {
        $this->authorize('update', $province);
        $province->fill($request->all());
        
        if(!DB::transaction(function() use ($province) {
            return $province->save();
        })) {
            abort(500);
        }

        return response()->json($province);
    }

    /**
     * @OA\Delete(
     *   tags={"Geographic"},
     *   path="/geo/provinces/{id}",
     *   summary="Delete Province",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/Feature")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function deleteProvince(Province $province)
    {
        $this->authorize('delete', $province);
        if(!$province->delete()) {
            abort(500);
        }
    }


    /**
     * @OA\Get(
     *   tags={"Geographic"},
     *   path="/geo/cities",
     *   summary="Get available city list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/CityResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function cities()
    {
        $this->authorize('viewAny', City::class);
        $datatable = new \App\DataTables\CitiesDataTable(
            City::byUser(auth()->user())->with(['nation', 'province'])->selectRaw('cities.*')
        );
        return $datatable->toJson();
    }

    /**
     * @OA\Post(
     *   tags={"Geographic"},
     *   path="/geo/cities",
     *   summary="Create new city",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "name", "nation_id"
     *       },
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="province_id", type="number"),
     *       @OA\Property(property="nation_id", type="string"),
     *       example={
     *          "name": "Biella",
     *          "province_id": 1,
     *          "nation_id": "IT"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/CityResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function addCity(StoreCityRequest $request)
    {
        $this->authorize('create', City::class);
        $city = new City();
        $city->fill($request->all());
        $city->company_id = auth()->user()->IDcompany;
        if(!$city->save()) {
            abort(500);
        }

        return response()->json($city);
    }


    /**
     * @OA\Put(
     *   tags={"Geographic"},
     *   path="/cities/{id}",
     *   summary="Edit a city",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="province_id", type="string"),
     *       @OA\Property(property="nation_id", type="string"),
     *       example={
     *          "name": "Biella",
     *          "province_id": 1,
     *          "nation_id": "IT"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ProvinceResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function editCity(StoreCityRequest $request, City $city)
    {
        $this->authorize('update', $city);
        $city->fill($request->all());
        
        if(!$city->save()) {
            abort(500);
        }

        return response()->json($city);
    }

    /**
     * @OA\Delete(
     *   tags={"Geographic"},
     *   path="/geo/cities/{id}",
     *   summary="Delete city",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/Feature")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function deleteCity(City $city)
    {
        $this->authorize('delete', $city);
        if(!$city->delete()) {
            abort(500);
        }
    }


    /**
     * @OA\Get(
     *   tags={"Geographic"},
     *   path="/geo/zips",
     *   summary="Get available zip list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/ZipResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function zips()
    {
        $this->authorize('viewAny', Zip::class);
        $datatable = new \App\DataTables\ZipsDataTable(
            Zip::byUser(auth()->user())->with(['city', 'city.province', 'city.nation'])->selectRaw('zips.*')
        );
        return $datatable->toJson();
    }

    /**
     * @OA\Post(
     *   tags={"Geographic"},
     *   path="/geo/zips",
     *   summary="Create new zip",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "code", "city_id"
     *       },
     *       @OA\Property(property="code", type="string"),
     *       @OA\Property(property="city_id", type="number"),
     *       @OA\Property(property="description", type="string"),
     *       example={
     *          "code": "13900",
     *          "city_id": 1,
     *          "description": "Biella"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ZipResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function addZip(StoreZipRequest $request)
    {
        $this->authorize('create', Zip::class);
        $zip = new Zip();
        $zip->fill($request->all());
        $zip->company_id = auth()->user()->IDcompany;
        if(!$zip->save()) {
            abort(500);
        }

        return response()->json($zip);
    }


    /**
     * @OA\Put(
     *   tags={"Geographic"},
     *   path="/geo/zips/{id}",
     *   summary="Edit zip",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="code", type="string"),
     *       @OA\Property(property="city_id", type="number"),
     *       @OA\Property(property="description", type="string"),
     *       example={
     *          "code": "13900",
     *          "city_id": 1,
     *          "description": "Biella"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/ZipResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function editZip(StoreZipRequest $request, Zip $zip)
    {
        $this->authorize('update', $zip);
        $zip->fill($request->all());
        
        if(!$zip->save()) {
            abort(500);
        }

        return response()->json($zip);
    }

    /**
     * @OA\Delete(
     *   tags={"Geographic"},
     *   path="/geo/zips/{id}",
     *   summary="Delete zip",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/Feature")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function deleteZip(Zip $zip)
    {
        $this->authorize('delete', $zip);
        if(!$zip->delete()) {
            abort(500);
        }
    }
}
