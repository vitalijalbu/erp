<?php

namespace App\Rules;

use App\Models\Constraint;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ActiveConstraint implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $constraint = Constraint::find($value);
        if($constraint->is_draft) {
            $fail("The selected constraint is in draft state and cannot be selected");
        }
    }
}
