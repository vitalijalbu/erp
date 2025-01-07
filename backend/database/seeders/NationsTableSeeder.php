<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NationsTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        

        DB::table('nations')->delete();
        
        DB::table('nations')->insert(array (
            0 => 
            array (
                'id' => 'AD',
                'name' => 'Andorra',
                'iso_alpha_3' => 'AND',
            ),
            1 => 
            array (
                'id' => 'AE',
            'name' => 'United Arab Emirates (the)',
                'iso_alpha_3' => 'ARE',
            ),
            2 => 
            array (
                'id' => 'AF',
                'name' => 'Afghanistan',
                'iso_alpha_3' => 'AFG',
            ),
            3 => 
            array (
                'id' => 'AG',
                'name' => 'Antigua and Barbuda',
                'iso_alpha_3' => 'ATG',
            ),
            4 => 
            array (
                'id' => 'AI',
                'name' => 'Anguilla',
                'iso_alpha_3' => 'AIA',
            ),
            5 => 
            array (
                'id' => 'AL',
                'name' => 'Albania',
                'iso_alpha_3' => 'ALB',
            ),
            6 => 
            array (
                'id' => 'AM',
                'name' => 'Armenia',
                'iso_alpha_3' => 'ARM',
            ),
            7 => 
            array (
                'id' => 'AO',
                'name' => 'Angola',
                'iso_alpha_3' => 'AGO',
            ),
            8 => 
            array (
                'id' => 'AQ',
                'name' => 'Antarctica',
                'iso_alpha_3' => 'ATA',
            ),
            9 => 
            array (
                'id' => 'AR',
                'name' => 'Argentina',
                'iso_alpha_3' => 'ARG',
            ),
            10 => 
            array (
                'id' => 'AS',
                'name' => 'American Samoa',
                'iso_alpha_3' => 'ASM',
            ),
            11 => 
            array (
                'id' => 'AT',
                'name' => 'Austria',
                'iso_alpha_3' => 'AUT',
            ),
            12 => 
            array (
                'id' => 'AU',
                'name' => 'Australia',
                'iso_alpha_3' => 'AUS',
            ),
            13 => 
            array (
                'id' => 'AW',
                'name' => 'Aruba',
                'iso_alpha_3' => 'ABW',
            ),
            14 => 
            array (
                'id' => 'AX',
                'name' => 'Åland Islands',
                'iso_alpha_3' => 'ALA',
            ),
            15 => 
            array (
                'id' => 'AZ',
                'name' => 'Azerbaijan',
                'iso_alpha_3' => 'AZE',
            ),
            16 => 
            array (
                'id' => 'BA',
                'name' => 'Bosnia and Herzegovina',
                'iso_alpha_3' => 'BIH',
            ),
            17 => 
            array (
                'id' => 'BB',
                'name' => 'Barbados',
                'iso_alpha_3' => 'BRB',
            ),
            18 => 
            array (
                'id' => 'BD',
                'name' => 'Bangladesh',
                'iso_alpha_3' => 'BGD',
            ),
            19 => 
            array (
                'id' => 'BE',
                'name' => 'Belgium',
                'iso_alpha_3' => 'BEL',
            ),
            20 => 
            array (
                'id' => 'BF',
                'name' => 'Burkina Faso',
                'iso_alpha_3' => 'BFA',
            ),
            21 => 
            array (
                'id' => 'BG',
                'name' => 'Bulgaria',
                'iso_alpha_3' => 'BGR',
            ),
            22 => 
            array (
                'id' => 'BH',
                'name' => 'Bahrain',
                'iso_alpha_3' => 'BHR',
            ),
            23 => 
            array (
                'id' => 'BI',
                'name' => 'Burundi',
                'iso_alpha_3' => 'BDI',
            ),
            24 => 
            array (
                'id' => 'BJ',
                'name' => 'Benin',
                'iso_alpha_3' => 'BEN',
            ),
            25 => 
            array (
                'id' => 'BL',
                'name' => 'Saint Barthélemy',
                'iso_alpha_3' => 'BLM',
            ),
            26 => 
            array (
                'id' => 'BM',
                'name' => 'Bermuda',
                'iso_alpha_3' => 'BMU',
            ),
            27 => 
            array (
                'id' => 'BN',
                'name' => 'Brunei Darussalam',
                'iso_alpha_3' => 'BRN',
            ),
            28 => 
            array (
                'id' => 'BO',
            'name' => 'Bolivia (Plurinational State of)',
                'iso_alpha_3' => 'BOL',
            ),
            29 => 
            array (
                'id' => 'BQ',
                'name' => 'Bonaire, Sint Eustatius and Saba',
                'iso_alpha_3' => 'BES',
            ),
            30 => 
            array (
                'id' => 'BR',
                'name' => 'Brazil',
                'iso_alpha_3' => 'BRA',
            ),
            31 => 
            array (
                'id' => 'BS',
            'name' => 'Bahamas (the)',
                'iso_alpha_3' => 'BHS',
            ),
            32 => 
            array (
                'id' => 'BT',
                'name' => 'Bhutan',
                'iso_alpha_3' => 'BTN',
            ),
            33 => 
            array (
                'id' => 'BV',
                'name' => 'Bouvet Island',
                'iso_alpha_3' => 'BVT',
            ),
            34 => 
            array (
                'id' => 'BW',
                'name' => 'Botswana',
                'iso_alpha_3' => 'BWA',
            ),
            35 => 
            array (
                'id' => 'BY',
                'name' => 'Belarus',
                'iso_alpha_3' => 'BLR',
            ),
            36 => 
            array (
                'id' => 'BZ',
                'name' => 'Belize',
                'iso_alpha_3' => 'BLZ',
            ),
            37 => 
            array (
                'id' => 'CA',
                'name' => 'Canada',
                'iso_alpha_3' => 'CAN',
            ),
            38 => 
            array (
                'id' => 'CC',
            'name' => 'Cocos (Keeling) Islands (the)',
                'iso_alpha_3' => 'CCK',
            ),
            39 => 
            array (
                'id' => 'CD',
            'name' => 'Congo (the Democratic Republic of the)',
                'iso_alpha_3' => 'COD',
            ),
            40 => 
            array (
                'id' => 'CF',
            'name' => 'Central African Republic (the)',
                'iso_alpha_3' => 'CAF',
            ),
            41 => 
            array (
                'id' => 'CG',
            'name' => 'Congo (the)',
                'iso_alpha_3' => 'COG',
            ),
            42 => 
            array (
                'id' => 'CH',
                'name' => 'Switzerland',
                'iso_alpha_3' => 'CHE',
            ),
            43 => 
            array (
                'id' => 'CI',
                'name' => 'Côte d\'Ivoire',
                'iso_alpha_3' => 'CIV',
            ),
            44 => 
            array (
                'id' => 'CK',
            'name' => 'Cook Islands (the)',
                'iso_alpha_3' => 'COK',
            ),
            45 => 
            array (
                'id' => 'CL',
                'name' => 'Chile',
                'iso_alpha_3' => 'CHL',
            ),
            46 => 
            array (
                'id' => 'CM',
                'name' => 'Cameroon',
                'iso_alpha_3' => 'CMR',
            ),
            47 => 
            array (
                'id' => 'CN',
                'name' => 'China',
                'iso_alpha_3' => 'CHN',
            ),
            48 => 
            array (
                'id' => 'CO',
                'name' => 'Colombia',
                'iso_alpha_3' => 'COL',
            ),
            49 => 
            array (
                'id' => 'CR',
                'name' => 'Costa Rica',
                'iso_alpha_3' => 'CRI',
            ),
            50 => 
            array (
                'id' => 'CU',
                'name' => 'Cuba',
                'iso_alpha_3' => 'CUB',
            ),
            51 => 
            array (
                'id' => 'CV',
                'name' => 'Cabo Verde',
                'iso_alpha_3' => 'CPV',
            ),
            52 => 
            array (
                'id' => 'CW',
                'name' => 'Curaçao',
                'iso_alpha_3' => 'CUW',
            ),
            53 => 
            array (
                'id' => 'CX',
                'name' => 'Christmas Island',
                'iso_alpha_3' => 'CXR',
            ),
            54 => 
            array (
                'id' => 'CY',
                'name' => 'Cyprus',
                'iso_alpha_3' => 'CYP',
            ),
            55 => 
            array (
                'id' => 'CZ',
                'name' => 'Czechia',
                'iso_alpha_3' => 'CZE',
            ),
            56 => 
            array (
                'id' => 'DE',
                'name' => 'Germany',
                'iso_alpha_3' => 'DEU',
            ),
            57 => 
            array (
                'id' => 'DJ',
                'name' => 'Djibouti',
                'iso_alpha_3' => 'DJI',
            ),
            58 => 
            array (
                'id' => 'DK',
                'name' => 'Denmark',
                'iso_alpha_3' => 'DNK',
            ),
            59 => 
            array (
                'id' => 'DM',
                'name' => 'Dominica',
                'iso_alpha_3' => 'DMA',
            ),
            60 => 
            array (
                'id' => 'DO',
            'name' => 'Dominican Republic (the)',
                'iso_alpha_3' => 'DOM',
            ),
            61 => 
            array (
                'id' => 'DZ',
                'name' => 'Algeria',
                'iso_alpha_3' => 'DZA',
            ),
            62 => 
            array (
                'id' => 'EC',
                'name' => 'Ecuador',
                'iso_alpha_3' => 'ECU',
            ),
            63 => 
            array (
                'id' => 'EE',
                'name' => 'Estonia',
                'iso_alpha_3' => 'EST',
            ),
            64 => 
            array (
                'id' => 'EG',
                'name' => 'Egypt',
                'iso_alpha_3' => 'EGY',
            ),
            65 => 
            array (
                'id' => 'EH',
                'name' => 'Western Sahara*',
                'iso_alpha_3' => 'ESH',
            ),
            66 => 
            array (
                'id' => 'ER',
                'name' => 'Eritrea',
                'iso_alpha_3' => 'ERI',
            ),
            67 => 
            array (
                'id' => 'ES',
                'name' => 'Spain',
                'iso_alpha_3' => 'ESP',
            ),
            68 => 
            array (
                'id' => 'ET',
                'name' => 'Ethiopia',
                'iso_alpha_3' => 'ETH',
            ),
            69 => 
            array (
                'id' => 'FI',
                'name' => 'Finland',
                'iso_alpha_3' => 'FIN',
            ),
            70 => 
            array (
                'id' => 'FJ',
                'name' => 'Fiji',
                'iso_alpha_3' => 'FJI',
            ),
            71 => 
            array (
                'id' => 'FK',
            'name' => 'Falkland Islands (the) [Malvinas]',
                'iso_alpha_3' => 'FLK',
            ),
            72 => 
            array (
                'id' => 'FM',
            'name' => 'Micronesia (Federated States of)',
                'iso_alpha_3' => 'FSM',
            ),
            73 => 
            array (
                'id' => 'FO',
            'name' => 'Faroe Islands (the)',
                'iso_alpha_3' => 'FRO',
            ),
            74 => 
            array (
                'id' => 'FR',
                'name' => 'France',
                'iso_alpha_3' => 'FRA',
            ),
            75 => 
            array (
                'id' => 'GA',
                'name' => 'Gabon',
                'iso_alpha_3' => 'GAB',
            ),
            76 => 
            array (
                'id' => 'GB',
            'name' => 'United Kingdom of Great Britain and Northern Ireland (the)',
                'iso_alpha_3' => 'GBR',
            ),
            77 => 
            array (
                'id' => 'GD',
                'name' => 'Grenada',
                'iso_alpha_3' => 'GRD',
            ),
            78 => 
            array (
                'id' => 'GE',
                'name' => 'Georgia',
                'iso_alpha_3' => 'GEO',
            ),
            79 => 
            array (
                'id' => 'GF',
                'name' => 'French Guiana',
                'iso_alpha_3' => 'GUF',
            ),
            80 => 
            array (
                'id' => 'GG',
                'name' => 'Guernsey',
                'iso_alpha_3' => 'GGY',
            ),
            81 => 
            array (
                'id' => 'GH',
                'name' => 'Ghana',
                'iso_alpha_3' => 'GHA',
            ),
            82 => 
            array (
                'id' => 'GI',
                'name' => 'Gibraltar',
                'iso_alpha_3' => 'GIB',
            ),
            83 => 
            array (
                'id' => 'GL',
                'name' => 'Greenland',
                'iso_alpha_3' => 'GRL',
            ),
            84 => 
            array (
                'id' => 'GM',
            'name' => 'Gambia (the)',
                'iso_alpha_3' => 'GMB',
            ),
            85 => 
            array (
                'id' => 'GN',
                'name' => 'Guinea',
                'iso_alpha_3' => 'GIN',
            ),
            86 => 
            array (
                'id' => 'GP',
                'name' => 'Guadeloupe',
                'iso_alpha_3' => 'GLP',
            ),
            87 => 
            array (
                'id' => 'GQ',
                'name' => 'Equatorial Guinea',
                'iso_alpha_3' => 'GNQ',
            ),
            88 => 
            array (
                'id' => 'GR',
                'name' => 'Greece',
                'iso_alpha_3' => 'GRC',
            ),
            89 => 
            array (
                'id' => 'GS',
                'name' => 'South Georgia and the South Sandwich Islands',
                'iso_alpha_3' => 'SGS',
            ),
            90 => 
            array (
                'id' => 'GT',
                'name' => 'Guatemala',
                'iso_alpha_3' => 'GTM',
            ),
            91 => 
            array (
                'id' => 'GU',
                'name' => 'Guam',
                'iso_alpha_3' => 'GUM',
            ),
            92 => 
            array (
                'id' => 'GW',
                'name' => 'Guinea-Bissau',
                'iso_alpha_3' => 'GNB',
            ),
            93 => 
            array (
                'id' => 'GY',
                'name' => 'Guyana',
                'iso_alpha_3' => 'GUY',
            ),
            94 => 
            array (
                'id' => 'HK',
                'name' => 'Hong Kong',
                'iso_alpha_3' => 'HKG',
            ),
            95 => 
            array (
                'id' => 'HM',
                'name' => 'Heard Island and McDonald Islands',
                'iso_alpha_3' => 'HMD',
            ),
            96 => 
            array (
                'id' => 'HN',
                'name' => 'Honduras',
                'iso_alpha_3' => 'HND',
            ),
            97 => 
            array (
                'id' => 'HR',
                'name' => 'Croatia',
                'iso_alpha_3' => 'HRV',
            ),
            98 => 
            array (
                'id' => 'HT',
                'name' => 'Haiti',
                'iso_alpha_3' => 'HTI',
            ),
            99 => 
            array (
                'id' => 'HU',
                'name' => 'Hungary',
                'iso_alpha_3' => 'HUN',
            ),
            100 => 
            array (
                'id' => 'ID',
                'name' => 'Indonesia',
                'iso_alpha_3' => 'IDN',
            ),
            101 => 
            array (
                'id' => 'IE',
                'name' => 'Ireland',
                'iso_alpha_3' => 'IRL',
            ),
            102 => 
            array (
                'id' => 'IL',
                'name' => 'Israel',
                'iso_alpha_3' => 'ISR',
            ),
            103 => 
            array (
                'id' => 'IM',
                'name' => 'Isle of Man',
                'iso_alpha_3' => 'IMN',
            ),
            104 => 
            array (
                'id' => 'IN',
                'name' => 'India',
                'iso_alpha_3' => 'IND',
            ),
            105 => 
            array (
                'id' => 'IO',
            'name' => 'British Indian Ocean Territory (the)',
                'iso_alpha_3' => 'IOT',
            ),
            106 => 
            array (
                'id' => 'IQ',
                'name' => 'Iraq',
                'iso_alpha_3' => 'IRQ',
            ),
            107 => 
            array (
                'id' => 'IR',
            'name' => 'Iran (Islamic Republic of)',
                'iso_alpha_3' => 'IRN',
            ),
            108 => 
            array (
                'id' => 'IS',
                'name' => 'Iceland',
                'iso_alpha_3' => 'ISL',
            ),
            109 => 
            array (
                'id' => 'IT',
                'name' => 'Italy',
                'iso_alpha_3' => 'ITA',
            ),
            110 => 
            array (
                'id' => 'JE',
                'name' => 'Jersey',
                'iso_alpha_3' => 'JEY',
            ),
            111 => 
            array (
                'id' => 'JM',
                'name' => 'Jamaica',
                'iso_alpha_3' => 'JAM',
            ),
            112 => 
            array (
                'id' => 'JO',
                'name' => 'Jordan',
                'iso_alpha_3' => 'JOR',
            ),
            113 => 
            array (
                'id' => 'JP',
                'name' => 'Japan',
                'iso_alpha_3' => 'JPN',
            ),
            114 => 
            array (
                'id' => 'KE',
                'name' => 'Kenya',
                'iso_alpha_3' => 'KEN',
            ),
            115 => 
            array (
                'id' => 'KG',
                'name' => 'Kyrgyzstan',
                'iso_alpha_3' => 'KGZ',
            ),
            116 => 
            array (
                'id' => 'KH',
                'name' => 'Cambodia',
                'iso_alpha_3' => 'KHM',
            ),
            117 => 
            array (
                'id' => 'KI',
                'name' => 'Kiribati',
                'iso_alpha_3' => 'KIR',
            ),
            118 => 
            array (
                'id' => 'KM',
            'name' => 'Comoros (the)',
                'iso_alpha_3' => 'COM',
            ),
            119 => 
            array (
                'id' => 'KN',
                'name' => 'Saint Kitts and Nevis',
                'iso_alpha_3' => 'KNA',
            ),
            120 => 
            array (
                'id' => 'KP',
            'name' => 'Korea (the Democratic People\'s Republic of)',
                'iso_alpha_3' => 'PRK',
            ),
            121 => 
            array (
                'id' => 'KR',
            'name' => 'Korea (the Republic of)',
                'iso_alpha_3' => 'KOR',
            ),
            122 => 
            array (
                'id' => 'KW',
                'name' => 'Kuwait',
                'iso_alpha_3' => 'KWT',
            ),
            123 => 
            array (
                'id' => 'KY',
            'name' => 'Cayman Islands (the)',
                'iso_alpha_3' => 'CYM',
            ),
            124 => 
            array (
                'id' => 'KZ',
                'name' => 'Kazakhstan',
                'iso_alpha_3' => 'KAZ',
            ),
            125 => 
            array (
                'id' => 'LA',
            'name' => 'Lao People\'s Democratic Republic (the)',
                'iso_alpha_3' => 'LAO',
            ),
            126 => 
            array (
                'id' => 'LB',
                'name' => 'Lebanon',
                'iso_alpha_3' => 'LBN',
            ),
            127 => 
            array (
                'id' => 'LC',
                'name' => 'Saint Lucia',
                'iso_alpha_3' => 'LCA',
            ),
            128 => 
            array (
                'id' => 'LI',
                'name' => 'Liechtenstein',
                'iso_alpha_3' => 'LIE',
            ),
            129 => 
            array (
                'id' => 'LK',
                'name' => 'Sri Lanka',
                'iso_alpha_3' => 'LKA',
            ),
            130 => 
            array (
                'id' => 'LR',
                'name' => 'Liberia',
                'iso_alpha_3' => 'LBR',
            ),
            131 => 
            array (
                'id' => 'LS',
                'name' => 'Lesotho',
                'iso_alpha_3' => 'LSO',
            ),
            132 => 
            array (
                'id' => 'LT',
                'name' => 'Lithuania',
                'iso_alpha_3' => 'LTU',
            ),
            133 => 
            array (
                'id' => 'LU',
                'name' => 'Luxembourg',
                'iso_alpha_3' => 'LUX',
            ),
            134 => 
            array (
                'id' => 'LV',
                'name' => 'Latvia',
                'iso_alpha_3' => 'LVA',
            ),
            135 => 
            array (
                'id' => 'LY',
                'name' => 'Libya',
                'iso_alpha_3' => 'LBY',
            ),
            136 => 
            array (
                'id' => 'MA',
                'name' => 'Morocco',
                'iso_alpha_3' => 'MAR',
            ),
            137 => 
            array (
                'id' => 'MC',
                'name' => 'Monaco',
                'iso_alpha_3' => 'MCO',
            ),
            138 => 
            array (
                'id' => 'MD',
            'name' => 'Moldova (the Republic of)',
                'iso_alpha_3' => 'MDA',
            ),
            139 => 
            array (
                'id' => 'ME',
                'name' => 'Montenegro',
                'iso_alpha_3' => 'MNE',
            ),
            140 => 
            array (
                'id' => 'MF',
            'name' => 'Saint Martin (French part)',
                'iso_alpha_3' => 'MAF',
            ),
            141 => 
            array (
                'id' => 'MG',
                'name' => 'Madagascar',
                'iso_alpha_3' => 'MDG',
            ),
            142 => 
            array (
                'id' => 'MH',
            'name' => 'Marshall Islands (the)',
                'iso_alpha_3' => 'MHL',
            ),
            143 => 
            array (
                'id' => 'MK',
                'name' => 'North Macedonia',
                'iso_alpha_3' => 'MKD',
            ),
            144 => 
            array (
                'id' => 'ML',
                'name' => 'Mali',
                'iso_alpha_3' => 'MLI',
            ),
            145 => 
            array (
                'id' => 'MM',
                'name' => 'Myanmar',
                'iso_alpha_3' => 'MMR',
            ),
            146 => 
            array (
                'id' => 'MN',
                'name' => 'Mongolia',
                'iso_alpha_3' => 'MNG',
            ),
            147 => 
            array (
                'id' => 'MO',
                'name' => 'Macao',
                'iso_alpha_3' => 'MAC',
            ),
            148 => 
            array (
                'id' => 'MP',
            'name' => 'Northern Mariana Islands (the)',
                'iso_alpha_3' => 'MNP',
            ),
            149 => 
            array (
                'id' => 'MQ',
                'name' => 'Martinique',
                'iso_alpha_3' => 'MTQ',
            ),
            150 => 
            array (
                'id' => 'MR',
                'name' => 'Mauritania',
                'iso_alpha_3' => 'MRT',
            ),
            151 => 
            array (
                'id' => 'MS',
                'name' => 'Montserrat',
                'iso_alpha_3' => 'MSR',
            ),
            152 => 
            array (
                'id' => 'MT',
                'name' => 'Malta',
                'iso_alpha_3' => 'MLT',
            ),
            153 => 
            array (
                'id' => 'MU',
                'name' => 'Mauritius',
                'iso_alpha_3' => 'MUS',
            ),
            154 => 
            array (
                'id' => 'MV',
                'name' => 'Maldives',
                'iso_alpha_3' => 'MDV',
            ),
            155 => 
            array (
                'id' => 'MW',
                'name' => 'Malawi',
                'iso_alpha_3' => 'MWI',
            ),
            156 => 
            array (
                'id' => 'MX',
                'name' => 'Mexico',
                'iso_alpha_3' => 'MEX',
            ),
            157 => 
            array (
                'id' => 'MY',
                'name' => 'Malaysia',
                'iso_alpha_3' => 'MYS',
            ),
            158 => 
            array (
                'id' => 'MZ',
                'name' => 'Mozambique',
                'iso_alpha_3' => 'MOZ',
            ),
            159 => 
            array (
                'id' => 'NA',
                'name' => 'Namibia',
                'iso_alpha_3' => 'NAM',
            ),
            160 => 
            array (
                'id' => 'NC',
                'name' => 'New Caledonia',
                'iso_alpha_3' => 'NCL',
            ),
            161 => 
            array (
                'id' => 'NE',
            'name' => 'Niger (the)',
                'iso_alpha_3' => 'NER',
            ),
            162 => 
            array (
                'id' => 'NF',
                'name' => 'Norfolk Island',
                'iso_alpha_3' => 'NFK',
            ),
            163 => 
            array (
                'id' => 'NG',
                'name' => 'Nigeria',
                'iso_alpha_3' => 'NGA',
            ),
            164 => 
            array (
                'id' => 'NI',
                'name' => 'Nicaragua',
                'iso_alpha_3' => 'NIC',
            ),
            165 => 
            array (
                'id' => 'NL',
            'name' => 'Netherlands (Kingdom of the)',
                'iso_alpha_3' => 'NLD',
            ),
            166 => 
            array (
                'id' => 'NO',
                'name' => 'Norway',
                'iso_alpha_3' => 'NOR',
            ),
            167 => 
            array (
                'id' => 'NP',
                'name' => 'Nepal',
                'iso_alpha_3' => 'NPL',
            ),
            168 => 
            array (
                'id' => 'NR',
                'name' => 'Nauru',
                'iso_alpha_3' => 'NRU',
            ),
            169 => 
            array (
                'id' => 'NU',
                'name' => 'Niue',
                'iso_alpha_3' => 'NIU',
            ),
            170 => 
            array (
                'id' => 'NZ',
                'name' => 'New Zealand',
                'iso_alpha_3' => 'NZL',
            ),
            171 => 
            array (
                'id' => 'OM',
                'name' => 'Oman',
                'iso_alpha_3' => 'OMN',
            ),
            172 => 
            array (
                'id' => 'PA',
                'name' => 'Panama',
                'iso_alpha_3' => 'PAN',
            ),
            173 => 
            array (
                'id' => 'PE',
                'name' => 'Peru',
                'iso_alpha_3' => 'PER',
            ),
            174 => 
            array (
                'id' => 'PF',
                'name' => 'French Polynesia',
                'iso_alpha_3' => 'PYF',
            ),
            175 => 
            array (
                'id' => 'PG',
                'name' => 'Papua New Guinea',
                'iso_alpha_3' => 'PNG',
            ),
            176 => 
            array (
                'id' => 'PH',
            'name' => 'Philippines (the)',
                'iso_alpha_3' => 'PHL',
            ),
            177 => 
            array (
                'id' => 'PK',
                'name' => 'Pakistan',
                'iso_alpha_3' => 'PAK',
            ),
            178 => 
            array (
                'id' => 'PL',
                'name' => 'Poland',
                'iso_alpha_3' => 'POL',
            ),
            179 => 
            array (
                'id' => 'PM',
                'name' => 'Saint Pierre and Miquelon',
                'iso_alpha_3' => 'SPM',
            ),
            180 => 
            array (
                'id' => 'PN',
                'name' => 'Pitcairn',
                'iso_alpha_3' => 'PCN',
            ),
            181 => 
            array (
                'id' => 'PR',
                'name' => 'Puerto Rico',
                'iso_alpha_3' => 'PRI',
            ),
            182 => 
            array (
                'id' => 'PS',
                'name' => 'Palestine, State of',
                'iso_alpha_3' => 'PSE',
            ),
            183 => 
            array (
                'id' => 'PT',
                'name' => 'Portugal',
                'iso_alpha_3' => 'PRT',
            ),
            184 => 
            array (
                'id' => 'PW',
                'name' => 'Palau',
                'iso_alpha_3' => 'PLW',
            ),
            185 => 
            array (
                'id' => 'PY',
                'name' => 'Paraguay',
                'iso_alpha_3' => 'PRY',
            ),
            186 => 
            array (
                'id' => 'QA',
                'name' => 'Qatar',
                'iso_alpha_3' => 'QAT',
            ),
            187 => 
            array (
                'id' => 'RE',
                'name' => 'Réunion',
                'iso_alpha_3' => 'REU',
            ),
            188 => 
            array (
                'id' => 'RO',
                'name' => 'Romania',
                'iso_alpha_3' => 'ROU',
            ),
            189 => 
            array (
                'id' => 'RS',
                'name' => 'Serbia',
                'iso_alpha_3' => 'SRB',
            ),
            190 => 
            array (
                'id' => 'RU',
            'name' => 'Russian Federation (the)',
                'iso_alpha_3' => 'RUS',
            ),
            191 => 
            array (
                'id' => 'RW',
                'name' => 'Rwanda',
                'iso_alpha_3' => 'RWA',
            ),
            192 => 
            array (
                'id' => 'SA',
                'name' => 'Saudi Arabia',
                'iso_alpha_3' => 'SAU',
            ),
            193 => 
            array (
                'id' => 'SB',
                'name' => 'Solomon Islands',
                'iso_alpha_3' => 'SLB',
            ),
            194 => 
            array (
                'id' => 'SC',
                'name' => 'Seychelles',
                'iso_alpha_3' => 'SYC',
            ),
            195 => 
            array (
                'id' => 'SD',
            'name' => 'Sudan (the)',
                'iso_alpha_3' => 'SDN',
            ),
            196 => 
            array (
                'id' => 'SE',
                'name' => 'Sweden',
                'iso_alpha_3' => 'SWE',
            ),
            197 => 
            array (
                'id' => 'SG',
                'name' => 'Singapore',
                'iso_alpha_3' => 'SGP',
            ),
            198 => 
            array (
                'id' => 'SH',
                'name' => 'Saint Helena, Ascension and Tristan da Cunha',
                'iso_alpha_3' => 'SHN',
            ),
            199 => 
            array (
                'id' => 'SI',
                'name' => 'Slovenia',
                'iso_alpha_3' => 'SVN',
            ),
            200 => 
            array (
                'id' => 'SJ',
                'name' => 'Svalbard and Jan Mayen',
                'iso_alpha_3' => 'SJM',
            ),
            201 => 
            array (
                'id' => 'SK',
                'name' => 'Slovakia',
                'iso_alpha_3' => 'SVK',
            ),
            202 => 
            array (
                'id' => 'SL',
                'name' => 'Sierra Leone',
                'iso_alpha_3' => 'SLE',
            ),
            203 => 
            array (
                'id' => 'SM',
                'name' => 'San Marino',
                'iso_alpha_3' => 'SMR',
            ),
            204 => 
            array (
                'id' => 'SN',
                'name' => 'Senegal',
                'iso_alpha_3' => 'SEN',
            ),
            205 => 
            array (
                'id' => 'SO',
                'name' => 'Somalia',
                'iso_alpha_3' => 'SOM',
            ),
            206 => 
            array (
                'id' => 'SR',
                'name' => 'Suriname',
                'iso_alpha_3' => 'SUR',
            ),
            207 => 
            array (
                'id' => 'SS',
                'name' => 'South Sudan',
                'iso_alpha_3' => 'SSD',
            ),
            208 => 
            array (
                'id' => 'ST',
                'name' => 'Sao Tome and Principe',
                'iso_alpha_3' => 'STP',
            ),
            209 => 
            array (
                'id' => 'SV',
                'name' => 'El Salvador',
                'iso_alpha_3' => 'SLV',
            ),
            210 => 
            array (
                'id' => 'SX',
            'name' => 'Sint Maarten (Dutch part)',
                'iso_alpha_3' => 'SXM',
            ),
            211 => 
            array (
                'id' => 'SY',
            'name' => 'Syrian Arab Republic (the)',
                'iso_alpha_3' => 'SYR',
            ),
            212 => 
            array (
                'id' => 'SZ',
                'name' => 'Eswatini',
                'iso_alpha_3' => 'SWZ',
            ),
            213 => 
            array (
                'id' => 'TC',
            'name' => 'Turks and Caicos Islands (the)',
                'iso_alpha_3' => 'TCA',
            ),
            214 => 
            array (
                'id' => 'TD',
                'name' => 'Chad',
                'iso_alpha_3' => 'TCD',
            ),
            215 => 
            array (
                'id' => 'TF',
            'name' => 'French Southern Territories (the)',
                'iso_alpha_3' => 'ATF',
            ),
            216 => 
            array (
                'id' => 'TG',
                'name' => 'Togo',
                'iso_alpha_3' => 'TGO',
            ),
            217 => 
            array (
                'id' => 'TH',
                'name' => 'Thailand',
                'iso_alpha_3' => 'THA',
            ),
            218 => 
            array (
                'id' => 'TJ',
                'name' => 'Tajikistan',
                'iso_alpha_3' => 'TJK',
            ),
            219 => 
            array (
                'id' => 'TK',
                'name' => 'Tokelau',
                'iso_alpha_3' => 'TKL',
            ),
            220 => 
            array (
                'id' => 'TL',
                'name' => 'Timor-Leste',
                'iso_alpha_3' => 'TLS',
            ),
            221 => 
            array (
                'id' => 'TM',
                'name' => 'Turkmenistan',
                'iso_alpha_3' => 'TKM',
            ),
            222 => 
            array (
                'id' => 'TN',
                'name' => 'Tunisia',
                'iso_alpha_3' => 'TUN',
            ),
            223 => 
            array (
                'id' => 'TO',
                'name' => 'Tonga',
                'iso_alpha_3' => 'TON',
            ),
            224 => 
            array (
                'id' => 'TR',
                'name' => 'Türkiye',
                'iso_alpha_3' => 'TUR',
            ),
            225 => 
            array (
                'id' => 'TT',
                'name' => 'Trinidad and Tobago',
                'iso_alpha_3' => 'TTO',
            ),
            226 => 
            array (
                'id' => 'TV',
                'name' => 'Tuvalu',
                'iso_alpha_3' => 'TUV',
            ),
            227 => 
            array (
                'id' => 'TW',
            'name' => 'Taiwan (Province of China)',
                'iso_alpha_3' => 'TWN',
            ),
            228 => 
            array (
                'id' => 'TZ',
                'name' => 'Tanzania, the United Republic of',
                'iso_alpha_3' => 'TZA',
            ),
            229 => 
            array (
                'id' => 'UA',
                'name' => 'Ukraine',
                'iso_alpha_3' => 'UKR',
            ),
            230 => 
            array (
                'id' => 'UG',
                'name' => 'Uganda',
                'iso_alpha_3' => 'UGA',
            ),
            231 => 
            array (
                'id' => 'UM',
            'name' => 'United States Minor Outlying Islands (the)',
                'iso_alpha_3' => 'UMI',
            ),
            232 => 
            array (
                'id' => 'US',
            'name' => 'United States of America (the)',
                'iso_alpha_3' => 'USA',
            ),
            233 => 
            array (
                'id' => 'UY',
                'name' => 'Uruguay',
                'iso_alpha_3' => 'URY',
            ),
            234 => 
            array (
                'id' => 'UZ',
                'name' => 'Uzbekistan',
                'iso_alpha_3' => 'UZB',
            ),
            235 => 
            array (
                'id' => 'VA',
            'name' => 'Holy See (the)',
                'iso_alpha_3' => 'VAT',
            ),
            236 => 
            array (
                'id' => 'VC',
                'name' => 'Saint Vincent and the Grenadines',
                'iso_alpha_3' => 'VCT',
            ),
            237 => 
            array (
                'id' => 'VE',
            'name' => 'Venezuela (Bolivarian Republic of)',
                'iso_alpha_3' => 'VEN',
            ),
            238 => 
            array (
                'id' => 'VG',
            'name' => 'Virgin Islands (British)',
                'iso_alpha_3' => 'VGB',
            ),
            239 => 
            array (
                'id' => 'VI',
            'name' => 'Virgin Islands (U.S.)',
                'iso_alpha_3' => 'VIR',
            ),
            240 => 
            array (
                'id' => 'VN',
                'name' => 'Viet Nam',
                'iso_alpha_3' => 'VNM',
            ),
            241 => 
            array (
                'id' => 'VU',
                'name' => 'Vanuatu',
                'iso_alpha_3' => 'VUT',
            ),
            242 => 
            array (
                'id' => 'WF',
                'name' => 'Wallis and Futuna',
                'iso_alpha_3' => 'WLF',
            ),
            243 => 
            array (
                'id' => 'WS',
                'name' => 'Samoa',
                'iso_alpha_3' => 'WSM',
            ),
            244 => 
            array (
                'id' => 'YE',
                'name' => 'Yemen',
                'iso_alpha_3' => 'YEM',
            ),
            245 => 
            array (
                'id' => 'YT',
                'name' => 'Mayotte',
                'iso_alpha_3' => 'MYT',
            ),
            246 => 
            array (
                'id' => 'ZA',
                'name' => 'South Africa',
                'iso_alpha_3' => 'ZAF',
            ),
            247 => 
            array (
                'id' => 'ZM',
                'name' => 'Zambia',
                'iso_alpha_3' => 'ZMB',
            ),
            248 => 
            array (
                'id' => 'ZW',
                'name' => 'Zimbabwe',
                'iso_alpha_3' => 'ZWE',
            ),
        ));
        
        
    }
}