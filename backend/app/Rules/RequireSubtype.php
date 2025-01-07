<?php

namespace App\Rules;

use App\Models\ConstraintSubtype;
use App\Models\ConstraintType;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class RequireSubtype implements ValidationRule
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
        if(!is_string($value) && $value !== null) {
            $fail("The {$attribute} is invalid.");
        }
        else {
            $constraintTypeId = $this->isNew ? 
                request()->constraint_type_id
                : request()->route()->parameter('constraint')->constraint_type_id;

            if ($constraintTypeId) {
                $constraintType = ConstraintType::find($constraintTypeId);
                if($constraintType->require_subtype) {
                    if(empty($value)) {
                        $fail("The subtype is required");
                    }
                    elseif(
                        !ConstraintSubtype::where('constraint_type_id', $constraintType->id)
                            ->where('id', $value)
                            ->exists()
                    ) {
                        $fail("The subtype is invalid");
                    }
                }
                else {
                    if(strlen($value)) {
                        $fail("The subtype cannot be specified");
                    }
                }
            }
            else {
                if(strlen($value)) {
                    $fail("The subtype cannot be specified");
                }
            }
        }
    }
}
