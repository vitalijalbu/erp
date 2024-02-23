<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link href="https://cdn.datatables.net/1.13.4/css/jquery.dataTables.min.css" rel="stylesheet">
</head>
<body>

    <table id="aa" class="display" style="width:100%">
        <thead>
            <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Office</th>
                <th>Age</th>
                <th>Start date</th>
                <th>Salary</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Tiger Nixon</td>
                <td>System Architect</td>
                <td>Edinburgh</td>
                <td>61</td>
                <td>2011-04-25</td>
                <td>$320,800</td>
            </tr>
            <tr>
                <td>Garrett Winters</td>
                <td>Accountant</td>
                <td>Tokyo</td>
                <td>63</td>
                <td>2011-07-25</td>
                <td>$170,750</td>
            </tr>
            <tr>
                <td>Ashton Cox</td>
                <td>Junior Technical Author</td>
                <td>San Francisco</td>
                <td>66</td>
                <td>2009-01-12</td>
                <td>$86,000</td>
            </tr>
            <tr>
                <td>Cedric Kelly</td>
                <td>Senior Javascript Developer</td>
                <td>Edinburgh</td>
                <td>22</td>
                <td>2012-03-29</td>
                <td>$433,060</td>
            </tr>
            <tr>
                <td>Airi Satou</td>
                <td>Accountant</td>
                <td>Tokyo</td>
                <td>33</td>
                <td>2008-11-28</td>
                <td>$162,700</td>
            </tr>
            <tr>
                <td>Brielle Williamson</td>
                <td>Integration Specialist</td>
                <td>New York</td>
                <td>61</td>
                <td>2012-12-02</td>
                <td>$372,000</td>
            </tr>
            <tr>
                <td>Herrod Chandler</td>
                <td>Sales Assistant</td>
                <td>San Francisco</td>
                <td>59</td>
                <td>2012-08-06</td>
                <td>$137,500</td>
            </tr>
            <tr>
                <td>Rhona Davidson</td>
                <td>Integration Specialist</td>
                <td>Tokyo</td>
                <td>55</td>
                <td>2010-10-14</td>
                <td>$327,900</td>
            </tr>
            <tr>
                <td>Colleen Hurst</td>
                <td>Javascript Developer</td>
                <td>San Francisco</td>
                <td>39</td>
                <td>2009-09-15</td>
                <td>$205,500</td>
            </tr>
        </tbody>
    </table>
    

    <script src="https://code.jquery.com/jquery-3.6.4.min.js" integrity="sha256-oP6HI9z1XaZNBrJURtCoUT5SUnxFr8s3BzRl+cbzUq8=" crossorigin="anonymous"></script>
    <script src="https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js"></script>
    <script>
        $(document).ready(function () {
    
            
            $('#aa thead tr')
            .clone(true)
            .addClass('filters')
            .appendTo('#aa thead');
        $('#aa thead .filters th').each(function(i) {
            // if(i != 12){
                var title = $(this).text();
                $(this).html('<input type="text" placeholder="Cerca ' + title + '" />');
            // }else{
            //     $(this).html('<input type="text" placeholder="Ricerca disabilitata" disabled />');
            // }
           
        });


            var table = $('#aa').DataTable({
            processing: true,
            // orderCellsTop: true,
            serverSide: true,
            searchDelay: 300,
            responsive: true,
            // columnDefs: [{
            //         // targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,12,13,14],
            //         targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            //         className: "desktop"
            //     },
            //     {
            //         targets: [3, 4, 5, 10, 11],
            //         className: "mobile"
            //     },
            //     {
            //         targets: [3, 4, 5, 10, 11],
            //         className: "tablet"
            //     },
            // ],
            pageLength: 10,
            autoWidth: true,
            scrollX: true,
            ordering: true,
            searching: true,
            // language: {
            //     "url": "https://fibra.andreailici.it/vendor/datatables/lang/ita.json",
            // },
            // initComplete: function() {
            //     var api = this.api();
               
            //     hideSearchInputs(api.columns().responsiveHidden().toArray())
                
            //     api.columns()
            //         .eq(0)
            //         .each(function(colIdx) {
            //             if(colIdx != 12){
            //                 $('input',
            //                 $('.filters th').eq($(api.column(colIdx).header()).index())
            //                 ).on('keyup change clear', function() {
            //                     if (api.column(colIdx).search() !== this.value) {
            //                         api.column(colIdx).search(this.value).draw();
            //                     }
            //                 });
            //             }
                       
            //         });
            // },
            // lengthMenu: [
            //         [1000, 2500, 5000, -1],
            //         [1000, 2500, 5000, 'All'],
            //     ],
            ajax: {
                url: 'http://localhost:8088/dati',
                // data: {
                    
                //                                                                                                                                                                     'alias' : '1', 
                //                                                             },
                
            },
            // columns: [
            //     {
            //         data: 'provincia',
            //         name: 'r_provincia.nome'
            //     },
            //     {
            //         data: 'comune',
            //         name: 'r_comune.nome'
            //     },
            //     {
            //         data: 'frazione',
            //         name: 'frazione'
            //     },
            //     {
            //         data: 'particella_top',
            //         name: 'particella_top'
            //     },
            //     {
            //         data: 'indirizzo',
            //         name: 'indirizzo'
            //     },
            //     {
            //         data: 'civico',
            //         name: 'civico'
            //     },
            //     {
            //         data: 'scala_palazzina',
            //         name: 'scala_palazzina'
            //     },
            //     {
            //         data: 'id_building',
            //         name: 'id_building'
            //     },
            //     {
            //         data: 'coordinate_building',
            //         name: 'coordinate_building'
            //     },
            //     {
            //         data: 'pop',
            //         name: 'pop'
            //     },
            //     {
            //         data: 'totale_ui',
            //         name: 'totale_ui'
            //     },
            //     {
            //         data: 'stato_ui',
            //         name: 'stato_ui'
            //     },
            //     {
            //         data: 'operatore',
            //         name: 'operatore',
            //         searchable: false,
            //         orderable:false
            //     },
                
            // ],
            // 'rowCallback': function(row, data, index){
            //     if($(row).hasClass('espletato')){
            //         if($(row).hasClass('tiscali')){
            //             $(row).find('td:eq(5)').css('background', '#5e56a3').css('color', '#fff');
            //         }else{
            //             $(row).find('td:eq(5)').css('background', '#964b00 ').css('color', '#fff');
            //         }
                    
            //     }
            // }
          
        });


});
    </script>
</body>
</html>