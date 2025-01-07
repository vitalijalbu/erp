<?php

namespace App\Models\Traits;

use Illuminate\Support\Facades\DB;

trait HasCustomId {

    protected static function bootHasCustomId()
    {
        static::created(function ($model) {
            $model->{$model->getKeyName()} = $model->getLastInsertedId();
        });
    }

    public function getIncrementing()
    {
        return false;
    } 

    public function getKeyType()
    {
        return 'string';
    }

    protected function getLastInsertedId()
    {
        return DB::select('SELECT dbo.get_last_table_id (?) AS id', [$this->getTable()])[0]->id ?? null;
    }

    public function getGuarded()
    {
        return [...parent::getGuarded(), $this->getKeyName()];
    }

}