<?php

namespace App\Configurator\Execution;

class Plan
{
    public function __construct(protected $type, protected array $data)
    {
        
    }

    public function getType()
    {
        return $this->type;
    }

    public function getData()
    {
        return $this->data;
    }

    public function toRequestData()
    {
        return [
            'type' => $this->getType(),
            'data' => $this->getData()
        ];
    }
}