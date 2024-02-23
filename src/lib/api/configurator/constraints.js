import instance from "@/lib/api";

// Get all constraints
export const getAllConstraints = async (filters) => {
	try {
		const response = await instance.get("/constraints", { params: filters });
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// Show constraint by id
export const getConstraintById = async (id) => {
	try {
		const response = await instance.get(`/constraints/${id}`);
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// Create constraint
export const createConstraint = async (body) => {
	try {
		const response = await instance.post(`/constraints`, body);
		return { data: response.data };
	} catch (error) {
		const validationErrors =
			error.response.status == 422 ? error.response.data.errors : false;
		return {
			status: false,
			error: error,
			errorMsg: error.response.data.message,
			validationErrors: validationErrors,
		};
	}
};

// Update constraint
export const updateConstraint = async (id, body) => {
	try {
		const response = await instance.put(`/constraints/${id}`, body);
		return { data: response.data };
	} catch (error) {
		const validationErrors =
			error.response.status == 422 ? error.response.data.errors : false;
		return { status: false, error: error, validationErrors: validationErrors };
	}
};

// Delete constraint
export const deleteConstraint = async (id) => {
	try {
		const response = await instance.delete(`/constraints/${id}`);
		return { data: response.data };
	} catch (error) {
		const validationErrors =
			error.response.status == 422 ? error.response.data.errors : false;
		return { status: false, error: error, validationErrors: validationErrors };
	}
};

//Duplicate constraint
export const cloneConstraint = async (id, body) => {
	try {
		const response = await instance.post(`/constraints/${id}/clone`, body);
		return { data: response.data };
	} catch (error) {
		const validationErrors =
			error.response.status == 422 ? error.response.data.errors : false;
		return { status: false, error: error, validationErrors: validationErrors };
	}
};

// Get all constraint types
export const getAllConstraintTypes = async (filters) => {
	try {
		const response = await instance.get("/constraints/types", {
			params: filters,
		});
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// Show constraint type by id
export const getConstraintTypeById = async (id) => {
	try {
		const response = await instance.get(`/constraints/type/${id}`);
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

//
