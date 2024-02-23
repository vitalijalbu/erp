<?php

namespace App\Configurator\Configuration;

use App\Models\StandardProduct;

class Event 
{
    public function __construct(
        protected EventEnum $event,
        protected $data = []
    )
    {
        
    }

    public function getEvent(): EventEnum
    {
        return $this->event;
    }

    public function getData()
    {
        return $this->data;
    }
}