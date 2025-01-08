<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Address
 * 
 * @property int $id
 * @property string $name
 * @property int|null $province_id
 * @property int $nation_id
 * @property int $city_id
 * @property int|null $zip_id
 * @property int|null $company_id
 * @property string $address
 * @property string|null $street_number
 * @property string|null $timezone
 * @property string|null $apartment_unit
 *
 * @package App\Models
 */
class Address extends Model
{
	protected $table = 'addresses';
	public $timestamps = false;

	protected $casts = [
		'province_id' => 'int',
		'nation_id' => 'int',
		'city_id' => 'int',
		'zip_id' => 'int',
		'company_id' => 'int'
	];

	protected $fillable = [
		'name',
		'province_id',
		'nation_id',
		'city_id',
		'zip_id',
		'company_id',
		'address',
		'street_number',
		'timezone',
		'apartment_unit'
	];
}
