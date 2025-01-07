import React, { useState } from "react";
import { cleanMessage } from "./error-handlers";
class ValidationErrorsBag {
	constructor() {
		[this.errors, this.setErrors] = useState({});
	}

	setValidationErrors(errors) {
		this.setErrors(errors);
	}

	getInputErrors(input, clean = false) {
		if (input in this.errors) {
			if (clean) {
				return {
					validateStatus: "error",
					help: this.errors[input]?.map((el) => cleanMessage(el)),
				};
			}
			return { validateStatus: "error", help: this.errors[input] };
		}
		return {};
	}

	clear() {
		this.setErrors({});
	}
}

const useValidationErrors = () => {
	return new ValidationErrorsBag();
};

export { useValidationErrors };
