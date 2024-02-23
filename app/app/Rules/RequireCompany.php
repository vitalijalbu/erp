<?php

namespace App\Rules;

use App\Models\Company;
use App\Models\ConstraintType;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class RequireCompany implements ValidationRule
{
    /**
     * Indicates whether the rule should be implicit.
     *
     * @var bool
     */
    public $implicit = true;

    public function __construct(protected $isNew)
    {
        
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if(!is_scalar($value) && $value !== null) {
            $fail("The {$attribute} is invalid.");
        }
        else {
            $constraintTypeId = $this->isNew ? 
                request()->constraint_type_id
                : request()->route()->parameter('constraint')->constraint_type_id;

            if ($constraintTypeId) {
                $constraintType = ConstraintType::find($constraintTypeId);
                if($constraintType->require_company) {
                    if(empty($value)) {
                        $fail("The company is required");
                    }
                    elseif(
                        !Company::find($value)
                    ) {
                        $fail("The company is invalid");
                    }
                }
                else {
                    if(strlen($value)) {
                        $fail("The company cannot be specified");
                    }
                }
            }
            else {
                if(strlen($value)) {
                    $fail("The company cannot be specified");
                }
            }
        }
    }
}
