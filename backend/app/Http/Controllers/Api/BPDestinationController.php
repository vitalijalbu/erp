<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\Request;
use App\Models\BP;
use App\Models\BPDestination;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreBPDestinationRequest;


class BPDestinationController extends ApiController
{

    public function __construct()
    {
        $this->authorizeResource(BP::class, 'bp');
    }

    /**
     * @OA\Get(
     *   tags={"BP", "masterdata_business_partner_dest.php"},
     *   path="/bp/{id}/destinations",
     *   summary="BP Destinations list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *       @OA\Property(
     *         type="object",
     *         @OA\Items(ref="#/components/schemas/BPDestinationResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index(BP $bp)
    {
        return response()->json($bp->bpDestinations()->orderBy('desc', 'asc')->get());
    }

    /**
     * @OA\Post(
     *   tags={"BP", "masterdata_business_partner_dest.php"},
     *   path="/bp/{id}/destinations",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   summary="Create new BP Destination",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "desc"
     *       },
     *       @OA\Property(property="desc", type="string"),
     *       example={
     *          "desc": "Nome destinazione",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/BPDestinationResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function store(StoreBPDestinationRequest $request, BP $bp)
    {
        $bpDestination = new BPDestination();
        $bpDestination->fill($request->all());
        $bpDestination->IDcompany = $bp->IDcompany;
        $saved = DB::transaction(function() use ($bpDestination, $bp) {
            return $bp->bpDestinations()->save($bpDestination);
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Get(
     *   tags={"BP", "masterdata_business_partner_dest.php"},
     *   path="/bp/{id}/destinations/{destination_id}",
     *   summary="BP Destination show",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Parameter(ref="#/components/parameters/destination_id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/BPResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function show(BP $bp, BPDestination $destination)
    {
        return response()->json($destination->toArray());
    }

    /**
     * @OA\Put(
     *   tags={"BP", "masterdata_business_partner_dest.php"},
     *   path="/bp/{id}/destinations/{destination_id}",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Parameter(ref="#/components/parameters/destination_id"),
     *   summary="Update BP Destination",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="desc", type="string"),
     *       example={
     *          "desc": "Nome destinazione",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/BPDestinationResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function update(StoreBPDestinationRequest $request, BP $bp, BPDestination $destination)
    {
        $destination->fill($request->only('desc'));
        $saved = DB::transaction(function() use ($destination) {
            return $destination->save();
        });

        if(!$saved) {
            abort(500);
        }
    }

    /**
     * @OA\Delete(
     *   tags={"BP","masterdata_business_partner_dest.php"},
     *   path="/bp/{id}/destinations/{destination_id}",
     *   summary="Delete BP destination",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Parameter(ref="#/components/parameters/destination_id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function destroy(BP $bp, BPDestination $destination)
    {
        $deleted = DB::transaction(function() use ($destination) {
            return $destination->delete();
        });

        if(!$deleted) {
            abort(500);
        }
    }
}
