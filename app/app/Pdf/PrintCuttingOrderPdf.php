<?php

namespace App\Pdf;

use App\Helpers\Utility;
use Illuminate\Support\Facades\DB;

class PrintCuttingOrderPdf extends PdfBase {

    public function __construct()
    {
        parent::__construct();
    }

    public function Footer() 
    {
        // Position at 15 mm from bottom
        $this->SetY(-12);
        // Set font
        $this->SetFont('helvetica', 'I', 8);
        // Page number
        $this->Cell(0, 10, 'Page '.$this->getAliasNumPage().'/'.$this->getAliasNbPages(), 0, false, 'C', 0, '', 0, false, 'T', 'M');
    }

    private function printTableFooter() 
    {
        /* BEGIN: Creazione della tabellina vuota da compilare manualmente  -------------------------------------------------*/
        //https://tcpdf.org/examples/example_004/
        //https://www.ibm.com/developerworks/library/os-tcpdf/index.html
        //cell(Larghezza, altezza, text, bordo,,allieneamento)	
        $this->SetFont( 'helvetica', '', 11 );
        /* Setto il puntatore, da qui "parte" la tabella */
        $this->SetY( 245 , true );	
        $this->SetX( 5 );	
        # Column size, wide (description) column, table indent, row height.
        $col = 38;
        $line = 8;	
        $row = array(1, 2, 3, 4);
        
        # Table header
        //$this->Cell( $indent ); /*Spazio laterale */
        $this->Cell( $col, $line, 'Returned lot', 1, 0, 'L' );
        $this->Cell( 70, $line, 'Dim mm(Width x Length)', 1, 0, 'C' );
        $this->Cell( $col, $line, 'Pieces', 1, 0, 'L' );
        $this->Cell( $col, $line, 'Location', 1, 0, 'L' );
        $this->Ln();	
        # Table rows
        foreach ($row as &$value) {
            $this->SetX( 5 );	
            $this->Cell( $col, $line, '', 1, 0, 'L' );
            $this->Cell( 70, $line, 'x', 1, 0, 'C' );
            $this->Cell( $col, $line, '', 1, 0, 'L' );
            $this->Cell( $col, $line, '', 1, 0, 'L' );
            $this->Ln(); /*Andiamo a capo*/
        }
    }	
    /* END:Creazione della tabellina vuota da compilare manualmente  -------------------------------------------------*/
    
    public function getData()
    {
        $user = auth()->user();

        $sub = 
            DB::query()
                ->selectRaw("executed, o.IDlot, i.IDitem, item, item_desc, dbo.getDimByLot(o.IDcompany, o.IDlot) as lotDim, s.qty_stock, 
                l.note as lnote, l.ord_rif as lord_rif, LA, LU, PZ, IDlot_new, r.ord_rif as rowCutOrd_rif 
                ,isnull(w.[desc],'') as wdesc, isnull(wl.[desc],'') as wldesc, wlc.[desc] as cut_wldesc  
                ,r.step_roll, r.step_roll_order, IDcut, o.date_planned, logo_on_prints")
                ->fromRaw("dbo.cutting_order o 
                inner join dbo.company c on o.IDcompany = c.IDcompany
                inner join dbo.lot l on l.IDcompany = o.IDcompany and l.IDlot = o.IDlot 
                left outer join dbo.stock s on s.IDcompany = o.IDcompany and s.IDlot = o.IDlot 
                left outer join dbo.warehouse w on w.IDcompany = o.IDcompany and s.IDwarehouse = w.IDwarehouse 
                left outer join dbo.warehouse_location wl on wl.IDcompany = o.IDcompany and s.IDlocation = wl.IDlocation 
                inner join dbo.item i on i.IDitem = l.IDitem 
                inner join dbo.cutting_order_row r on r.IDcompany = o.IDcompany and o.IDlot = r.IDlot 
                inner join dbo.warehouse_location wlc on wlc.IDcompany = o.IDcompany and r.IDlocation = wlc.IDlocation");
                
                if($user->company->read_alternative_item_code){
                    $sub->selectRaw("item_en.altv_code as altv_code, item_en.altv_desc as altv_desc")
                        ->leftJoin(DB::raw('dbo.item_enabled as item_en'), function($join) use ($user){
                            $join->on('i.IDitem', '=', 'item_en.IDitem');
                            $join->whereIn('item_en.IDcompany', [0, $user->IDcompany]);
                        });
                }

                $sub->where([
                    'o.IDcompany' => $user->IDcompany,
                    'o.IDlot' =>  request()->idLot
                ]);         
            
        $data = 
            DB::query()
                ->selectRaw("executed, IDlot, IDitem, item, item_desc, lotDim, qty_stock, lnote, lord_rif, LA, LU, PZ, IDlot_new, rowCutOrd_rif, wdesc, wldesc, cut_wldesc, step_roll, step_roll_order, substring(convert(varchar, date_planned, 20),1,16) as date_planned, logo_on_prints")
                ->when($user->company->read_alternative_item_code, function($q){
                    $q->addSelect(DB::raw("NULLIF(p.altv_code, '') as altv_code, NULLIF(p.altv_desc, '') as altv_desc"));
                }, function($q){
                    $q->addSelect(DB::raw('altv_code = null, altv_desc = null'));
                })
                ->fromSub($sub, 'p')
                ->orderByDesc('step_roll')
                ->orderBy('step_roll_order')
                ->orderBy('IDcut')
                ->get();
        
        abort_if($data->isEmpty(), 404);

        return $data;
    }

    public function generate()
    {
        $data = $this->getData();
      
        $this->SetSubject('Cutting order');

        // set style for barcode
        $style = [
            'border' => 2,
            'vpadding' => 'auto',
            'hpadding' => 'auto',
            'fgcolor' => array(0,0,0),
            'bgcolor' => false, //array(255,255,255)
            'module_width' => 1, // width of a single module in points
            'module_height' => 1 // height of a single module in points
        ];

	    $this->SetFont('helvetica', 'BI', 11);
        
        $la = array();
        $lu = array();
        $pz = array();
        $IDlotNew = array();
        $rowCutOrd_rif = array();
        $cut_wldesc = array();
        $step_roll = array();
        $step_roll_order = array();
        $sqlCount = 0;

        foreach($data as $d){
            $alt_item = null;

            if($d->altv_code){
                $alt_item = " (".$d->altv_code." - ".$d->altv_desc.")";
            }
			
            $logo = $d->logo_on_prints;
            /* Testata (info del lotto che viene tagliato) */	
            $IDlot = $d->IDlot;
            $item = $d->item;
            $item_desc = $d->item_desc;
            $lotDim = $d->lotDim;
            $qty_stock = $d->qty_stock;
            $wdesc = $d->wdesc;
            $wldesc = $d->wldesc;
		
            /* 2020-05-11 Adeguamento gestione timezone */
            $date_planned = "";

            if (trim($d->date_planned) != ''){
                $date_planned = Utility::convertDateFromTimezone($d->date_planned,'UTC', auth()->user()->clientTimezoneDB, 'Y-m-d');
            }		
            
            if ($d->executed == 0) {
                $order_state = 'Planned';
            }else{
                $order_state = 'Completed';
            }
            
            $lnote = $d->lnote;
            $lord_rif = $d->lord_rif;		
            
            /* Info dei tagli */
            array_push($la, $d->LA);
            array_push($lu, $d->LU);
            array_push($pz, $d->PZ);
            array_push($IDlotNew, $d->IDlot_new);
            array_push($rowCutOrd_rif, $d->rowCutOrd_rif);	
            array_push($cut_wldesc, $d->cut_wldesc);
            array_push($step_roll, $d->step_roll);
            array_push($step_roll_order, $d->step_roll_order);

            $sqlCount++;
        }

        // add a page
        $this->AddPage('P', 'A4');
            
        // set JPEG quality
        $this->setJPEGQuality(75);

        list(, $w, $h) = explode('_', pathinfo($logo, PATHINFO_FILENAME));
        
        $this->Image(public_path('storage/img/logos/'.$logo), 7, 7, $w, $h, '', '', 'T', false, 300, '', false, false, 0, false, false, false);
        
        if ($sqlCount == 0){
            $this->Text(7, 30,  'Lot not found on cutting order ...');
        }else{	
            $this->Text(7, 20,  'CUTTING ORDER: '.$IDlot);
            
            $this->Text(102, 15,  'Planned date: '.$date_planned);
            $this->Text(102, 20,  'Order status: '.$order_state);
                
            // -------------------------------------------------------------------
            // DATAMATRIX (ISO/IEC 16022:2006)
            $this->write2DBarcode($IDlot, 'DATAMATRIX', 8, 30, 30, 30, $style, 'N');
                    
            /* Testata (info del lotto che viene tagliato) */
            $this->Text(45, 30,  'ITM:  '.$item.' '.$item_desc.''.$alt_item);
            $this->Text(45, 35,  'DIM:  '.$lotDim);
            $this->Text(45, 40,  'QTY:  '.$qty_stock.' m2');			
            $this->Text(45, 45,  'WHS:  '.$wdesc.' - '.$wldesc);		
            $this->Text(45, 50,  'TXT:  '.$lnote);
            $this->Text(45, 55,  'REF:  '.$lord_rif);
                    
            /* Indici usati per l'avanzamento delle righe */		
            global $previusPage;						
            global $shiftBotton; 				
            global $startIndex_x_LA; 
            global $startIndex_x_LU; 		
            global $startIndex_x_PZ;		
            global $startIndex_x_ST;
            global $startIndex_x_M2;
            global $startIndex_x_LC;
            global $startIndex_x_OR1;
            global $startIndex_x_OR2;
            global $startIndex_x_ROW;
            
            $previusPage = 1;
            $shiftBotton = 0;
            $startIndex_x_LA = 75;		
            $startIndex_x_LU = 75;
            $startIndex_x_PZ = 75;
            $startIndex_x_ST = 75;	
            $startIndex_x_M2 = 75;						
            $startIndex_x_LC = 80;
            $startIndex_x_OR1 = 75;
            $startIndex_x_OR2 = 80;
            $startIndex_x_ROW = 85;
            
            $this->SetFont('helvetica', 'BI', 11);
                
            $this->Text(5, 66, 'Width');
            $this->Text(18, 66, 'Length');
            $this->Text(38, 66, 'P');
            $this->Text(48, 66, 'SR');		
                
            $this->printTableFooter();
            $this->Footer();
            
            $this->SetFont('helvetica', 'BI', 10);			
            
            for($i=0;$i<$sqlCount;$i++){	
                if ($this->checkChangePage($startIndex_x_ROW + $shiftBotton)) 	{
                    $this->AddPage('P', 'A4');
                    $this->Footer();
                    
                    $this->SetFont('helvetica', 'BI', 11);
                    $this->Text(5, 10, 'Width');
                    $this->Text(18, 10, 'Length');
                    $this->Text(38, 10, 'P');
                    $this->Text(48, 10, 'SR');	
                    $this->printTableFooter(); 
                    $this->SetFont('helvetica', 'BI', 10);
                }
                    
                $step = '';
                if($step_roll[$i]==1){$step='Yes/'.$step_roll_order[$i];}else{$step='No';}
                
                /* 75 */
                $this->Text(5,  $startIndex_x_LA + $shiftBotton, round($la[$i],4)); 
                $this->Text(18, $startIndex_x_LU + $shiftBotton, round($lu[$i],4));			
                $this->Text(38, $startIndex_x_PZ + $shiftBotton, $pz[$i]);	
                $this->Text(48, $startIndex_x_ST + $shiftBotton, $step);
                $this->Text(62, $startIndex_x_M2 + $shiftBotton , 'm2: '.round(($la[$i]*$lu[$i]*$pz[$i]/1000000),4));
                $this->Text(102, $startIndex_x_OR1 + $shiftBotton, 'Ord. ref: '.substr($rowCutOrd_rif[$i],0,40));

                /* 80 */
                $this->Text(62, $startIndex_x_LC + $shiftBotton, 'Loc: '.$cut_wldesc[$i]);
                $this->Text(102, $startIndex_x_OR2 + $shiftBotton, substr($rowCutOrd_rif[$i],40, 50));
                
                /* 85 */
                $style = array('width' => 0.2, 'cap' => 'butt', 'join' => 'miter', 'dash' => 0, 'color' => array(0, 0, 0));
                $this->Line(5, $startIndex_x_ROW + $shiftBotton, 200, $startIndex_x_ROW + $shiftBotton, $style); /*Line( $x1, $y1, $x2, $y2, $style = array() )*/
                                        
                $shiftBotton = $shiftBotton + 12 ; 				/* Ad ogni ciclo sposto la stampa di 10 verso il basso */
            }
        }

        return $this->Output('cutting_order.pdf', 'S');
    }

    private function checkChangePage($currentPosition) 
	{
		global $previusPage;
		global $shiftBotton;
		global $startIndex_x_LA;
		global $startIndex_x_LU;
		global $startIndex_x_PZ;			
		global $startIndex_x_ST;				
		global $startIndex_x_M2;				
		global $startIndex_x_LC;
		global $startIndex_x_OR1;
		global $startIndex_x_OR2;
		global $startIndex_x_ROW;	
		
		/* Eseguiamo il cambio pagina, questo punto è 
		sostanzialmente poco prima dell'inizio della tabellina 
		da compilare a mano (la funzione in alto) */
		if($currentPosition >= 245) {		
			// $previusPage = $currentPage;
		
			$shiftBotton = 0;
		
			$startIndex_x_LA = 15;
			$startIndex_x_LU = 15;
			$startIndex_x_PZ = 15;			
			$startIndex_x_ST = 15;				
			$startIndex_x_M2 = 15;				
			$startIndex_x_LC = 20;
			$startIndex_x_OR1 = 15;
			$startIndex_x_OR2 = 20;
			$startIndex_x_ROW = 25;		
			
			return true;
		}else{
			return false;	
		}	
	}

}