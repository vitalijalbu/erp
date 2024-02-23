<?php

namespace App\Pdf;

use setasign\Fpdi\Tcpdf\Fpdi;

abstract class PdfBase extends Fpdi {

    abstract protected function generate();

    abstract protected function getData();

    public function __construct()
    {
        parent::__construct();

        $this->SetCreator(PDF_CREATOR);
        $this->SetAuthor('Chiorino S.p.A');
        $this->SetTitle('CSM labels generator ');

        // remove default header/footer
        $this->setPrintHeader(false);
        $this->setPrintFooter(false);

        // set default monospaced font
        $this->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);

        // set margins
        $this->SetMargins(PDF_MARGIN_LEFT, PDF_MARGIN_TOP, PDF_MARGIN_RIGHT);

        // set auto page breaks
        $this->SetAutoPageBreak(false, PDF_MARGIN_BOTTOM);

        // set image scale factor
        $this->setImageScale(PDF_IMAGE_SCALE_RATIO);

        $this->SetFont('helvetica', 'BI', 12);
    }
}