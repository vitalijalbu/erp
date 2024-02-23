<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBPDestinationRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $isNew = !$this->route()->parameter('destination');
        $required = $isNew ? ['required'] : ['sometimes', 'required'];
        
        return [
            "desc" => [
                ...$required, 
                'string', 
                Rule::unique('App\Models\BPDestination')
                    ->where('IDbp', $isNew ? $this->route()->parameter('bp')->IDbp : $this->route()->parameter('destination')->IDbp)
                    ->when(
                        $this->route()->parameter('destination'), 
                        function($rule, $destination) {
                            $rule
                                ->ignore($destination->IDdestination, 'IDdestination');
                        }
                    )
            ],
        ];
    }
}
