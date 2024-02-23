<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentLanguage extends Model
{
    use HasFactory;

    protected $table = 'document_languages';

    public $timestamps = false;

    protected $keyType = 'string';

    public $incrementing = false;
}
