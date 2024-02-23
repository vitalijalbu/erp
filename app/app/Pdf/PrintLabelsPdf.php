<?php

namespace App\Pdf;

use Illuminate\Support\Facades\DB;

class PrintLabelsPdf extends PdfBase {

    public function getData()
    {
        $data = collect();

        $user = auth()->user();

        foreach(request()->ids as $id){
            $data->push(
                DB::query()
                    ->selectRaw("logo_on_prints, idlot, p.IDitem, item, item_desc, dim, um, whdesc, whlcdesc, stepRoll, note, qty_stock, IDlot_fornitore, ord_rif")
                    ->when(auth()->user()->company->read_alternative_item_code, function($q) use ($user){
                        $q->selectRaw("item_en.altv_code, isnull(item_en.altv_desc, '') as altv_desc")
                        ->leftJoin(DB::raw('dbo.item_enabled as item_en'), function($join) use ($user){
                            $join->on('p.IDitem', '=', 'item_en.IDitem');
                            $join->whereIn('item_en.IDcompany', [0, $user->IDcompany]);
                        });
                    }, function($q){
                        $q->addSelect(DB::raw('altv_code = null, altv_desc = null'));
                    })
                    ->fromRaw('dbo.parView_printLabel (?, ?) as p', [
                        auth()->user()->IDcompany,
                        $id
                    ])
                    ->first()
            );
        }

        $data = $data->filter();

        abort_if($data->isEmpty(), 404);

        return $data;
    }

    public function generate()
    {
        $data = $this->getData();

        $this->SetSubject('Lots labels');

        // set style for barcode
        $style = [
            'border' => 2,
            'vpadding' => 'auto',
            'hpadding' => 'auto',
            'fgcolor' => [0, 0, 0],
            'bgcolor' => false, //array(255,255,255)
            'module_width' => 1, // width of a single module in points
            'module_height' => 1 // height of a single module in points
        ];

        foreach($data as $d){
            $this->SetFont('helvetica', 'BI', 11);
            $alt_item = "";		
            $alt_dsca = "";
            if ($d->altv_code<>''){$alt_item = " (".$d->altv_code.")";}	//mettaimo le parentesi per riconoscere facilmente che è la desc. alternativa
            if ($d->altv_desc <>''){$alt_dsca = " (".$d->altv_desc.")";}	//mettaimo le parentesi per riconoscere facilmente che è la desc. alternativa
            
            $logo = $d->logo_on_prints;	
            $lot = $d->idlot;
            $itemCode = $d->item;
            $itemdesc = $d->item_desc;
            $lotDim = $d->dim;
            $qtyStock = floatval($d->qty_stock);
            $um = $d->um;		
            $lotStepRoll = $d->stepRoll;
            $note = $d->note;
            $lot_sup = $d->IDlot_fornitore;
            $ord_ref = $d->ord_rif;
            
            if (trim($d->whdesc) != '') 
                {	$lotWh = $d->whdesc;
                    $lotLc = $d->whlcdesc; }
                else{
                    $lotWh = '______________';
                    $lotLc = '______________';}			
                    
            
            // add a page
            $this->AddPage('P', 'A6');
            
            // set JPEG quality
            $this->setJPEGQuality(75);
            // Image example with resizing
            // Image($file, $x='', $y='', $w=0, $h=0, $type='', $link='', $align='', $resize=false, $dpi=300, $palign='', $ismask=false, $imgmask=false, $border=0, $fitbox=false, $hidden=false, $fitonpage=false)
            //$this->Image('img/logo_chio.jpg', 10, 50, 75, 113, 'JPG', 'http://www.tcpdf.org', '', true, 10, '', false, false, 1, false, false, false);
            //$this->Image($logo, 7, 7, 50, 7, '', '', 'T', false, 300, '', false, false, 0, false, false, false);
   
            list(, $w, $h) = explode('_', pathinfo($logo, PATHINFO_FILENAME));

            $this->Image(public_path('storage/img/logos/'.$logo), 7, 7, $w, $h, '', '', 'T', false, 300, '', false, false, 0, false, false, false);
                       
            // -------------------------------------------------------------------
            // DATAMATRIX (ISO/IEC 16022:2006)
            $this->write2DBarcode($lot, 'DATAMATRIX', 8, 20, 30, 30, $style, 'N');
            
            $stepRollYN = '';
            if ($lotStepRoll != 0) {$stepRollYN = '(SR)';}
            
            //Print lot info read from db
            
            //Parte alta a fianco DataMatrix	
            $this->Text(42, 20,  'LOT:');
            $this->Text(42, 26,  'ITM:');
            $this->Text(42, 32,  'QTY:');			
            $this->Text(42, 38,  'WHS:');
            $this->Text(42, 44,  'LOC:');
            $this->Text(54, 20,  $lot.'  '.$stepRollYN);
            $this->Text(54, 26,  $itemCode.$alt_item);
            $this->Text(54, 32,  $qtyStock.' '.$um);			
            $this->Text(54, 38,  $lotWh);
            $this->Text(54, 44,  $lotLc);
                    
            //Pare bassa, sotto DataMatrix
            $this->Text(7, 56,  'DSC:  '.$itemdesc);
            $this->Text(18, 62,  $alt_dsca);  //2021-07-22, desc. art. alternativo x kruse
            
            $this->Text(7, 68,  'DIM:  '.$lotDim);		
            $this->Text(7, 74,  'SUP. LOT:  '.$lot_sup);
            $this->Text(7, 80,  'ORD. REF:  '.$ord_ref);
            
            //Stampa del testo lotto
            $this->Text(7, 86, 'TXT:');
            $this->SetFont('helvetica', 'BI', 8);
            $this->Text(18, 87, substr($note, 0, 50)); /*Memo, substr(txt, start, lenght)*/
            $this->Text(7, 92, substr($note, 50, 60));			
            $this->Text(7, 97, substr($note, 110, 60));
        }

        return $this->Output('csm_label.pdf', 'S');
    }
}