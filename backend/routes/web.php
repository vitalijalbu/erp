<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StockController;
use Illuminate\Support\Facades\Http;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/


/*
Route::get('/', function(){
    return view('index');
});


Route::get('dati', function(Request $request){
    class TestDT extends \App\DataTables\EloquentDataTable {

        protected function setSchema(): array
        {
            return [
                'id' => [
                    'data' => 'IDtransaction',
                    'name' => 'IDtransaction',
                    'searchable' => true,
                    'orderable' => true
                ],
                'company' => [
                    'data' => 'IDcompany',
                    'name' => 'IDcompany',
                    'searchable' => true,
                    'orderable' => true
                ]
            ];
        }
        
        protected function build(): static
        {
            return $this
                ->addColumn('test', 'testtttt');
        }
    }
    //phpinfo(); exit;
    $model = \App\Models\Transaction::query();
    return (new TestDT($model))->toJson();
});

*/