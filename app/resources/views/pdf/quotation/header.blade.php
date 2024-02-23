<table style="table-layout:fixed; width:100%; padding:0 50px;">
    <tr>
        <td align="left" valign="top" style="width:50%;">
        
            <img src="{{ 'data:image/gif;base64,'.base64_encode(file_get_contents(storage_path('app/public/img/logos/' . str_replace('img/', '', $sale->company->logo_on_prints)))) }}" style="width:200px;">
            <p style="font-size:14px; margin-left:10px;">
                Chiorino America<br>
                255 Satellite Blvd NE<br>
                Suite 100<br>
                Suwanee, GA 30024
            </p>
        </td>
        <td align="right" valign="top" style="width:50%;">
            <h2 style="margin: 0;">QUOTATION</h2>
            <p style="font-size:12px;"><strong>Quote Number:</strong><br> {{ $sale->code }}</p>
            <p style="font-size:12px;"><strong>Quote Date:</strong><br> {{ $sale->created_at->format('M j, Y') }}
            </p>
        </td>
    </tr>
</table>