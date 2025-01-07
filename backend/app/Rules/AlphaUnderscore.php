<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class AlphaUnderscore implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) && ! is_numeric($value)) {
            $fail('The :attribute must be a string composed only by letters, numbers and underscore.');
        }

        if(!preg_match('/\A[a-zA-Z0-9_-]+\z/u', $value)) {
            $fail('The :attribute must be a string composed only by letters, numbers and underscore.');
        }
    }
}
