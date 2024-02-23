<?php

namespace App\Http\Requests;

use App\Enum\ItemType;
use App\Models\Item;
use App\Models\Machine;
use App\Rules\AlphaUnderscore;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;

class StoreUpdateProcessRequest extends FormRequest
{
    protected $workcenterDefaults = [];
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string'],
            'code' => [
                $this->process ? 'prohibited' : 'required',
                'string', 
                Rule::unique('processes', 'code')->where('company_id', auth()->user()->IDcompany)->ignore($this->process),  
                new AlphaUnderscore(), 
            ],
            'price_item_id' => [
                'nullable',
                'string',
                Rule::exists(Item::class, 'IDitem')
                    ->where('IDcompany', auth()->user()->IDcompany)
                    ->where(function($query) {
                        return $query->where('configured_item', false)->orWhereNull('configured_item');
                    })
                    ->where('type', ItemType::service)
            ],
            'setup_price_item_id' => [
                'nullable',
                'string',
                Rule::exists(Item::class, 'IDitem')
                    ->where('IDcompany', auth()->user()->IDcompany)
                    ->where(function($query) {
                        return $query->where('configured_item', false)->orWhereNull('configured_item');
                    })
                    ->where('type', ItemType::service)
            ],
            'operator_cost_item_id' => [
                'nullable',
                'string',
                Rule::exists(Item::class, 'IDitem')
                    ->where('IDcompany', auth()->user()->IDcompany)
                    ->where(function($query) {
                        return $query->where('configured_item', false)->orWhereNull('configured_item');
                    })
                    ->where('type', ItemType::cost)
            ],
            'execution_time' => [
                'nullable',
                'integer',
            ],
            'setup_time' => [
                'nullable',
                'integer',
            ],
            'men_occupation' => [
                'nullable',
                'integer',
            ],
            'need_machine' => [
                'nullable',
                'boolean',
            ],
            'machines' => [
                'exclude_unless:need_machine,1,true',
                'present',
                'array'
            ],
            'machines.*.machine_id' => [
                'required',
                'string',
                'distinct',
                Rule::exists(Machine::class, 'id')->where('company_id', auth()->user()->IDcompany)
            ],
            'machines.*.workcenter_default' => Rule::forEach(function ($value, $attribute, $data) {
                $rootData = (Arr::undot(Arr::wrap($data)));
                [, $index] = explode('.', $attribute);
                
                return [
                    'required',
                    'boolean',
                    function($attribute, $value, $fail) use ($index, $rootData) {
                        $machine = Machine::findOrFail($rootData['machines'][$index]['machine_id']);
                        if($value) {
                            if(!empty($this->workcenterDefaults[$machine->workcenter_id]['status'])) {
                                $fail('A default machine already exists for the same workcenter');
                                return false;
                            }
                            
                            $this->workcenterDefaults[$machine->workcenter_id] = ['status' => true, 'index' => $index];;
                        }
                        
                        if(!isset($this->workcenterDefaults[$machine->workcenter_id])) {
                            $this->workcenterDefaults[$machine->workcenter_id] = ['status' => false, 'index' => $index];
                        }
                        
                        return true;
                    }
                ];
            })
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                foreach($this->workcenterDefaults as $workCenterId => $defaultData) {
                    if(!$defaultData['status']) {
                        $validator->errors()->add(
                            'machines.'.$defaultData['index'].'.machine_id',
                            'Every workcenter must have a default machine'
                        );
                    }
                }
            }
        ];
    }
}
