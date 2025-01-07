import instance from "@/lib/api";

// Get all sales matrix
export const getAllDiscountTotalMatrix = async (filters) => {
	try {
		//console.log('received-fi', filters)
		const response = await instance.get("/sales-total-discount-matrix", {
			params: filters,
		});
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// Get Sale Pricelist
export const getDiscountTotalMatrix = async (id) => {
	try {
		const response = await instance.get(`/sales-total-discount-matrix/${id}`);
		return { data: response.data };
	} catch (error) {
		return { data: {}, error: error };
	}
};

// Create Sale Pricelist
export const createDiscountTotalMatrix = async (body) => {
	try {
		const response = await instance.post(`/sales-total-discount-matrix`, body);
		return { status: true, data: response.data };
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

// Toggle Sale Pricelist
export const toggleDiscountTotalMatrix = async (id, body) => {
	try {
		const response = await instance.put(`/sales-total-discount-matrix/${id}/toggle`, body);
		return { status: true, data: response.data };
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

// Delete Pricelist
export const deleteDiscountTotalMatrix = async (id) => {
	try {
		const response = await instance.delete(`/sales-total-discount-matrix/${id}`);
		return { data: response.data };
	} catch (error) {
		const validationErrors =
		   error.response.status === 422 ? error.response.data.errors : false;
		return {
		   status: false,
		   error: error,
		   errorMsg: error.response.data.message,
		   validationErrors: validationErrors,
		};
	 }
};


 
//=============================================================================
// API Rows
//=============================================================================

// Get all sales matrix
export const getAllRows = async (id, filters) => {
	try {
		//console.log('received-fi', filters)
		const response = await instance.get(`/sales-total-discount-matrix/${id}/rows`, {
			params: filters,
		});
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// Delete ROw from Pricelist
export const addRow = async (id, body) => {
	try {
		const response = await instance.post(
			`/sales-total-discount-matrix/${id}/rows`,
			body
		);
		return { status: true, data: response.data };
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

// Delete ROw from Pricelist
export const toggleRow = async (id, idRow, body) => {
	try {
		const response = await instance.put(
			`/sales-total-discount-matrix/${id}/rows/${idRow}/toggle`,
			body
		);
		return { data: response.data };
	} catch (error) {
		const validationErrors =
		   error.response.status === 422 ? error.response.data.errors : false;
		return {
		   status: false,
		   error: error,
		   errorMsg: error.response.data.message,
		   validationErrors: validationErrors,
		};
	 }
};

// Delete ROw from Pricelist
export const deleteRow = async (id, idRow) => {
	try {
		const response = await instance.delete(
			`/sales-total-discount-matrix/${id}/rows/${idRow}`
		);
		return { data: response.data };
	} catch (error) {
		const validationErrors =
		   error.response.status === 422 ? error.response.data.errors : false;
		return {
		   status: false,
		   error: error,
		   errorMsg: error.response.data.message,
		   validationErrors: validationErrors,
		};
	 }
};
