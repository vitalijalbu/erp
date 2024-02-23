<?php

namespace App\Http\Controllers\Api;

use App\Models\Lot;
use App\Pdf\PrintLabelsPdf;
use Illuminate\Http\Request;
use App\Pdf\PrintCuttingOrderPdf;
use App\Http\Controllers\Controller;
use App\Http\Requests\PrintLabelRequest;
use App\Http\Requests\PrintCuttingOrderRequest;
use App\Http\Requests\PrintLabelRangeRequest;

class PrintController extends Controller
{
    /**
     * @OA\GET(
     *   tags={"print"},
     *   path="/print/cutting-order",
     *   summary="Print pdf of cuttings order",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "idLot"
     *       },
     *       @OA\Property(property="idLot", type="string"),
     *       example={
     *          "idLot": "FRLYF22002689"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error"),
     *   @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function cuttingOrder(PrintCuttingOrderRequest $request)
    {
        $this->authorize('cuttingOrder', 'print');      

        $pdf = (new PrintCuttingOrderPdf())->generate();

        return response(
            $pdf,
            headers: [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline'
            ]);
    }

    /**
     * @OA\GET(
     *   tags={"print"},
     *   path="/print/labels",
     *   summary="Print label of lot or id stock",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "ids"
     *       },
     *       @OA\Property(property="ids", type="string|int"),
     *       example={
     *          "ids": {"FRVIA20001658", 610}
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error"),
     *   @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function labels(PrintLabelRequest $request)
    {
        $this->authorize('labels', 'print');

        $pdf = (new PrintLabelsPdf())->generate();

        return response(
            $pdf,
            headers: [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline'
            ]);
    }

    /**
     * @OA\GET(
     *   tags={"print"},
     *   path="/print/label-range",
     *   summary="Print label by range of lot or by delivery note",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="fromLot", type="string"),
     *       @OA\Property(property="toLot", type="string"),
     *       @OA\Property(property="deliveryNote", type="string"),
     *       example={
     *          "fromLot" : "FRPRA22000459",
     *          "toLot" : "FRPRA22000464"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error"),
     *   @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function labelRange(PrintLabelRangeRequest $request)
    {
        $this->authorize('labelRange', 'print');

        $lot = 
            Lot::query()
                ->select('lot.IDlot')
                ->leftJoin('receptions', function($q){
                    $q->on('receptions.IDcompany', '=', 'lot.IDcompany');
                    $q->on('receptions.IDlot', '=', 'lot.IDlot');
                })
                ->where('lot.IDcompany', auth()->user()->IDcompany)
                ->when($request->fromLot && $request->toLot, function($q) use ($request){
                    $q->whereBetween('lot.IDlot', [$request->fromLot, $request->toLot]);
                })
                ->when($request->deliveryNote, function($q) use ($request){
                    $q->where('receptions.delivery_note', $request->deliveryNote);
                })
                ->get();

        request()->merge([
            'ids' => $lot->pluck('IDlot')->toArray()
        ]);

        $pdf = (new PrintLabelsPdf())->generate();

        return response(
            $pdf,
            headers: [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline'
            ]);
    }
}
