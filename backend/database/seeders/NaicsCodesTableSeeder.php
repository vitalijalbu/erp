<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NaicsCodesTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        DB::table('naics_codes')->delete();
        
        DB::table('naics_codes')->insert(array (
            0 => 
            array (
                'id' => '01',
            'description' => 'AGRICULTURE (ONLY FOR THE HARVESTING AND PRODUCTION - EXCLUDING PACKING)',
                'parent_id' => NULL,
                'level' => '1',
            ),
            1 => 
            array (
                'id' => '01-01',
                'description' => 'CROPS',
                'parent_id' => '01',
                'level' => '2',
            ),
            2 => 
            array (
                'id' => '01-02',
                'description' => 'VEGETABLES',
                'parent_id' => '01',
                'level' => '2',
            ),
            3 => 
            array (
                'id' => '01-03',
                'description' => 'FRUITS',
                'parent_id' => '01',
                'level' => '2',
            ),
            4 => 
            array (
                'id' => '01-04',
            'description' => 'FLOWERS ( GREENHOUSES )',
                'parent_id' => '01',
                'level' => '2',
            ),
            5 => 
            array (
                'id' => '02',
                'description' => 'FISHING',
                'parent_id' => NULL,
                'level' => '1',
            ),
            6 => 
            array (
                'id' => '03',
                'description' => 'FOOD INDUSTRY',
                'parent_id' => NULL,
                'level' => '1',
            ),
            7 => 
            array (
                'id' => '03-01',
                'description' => 'MEAT AND FISH PROCESSING',
                'parent_id' => '03',
                'level' => '2',
            ),
            8 => 
            array (
                'id' => '03-01-01',
                'description' => 'ANIMAL SLAUGHTERING AND PROCES',
                'parent_id' => '03-01',
                'level' => '3',
            ),
            9 => 
            array (
                'id' => '03-01-02',
                'description' => 'POULTRY PROCESSING',
                'parent_id' => '03-01',
                'level' => '3',
            ),
            10 => 
            array (
                'id' => '03-01-03',
                'description' => 'FRESH AND FROZEN SEAFOOD PROCE',
                'parent_id' => '03-01',
                'level' => '3',
            ),
            11 => 
            array (
                'id' => '03-01-04',
                'description' => 'PETFOOD MANUFACTURING',
                'parent_id' => '03-01',
                'level' => '3',
            ),
            12 => 
            array (
                'id' => '03-01-05',
                'description' => 'SAUSAGE / SLICED MEAT',
                'parent_id' => '03-01',
                'level' => '3',
            ),
            13 => 
            array (
                'id' => '03-02',
                'description' => 'DAIRY PRODUCTS MANUFACTURING',
                'parent_id' => '03',
                'level' => '2',
            ),
            14 => 
            array (
                'id' => '03-02-01',
                'description' => 'CHEESE',
                'parent_id' => '03-02',
                'level' => '3',
            ),
            15 => 
            array (
                'id' => '03-02-02',
                'description' => 'ICE CREAMS',
                'parent_id' => '03-02',
                'level' => '3',
            ),
            16 => 
            array (
                'id' => '03-02-03',
                'description' => 'OTHER DAIRY PRODUCTS',
                'parent_id' => '03-02',
                'level' => '3',
            ),
            17 => 
            array (
                'id' => '03-03',
                'description' => 'FRUITS AND VEGETABLES PROCESSI',
                'parent_id' => '03',
                'level' => '2',
            ),
            18 => 
            array (
                'id' => '03-03-01',
                'description' => 'FRUITS AND VEGETABLES CANNING',
                'parent_id' => '03-03',
                'level' => '3',
            ),
            19 => 
            array (
                'id' => '03-03-02',
                'description' => 'FRESH FRUITS AND VEGETABLES PR',
                'parent_id' => '03-03',
                'level' => '3',
            ),
            20 => 
            array (
                'id' => '03-03-03',
                'description' => 'FRUITS AND VEGETABLES PRESERVI',
                'parent_id' => '03-03',
                'level' => '3',
            ),
            21 => 
            array (
                'id' => '03-04',
                'description' => 'FLOUR MILLING',
                'parent_id' => '03',
                'level' => '2',
            ),
            22 => 
            array (
                'id' => '03-05',
                'description' => 'BAKERIES',
                'parent_id' => '03',
                'level' => '2',
            ),
            23 => 
            array (
                'id' => '03-05-01',
                'description' => 'BREAD MANUFACTURING',
                'parent_id' => '03-05',
                'level' => '3',
            ),
            24 => 
            array (
                'id' => '03-05-02',
                'description' => 'FROZEN CAKES, PIZZA, PASTRY',
                'parent_id' => '03-05',
                'level' => '3',
            ),
            25 => 
            array (
                'id' => '03-05-03',
                'description' => 'BISCUIT (COOKIE AND CRACKER MA',
                    'parent_id' => '03-05',
                    'level' => '3',
                ),
                26 => 
                array (
                    'id' => '03-05-04',
                    'description' => 'SNACKFOODS MANUFACTURING',
                    'parent_id' => '03-05',
                    'level' => '3',
                ),
                27 => 
                array (
                    'id' => '03-05-05',
                    'description' => 'PIZZA',
                    'parent_id' => '03-05',
                    'level' => '3',
                ),
                28 => 
                array (
                    'id' => '03-06',
                    'description' => 'CONFECTIONERY AND CHOCOLATE MA',
                    'parent_id' => '03',
                    'level' => '2',
                ),
                29 => 
                array (
                    'id' => '03-06-01',
                    'description' => 'CHOCOLATE CONFECTIONERY',
                    'parent_id' => '03-06',
                    'level' => '3',
                ),
                30 => 
                array (
                    'id' => '03-06-02',
                    'description' => 'NON-CHOCOLATE CONFECTIONERY',
                    'parent_id' => '03-06',
                    'level' => '3',
                ),
                31 => 
                array (
                    'id' => '03-06-03',
                    'description' => 'MOULDED CHOCOLATE CONFECTIONERY',
                    'parent_id' => '03-06',
                    'level' => '3',
                ),
                32 => 
                array (
                    'id' => '03-07',
                    'description' => 'MISCELLANEOUS FOOD PRODUCTS MA',
                    'parent_id' => '03',
                    'level' => '2',
                ),
                33 => 
                array (
                    'id' => '03-07-01',
                    'description' => 'DRY PASTA MANUFACTURING',
                    'parent_id' => '03-07',
                    'level' => '3',
                ),
                34 => 
                array (
                    'id' => '03-07-02',
                    'description' => 'OTHERS',
                    'parent_id' => '03-07',
                    'level' => '3',
                ),
                35 => 
                array (
                    'id' => '03-08',
                    'description' => 'BEVERAGE MANUFACTURING',
                    'parent_id' => '03',
                    'level' => '2',
                ),
                36 => 
                array (
                    'id' => '04',
                    'description' => 'TOBACCO PRODUCTS MANUFACTURING',
                    'parent_id' => NULL,
                    'level' => '1',
                ),
                37 => 
                array (
                    'id' => '05',
                    'description' => 'TEXTILE',
                    'parent_id' => NULL,
                    'level' => '1',
                ),
                38 => 
                array (
                    'id' => '05-01',
                    'description' => 'YARN SPINNING MILLS',
                    'parent_id' => '05',
                    'level' => '2',
                ),
                39 => 
                array (
                    'id' => '05-02',
                    'description' => 'YARN TEXTURIZING AND TWISTING',
                    'parent_id' => '05',
                    'level' => '2',
                ),
                40 => 
                array (
                    'id' => '05-03',
                    'description' => 'FABRIC MILLS',
                    'parent_id' => '05',
                    'level' => '2',
                ),
                41 => 
                array (
                    'id' => '05-04',
                    'description' => 'FABRIC FINISHING MILLS',
                    'parent_id' => '05',
                    'level' => '2',
                ),
                42 => 
                array (
                    'id' => '05-05',
                    'description' => 'KNITTED FABRIC MILLS',
                    'parent_id' => '05',
                    'level' => '2',
                ),
                43 => 
                array (
                    'id' => '05-06',
                    'description' => 'CARPET MILLS',
                    'parent_id' => '05',
                    'level' => '2',
                ),
                44 => 
                array (
                    'id' => '05-07',
                    'description' => 'OTHER TEXTILE PRODUCTS',
                    'parent_id' => '05',
                    'level' => '2',
                ),
                45 => 
                array (
                    'id' => '05-08',
                    'description' => 'NON-WOVEN FABRIC MILLS',
                    'parent_id' => '05',
                    'level' => '2',
                ),
                46 => 
                array (
                    'id' => '05-09',
                    'description' => 'APPAREL MANUFACTURERS AND FABR',
                    'parent_id' => '05',
                    'level' => '2',
                ),
                47 => 
                array (
                    'id' => '05-10',
                    'description' => 'TEXTILE PRINTING',
                    'parent_id' => '05',
                    'level' => '2',
                ),
                48 => 
                array (
                    'id' => '05-10-01',
                    'description' => 'FLAT SCREEN PRINTING',
                    'parent_id' => '05-10',
                    'level' => '3',
                ),
                49 => 
                array (
                    'id' => '05-10-02',
                    'description' => 'ROTARY SCREEN PRINTING',
                    'parent_id' => '05-10',
                    'level' => '3',
                ),
                50 => 
                array (
                    'id' => '05-10-03',
                    'description' => 'DIGITAL PRINTING',
                    'parent_id' => '05-10',
                    'level' => '3',
                ),
                51 => 
                array (
                    'id' => '06',
                    'description' => 'WOOD PRODUCT MANUFACTURING',
                    'parent_id' => NULL,
                    'level' => '1',
                ),
                52 => 
                array (
                    'id' => '06-01',
                    'description' => 'HARDWOOD SAWMILLS',
                    'parent_id' => '06',
                    'level' => '2',
                ),
                53 => 
                array (
                    'id' => '06-01-01',
                    'description' => 'SAWMILLS',
                    'parent_id' => '06-01',
                    'level' => '3',
                ),
                54 => 
                array (
                    'id' => '06-01-02',
                    'description' => 'HARDWOOD FLOORING',
                    'parent_id' => '06-01',
                    'level' => '3',
                ),
                55 => 
                array (
                    'id' => '06-01-03',
                    'description' => 'OTHER HARDWOOD PRODUCTS',
                    'parent_id' => '06-01',
                    'level' => '3',
                ),
                56 => 
                array (
                    'id' => '06-02',
                    'description' => 'VENEERING AND PLYWOOD',
                    'parent_id' => '06',
                    'level' => '2',
                ),
                57 => 
                array (
                    'id' => '06-03',
                    'description' => 'PARTICLE BOARD AND MDF BOARDS',
                    'parent_id' => '06',
                    'level' => '2',
                ),
                58 => 
                array (
                    'id' => '06-04',
                    'description' => 'WOOD CONTAINER AND PALLETS',
                    'parent_id' => '06',
                    'level' => '2',
                ),
                59 => 
                array (
                    'id' => '06-05',
                    'description' => 'HOME FURNITURE MANUFACTURING',
                    'parent_id' => '06',
                    'level' => '2',
                ),
                60 => 
                array (
                    'id' => '06-06',
                    'description' => 'OTHER WOOD PRODUCTS',
                    'parent_id' => '06',
                    'level' => '2',
                ),
                61 => 
                array (
                    'id' => '06-07',
                'description' => 'THERMOFORMING (PADS)',
                    'parent_id' => '06',
                    'level' => '2',
                ),
                62 => 
                array (
                    'id' => '06-08',
                    'description' => 'WOOD VARNISHING',
                    'parent_id' => '06',
                    'level' => '2',
                ),
                63 => 
                array (
                    'id' => '07',
                    'description' => 'PAPER MANUFACTURING',
                    'parent_id' => NULL,
                    'level' => '1',
                ),
                64 => 
                array (
                    'id' => '07-01',
                    'description' => 'PULP AND PAPER MILLS',
                    'parent_id' => '07',
                    'level' => '2',
                ),
                65 => 
                array (
                    'id' => '07-02',
                    'description' => 'BOX FOLDING/CASE MAKERS',
                    'parent_id' => '07',
                    'level' => '2',
                ),
                66 => 
                array (
                    'id' => '07-02-01',
                    'description' => 'CORRUGATED BOX MANUFACTURING',
                    'parent_id' => '07-02',
                    'level' => '3',
                ),
                67 => 
                array (
                    'id' => '07-02-02',
                    'description' => 'PAPERBOARD BOX FOLDING',
                    'parent_id' => '07-02',
                    'level' => '3',
                ),
                68 => 
                array (
                    'id' => '07-03',
                    'description' => 'OTHER CONVERTED PAPER PRODUCTS',
                    'parent_id' => '07',
                    'level' => '2',
                ),
                69 => 
                array (
                    'id' => '07-03-01',
                    'description' => 'PAPER TUBES MANUF.',
                    'parent_id' => '07-03',
                    'level' => '3',
                ),
                70 => 
                array (
                    'id' => '07-03-02',
                'description' => 'STATIONERY PRODUCTS (OFFICE)',
                    'parent_id' => '07-03',
                    'level' => '3',
                ),
                71 => 
                array (
                    'id' => '07-03-03',
                    'description' => 'PAPER BAGS AND COATED PAPER',
                    'parent_id' => '07-03',
                    'level' => '3',
                ),
                72 => 
                array (
                    'id' => '07-03-04',
                    'description' => 'SURFACE COVERED PAPERBOARD',
                    'parent_id' => '07-03',
                    'level' => '3',
                ),
                73 => 
                array (
                    'id' => '07-03-05',
                    'description' => 'ENVELOPE MANUFACTURING',
                    'parent_id' => '07-03',
                    'level' => '3',
                ),
                74 => 
                array (
                    'id' => '07-03-06',
                    'description' => 'OTHER CONVERTED PAPER PRODUCTS',
                    'parent_id' => '07-03',
                    'level' => '3',
                ),
                75 => 
                array (
                    'id' => '07-04',
                    'description' => 'TISSUE AND SANITARY PAPER MANU',
                    'parent_id' => '07',
                    'level' => '2',
                ),
                76 => 
                array (
                    'id' => '08',
                    'description' => 'PRINTING INDUSTRY',
                    'parent_id' => NULL,
                    'level' => '1',
                ),
                77 => 
                array (
                    'id' => '08-01',
                    'description' => 'NEWSPAPER OFFSET (LITHOGRAPHIC',
                        'parent_id' => '08',
                        'level' => '2',
                    ),
                    78 => 
                    array (
                        'id' => '08-02',
                        'description' => 'MAGAZINE OFFSET WEB PRINTING',
                        'parent_id' => '08',
                        'level' => '2',
                    ),
                    79 => 
                    array (
                        'id' => '08-03',
                        'description' => 'COMMERCIAL LITHOGRAPHIC PRINTI',
                        'parent_id' => '08',
                        'level' => '2',
                    ),
                    80 => 
                    array (
                        'id' => '08-04',
                        'description' => 'BOOK PRINTING AND BINDING',
                        'parent_id' => '08',
                        'level' => '2',
                    ),
                    81 => 
                    array (
                        'id' => '08-05',
                        'description' => 'OTHER PRINTING',
                        'parent_id' => '08',
                        'level' => '2',
                    ),
                    82 => 
                    array (
                        'id' => '09',
                        'description' => 'PACKAGING',
                        'parent_id' => NULL,
                        'level' => '1',
                    ),
                    83 => 
                    array (
                        'id' => '10',
                    'description' => 'SUPERMARKETS (CHECKOUT STANDS)',
                        'parent_id' => NULL,
                        'level' => '1',
                    ),
                    84 => 
                    array (
                        'id' => '11',
                    'description' => 'AIRPORT (BAGGAGE HANDLING)',
                        'parent_id' => NULL,
                        'level' => '1',
                    ),
                    85 => 
                    array (
                        'id' => '12',
                    'description' => 'LOGISTICS (WAREHOUSE AUTOMATION, EXCEPT PARCELS)',
                        'parent_id' => NULL,
                        'level' => '1',
                    ),
                    86 => 
                    array (
                        'id' => '13',
                    'description' => 'POST OFFICE  (LETTERS AND PARCELS SORTING,PTT)',
                        'parent_id' => NULL,
                        'level' => '1',
                    ),
                    87 => 
                    array (
                        'id' => '14',
                        'description' => 'INDIPENDENT PARCEL SERVICES SORTING WAREHOUSES',
                        'parent_id' => NULL,
                        'level' => '1',
                    ),
                    88 => 
                    array (
                        'id' => '15',
                    'description' => 'GYMNASIUMS  (RECREATIONAL AND MEDICAL,TREADMILLS)',
                        'parent_id' => NULL,
                        'level' => '1',
                    ),
                    89 => 
                    array (
                        'id' => '16',
                        'description' => 'BOWLING',
                        'parent_id' => NULL,
                        'level' => '1',
                    ),
                    90 => 
                    array (
                        'id' => '17',
                        'description' => 'CHEMICAL MANUFACTURING',
                        'parent_id' => NULL,
                        'level' => '1',
                    ),
                    91 => 
                    array (
                        'id' => '17-01',
                        'description' => 'SYNTHETIC FIBRE MANUFACTURING',
                        'parent_id' => '17',
                        'level' => '2',
                    ),
                    92 => 
                    array (
                        'id' => '17-02',
                        'description' => 'PHARMACEUTICAL PRODUCT MANUFAC',
                        'parent_id' => '17',
                        'level' => '2',
                    ),
                    93 => 
                    array (
                        'id' => '17-03',
                        'description' => 'SOAP AND CLEANING COMPOUND MAN',
                        'parent_id' => '17',
                        'level' => '2',
                    ),
                    94 => 
                    array (
                        'id' => '17-04',
                        'description' => 'OTHER CHEMICAL PRODUCTS MANUFA',
                        'parent_id' => '17',
                        'level' => '2',
                    ),
                    95 => 
                    array (
                        'id' => '18',
                        'description' => 'PLASTIC AND RUBBER PRODUCTS MANUFACTURING',
                        'parent_id' => NULL,
                        'level' => '1',
                    ),
                    96 => 
                    array (
                        'id' => '18-01',
                        'description' => 'TYRES MANUFACTURING',
                        'parent_id' => '18',
                        'level' => '2',
                    ),
                    97 => 
                    array (
                        'id' => '18-02',
                        'description' => 'CABLES',
                        'parent_id' => '18',
                        'level' => '2',
                    ),
                    98 => 
                    array (
                        'id' => '18-03',
                        'description' => 'DIE-CUTTING OF PLASTIC AND RUB',
                        'parent_id' => '18',
                        'level' => '2',
                    ),
                    99 => 
                    array (
                        'id' => '18-04',
                        'description' => 'PLASTIC PRODUCTS BY INJECTION',
                        'parent_id' => '18',
                        'level' => '2',
                    ),
                    100 => 
                    array (
                        'id' => '18-05',
                        'description' => 'OTHER PLASTIC AND RUBBER PRODU',
                        'parent_id' => '18',
                        'level' => '2',
                    ),
                    101 => 
                    array (
                        'id' => '19',
                        'description' => 'LEATHER PRODUCTS MANUFACTURING',
                        'parent_id' => NULL,
                        'level' => '1',
                    ),
                    102 => 
                    array (
                        'id' => '19-01',
                        'description' => 'LEATHER TANNING AND FINISHING',
                        'parent_id' => '19',
                        'level' => '2',
                    ),
                    103 => 
                    array (
                        'id' => '19-02',
                        'description' => 'FOOTWEAR MANUFACTURING',
                        'parent_id' => '19',
                        'level' => '2',
                    ),
                    104 => 
                    array (
                        'id' => '19-03',
                        'description' => 'ALL OTHER LEATHER PRODUCTS MAN',
                        'parent_id' => '19',
                        'level' => '2',
                    ),
                    105 => 
                    array (
                        'id' => '20',
                        'description' => 'GLASS PRODUCTS MANUFACTURING',
                        'parent_id' => NULL,
                        'level' => '1',
                    ),
                    106 => 
                    array (
                        'id' => '20-01',
                        'description' => 'GLASS PRODUCTS MANUFACTURING',
                        'parent_id' => '20',
                        'level' => '2',
                    ),
                    107 => 
                    array (
                        'id' => '20-02',
                        'description' => 'FIBREGLASS PRODUCTION AND CONV',
                        'parent_id' => '20',
                        'level' => '2',
                    ),
                    108 => 
                    array (
                        'id' => '21',
                        'description' => 'STONE, CLAY, CEMENT PRODUCTS MANUFACTURING',
                        'parent_id' => NULL,
                        'level' => '1',
                    ),
                    109 => 
                    array (
                        'id' => '21-01',
                        'description' => 'BRICK MANUFACTURING',
                        'parent_id' => '21',
                        'level' => '2',
                    ),
                    110 => 
                    array (
                        'id' => '21-02',
                        'description' => 'CERAMIC TILES MANUFACTURING',
                        'parent_id' => '21',
                        'level' => '2',
                    ),
                    111 => 
                    array (
                        'id' => '21-02-01',
                        'description' => 'ROTARY SCREEN DECORATION',
                        'parent_id' => '21-02',
                        'level' => '3',
                    ),
                    112 => 
                    array (
                        'id' => '21-02-02',
                        'description' => 'DIGITAL DECORATION',
                        'parent_id' => '21-02',
                        'level' => '3',
                    ),
                    113 => 
                    array (
                        'id' => '21-03',
                        'description' => 'CONCRETE BOARD FOR CONSTRUCTIO',
                        'parent_id' => '21',
                        'level' => '2',
                    ),
                    114 => 
                    array (
                        'id' => '21-04',
                        'description' => 'GYPSUM BOARDS MANUFACTURING',
                        'parent_id' => '21',
                        'level' => '2',
                    ),
                    115 => 
                    array (
                        'id' => '21-05',
                        'description' => 'MARBLE POLISHING',
                        'parent_id' => '21',
                        'level' => '2',
                    ),
                    116 => 
                    array (
                        'id' => '21-06',
                        'description' => 'MINERAL WOOL FOR INSULATION',
                        'parent_id' => '21',
                        'level' => '2',
                    ),
                    117 => 
                    array (
                        'id' => '21-07',
                        'description' => 'CEMENT PLANTS',
                        'parent_id' => '21',
                        'level' => '2',
                    ),
                    118 => 
                    array (
                        'id' => '21-08',
                        'description' => 'OTHERS',
                        'parent_id' => '21',
                        'level' => '2',
                    ),
                    119 => 
                    array (
                        'id' => '22',
                        'description' => 'PRIMARY METAL MANUFACTURING',
                        'parent_id' => NULL,
                        'level' => '1',
                    ),
                    120 => 
                    array (
                        'id' => '22-01',
                        'description' => 'STEEL AND FERROUS ALLOY MANUFA',
                        'parent_id' => '22',
                        'level' => '2',
                    ),
                    121 => 
                    array (
                        'id' => '22-02',
                        'description' => 'ALLUMINIUM PROFILES EXTRUSION',
                        'parent_id' => '22',
                        'level' => '2',
                    ),
                    122 => 
                    array (
                        'id' => '23',
                        'description' => 'FABRICATED METAL PRODUCTS MANUFACTURING',
                        'parent_id' => NULL,
                        'level' => '1',
                    ),
                    123 => 
                    array (
                        'id' => '23-01',
                        'description' => 'STEEL METAL WORK MANUFACTURING',
                        'parent_id' => '23',
                        'level' => '2',
                    ),
                    124 => 
                    array (
                        'id' => '23-02',
                        'description' => 'METAL CONTAINER PRODUCTION (CA',
                            'parent_id' => '23',
                            'level' => '2',
                        ),
                        125 => 
                        array (
                            'id' => '23-03',
                            'description' => 'AUTOMOTIVE INDUSTRY',
                            'parent_id' => '23',
                            'level' => '2',
                        ),
                        126 => 
                        array (
                            'id' => '23-04',
                            'description' => 'OTHER METAL PRODUCTS (HARDWARE',
                                'parent_id' => '23',
                                'level' => '2',
                            ),
                            127 => 
                            array (
                                'id' => '23-05',
                                'description' => 'METAL PRODUCT VARNISHING',
                                'parent_id' => '23',
                                'level' => '2',
                            ),
                            128 => 
                            array (
                                'id' => '24',
                                'description' => 'CONVEYOR MANUFACTURERS',
                                'parent_id' => NULL,
                                'level' => '1',
                            ),
                            129 => 
                            array (
                                'id' => '24-01',
                                'description' => 'CONVEYORS FOR AGRICULTURE',
                                'parent_id' => '24',
                                'level' => '2',
                            ),
                            130 => 
                            array (
                                'id' => '24-02',
                                'description' => 'CONVEYORS AND LINES FOR THE FO',
                                'parent_id' => '24',
                                'level' => '2',
                            ),
                            131 => 
                            array (
                                'id' => '24-03',
                                'description' => 'CONVEYORS FOR THE PHARMACEUTIC',
                                'parent_id' => '24',
                                'level' => '2',
                            ),
                            132 => 
                            array (
                                'id' => '24-04',
                                'description' => 'CONVEYORS FOR THE PLASTICS INJ',
                                'parent_id' => '24',
                                'level' => '2',
                            ),
                            133 => 
                            array (
                                'id' => '24-05',
                                'description' => 'CONVEYOR POWERED CURVES (BENDS',
                                    'parent_id' => '24',
                                    'level' => '2',
                                ),
                                134 => 
                                array (
                                    'id' => '24-06',
                                    'description' => 'GENERIC CONVEYORS MANUFACTURER',
                                    'parent_id' => '24',
                                    'level' => '2',
                                ),
                                135 => 
                                array (
                                    'id' => '24-07',
                                    'description' => 'BUCKET ELEVATORS',
                                    'parent_id' => '24',
                                    'level' => '2',
                                ),
                                136 => 
                                array (
                                    'id' => '25',
                                    'description' => 'INDUSTRIAL LAUNDRIES',
                                    'parent_id' => NULL,
                                    'level' => '1',
                                ),
                                137 => 
                                array (
                                    'id' => '26',
                                    'description' => 'WASTE TREATMENT',
                                    'parent_id' => NULL,
                                    'level' => '1',
                                ),
                                138 => 
                                array (
                                    'id' => '26-01',
                                    'description' => 'WASTE COLLECTION',
                                    'parent_id' => '26',
                                    'level' => '2',
                                ),
                                139 => 
                                array (
                                    'id' => '26-02',
                                    'description' => 'WASTE SORTING',
                                    'parent_id' => '26',
                                    'level' => '2',
                                ),
                                140 => 
                                array (
                                    'id' => '26-03',
                                    'description' => 'WASTE RECYCLING',
                                    'parent_id' => '26',
                                    'level' => '2',
                                ),
                                141 => 
                                array (
                                    'id' => '26-04',
                                    'description' => 'BOTTLES RECYCLING',
                                    'parent_id' => '26',
                                    'level' => '2',
                                ),
                                142 => 
                                array (
                                    'id' => '26-99',
                                    'description' => 'OTHER WASTE ACTIVITIES',
                                    'parent_id' => '26',
                                    'level' => '2',
                                ),
                                143 => 
                                array (
                                    'id' => '27',
                                    'description' => 'PHOTOVOLTAIC PANELS',
                                    'parent_id' => NULL,
                                    'level' => '1',
                                ),
                                144 => 
                                array (
                                    'id' => '95',
                                    'description' => 'OTHER MANUFACTURING INDUSTRIES',
                                    'parent_id' => NULL,
                                    'level' => '1',
                                ),
                                145 => 
                                array (
                                    'id' => '99',
                                    'description' => 'OTHER ACTIVITIES',
                                    'parent_id' => NULL,
                                    'level' => '1',
                                ),
                            ));
        
        
    }
}