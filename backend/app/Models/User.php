<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class User
 * 
 * @property int $id
 * @property int $IDcompany
 * @property string $username
 * @property int $IDgroup
 * @property string|null $language
 * @property int|null $IDwarehouseUserDef
 * @property string|null $clientTimezoneDB
 * @property string|null $decimal_symb
 * @property string|null $list_separator
 * @property int|null $employee_contact_id
 * @property string|null $default_workcenter
 * @property string $password
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * @package App\Models
 */
class User extends Model
{
	protected $table = 'users';

	protected $casts = [
		'IDcompany' => 'int',
		'IDgroup' => 'int',
		'IDwarehouseUserDef' => 'int',
		'employee_contact_id' => 'int'
	];

	protected $hidden = [
		'password',
		'remember_token'
	];

	protected $fillable = [
		'IDcompany',
		'username',
		'IDgroup',
		'language',
		'IDwarehouseUserDef',
		'clientTimezoneDB',
		'decimal_symb',
		'list_separator',
		'employee_contact_id',
		'default_workcenter',
		'password',
		'remember_token'
	];
}
