<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        @page {
            width: 21cm;
            min-height: 29.7cm;
            margin-top:40mm;
            margin-bottom:30mm;
            margin-left: 50px;
            margin-right: 50px;
            background-color:#fff;
        }

        body {
            font-size: 12px;
        }

        table,
        table td,
        table th {
            border: 1px solid;
            padding: 10px
        }

        table tr td, table tr th {
            page-break-inside: avoid;
        }

    </style>
</head>

<body>
  
    <div style="margin:30px 0 30px 30px; ">
        <strong style="font-size:14px;">Quoted to:</strong><br>
        <p style="margin-left: 30px;">
            {{ $sale->bp->desc }}<br>
            @if($email)
            {{ implode(', ', $email) }}<br>
            @endif
            {!! implode(',<br>', $sale->bp->address->full_address) !!}
        </p>
    </div>

    
    <table
        style="table-layout:fixed; width: 100%; margin-top:20px; border: 1px solid #000; border-collapse: collapse; text-align:center;font-size:12px">
        <tr>
            <th style="width:30%">Customer ID</th>
            <th style="width:15%">Good Thru</th>
            <th style="width:35%">Payment Terms</th>
            <th style="width:20%">Sales Rep</th>
        </tr>
        <tr>
            <td>{{ $sale->bp->desc }}</td>
            <td style="white-space: nowrap;">{{ $sale->expires_at->format('Y-m-d') }}</td>
            <td>{{ $sale?->paymentMethod?->label . ' ' . $sale?->paymentTerm?->label }}</td>
            <td>{{ $sale?->externalContact->name }}</td>
        </tr>
    </table>

    <table
        style="table-layout:fixed; width: 100%; margin:20px 0 10px; border: 1px solid #000; border-collapse: collapse; text-align:center;font-size:12px">
        <thead>
            <tr>
                <th style="width:4%">Pos.</th>
                <th style="width:4%">Qty</th>
                <th style="width:10%">Part</th>
                <th style="width:60%">Description</th>
                <th style="width:11%">Unit Price</th>
                <th style="width:11%">Extension</th>
            </tr>
        </thead>
        
        @forelse ($sale->saleRows as $row)
            <tr>
                <td style="">{{$row->position}}</td>
                <td style="">{{ $row->quantity }}</td>
                <td style="word-break: break-all; word-wrap: break-word;">{{ $row->item->configuration && $row->item->baseItem ? $row->item->baseItem->item : $row->item->item}}</td>
                <td style="word-break: break-all; word-wrap: break-word; text-align:left;">{!! nl2br($row->item->long_description ?: $row->item->item_desc) !!}</td>
                <td style="">{{ \Illuminate\Support\Number::currency($row->final_price ?? 0, $sale?->currency->id) }}</td>
                <td style="">{{ \Illuminate\Support\Number::currency($row->total_final_price ?? 0, $sale?->currency->id) }}</td>
            </tr>
        @empty
        @endforelse
        <tr>
            <td colspan="4"></td>
            <td style="width:11%"><strong>Total</strong></td>
            <td style="width:11%">{{ \Illuminate\Support\Number::currency($sale->getTotalFinalPrice(), $sale?->currency->id)}}</td>
        </tr>
    </table>
           
</body>

</html>
