import instance from "@/lib/api";

// Get all sales pricelist
export const getAllSalesPricelist = async (filters) => {
	try {
		//console.log('received-fi', filters)
		const response = await instance.get("/sales-price-lists", {
			params: filters,
		});
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// Get Sale Pricelist
export const getSalePricelist = async (id) => {
	try {
		const response = await instance.get(`/sales-price-lists/${id}`);
		return { data: response.data };
	} catch (error) {
		return { data: {}, error: error };
	}
};

// Create Sale Pricelist
export const createSalePricelist = async (body) => {
	try {
		const response = await instance.post(`/sales-price-lists`, body);
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
export const toggleSalesPricelist = async (id, body) => {
	try {
		const response = await instance.put(`/sales-price-lists/${id}/toggle`, body);
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
export const deleteSalePricelist = async (id) => {
	try {
		const response = await instance.delete(`/sales-price-lists/${id}`);
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

// Clone Pricelist
export const cloneSalePricelist = async (id, body) => {
	try {
	   const response = await instance.post(`/sales-price-lists/${id}/clone`, body);
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
 
// Change Prices
export const changePriceSalePricelist = async (id, body) => {
	try {
	   const response = await instance.put(`/sales-price-lists/${id}/change-prices`, body);
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

//=============================================================================
// API Rows
//=============================================================================

// Get all sales pricelist
export const getAllRowsPricelist = async (id, filters) => {
	try {
		//console.log('received-fi', filters)
		const response = await instance.get(`/sales-price-lists/${id}/rows`, {
			params: filters,
		});
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// Delete Row from Pricelist
export const addRowPricelist = async (id, body) => {
	try {
		const response = await instance.post(`/sales-price-lists/${id}/rows`, body);
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

// Delete Row from Pricelist
export const toggleRow = async (id, idRow, body) => {
	try {
		const response = await instance.put(
			`/sales-price-lists/${id}/rows/${idRow}/toggle`,
			body
		);
		return { data: response.data };
	} catch (error) {
		return { status: false, error: error };
	}
};

// Delete Row from Pricelist
export const deleteRowPricelist = async (id, idRow) => {
	try {
		const response = await instance.delete(
			`/sales-price-lists/${id}/rows/${idRow}`
		);
		return { data: response.data };
	} catch (error) {
		return { status: false, error: error };
	}
};

//=============================================================================
// Purchases
//=============================================================================

// Get all sales pricelist
export const getAllPurchasesPricelist = async (filters) => {
	try {
		//console.log('received-fi', filters)
		const response = await instance.get("/purchases-price-lists", {
			params: filters,
		});
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// Get Sale Pricelist
export const getPurchasePricelist = async (id) => {
	try {
		const response = await instance.get(`/sales-price-lists/${id}`);
		return { data: response.data };
	} catch (error) {
		return { data: {}, error: error };
	}
};

// Create Sale Pricelist
export const createPurchasePricelist = async (body) => {
	try {
		const response = await instance.post(`/sales-price-lists`, body);
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

// Update Sale Pricelist
export const updatePurchasePricelist = async (id, body) => {
	try {
		const response = await instance.put(`/sales-price-lists/${id}`, body);
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
export const deletePurchasePricelist = async (id) => {
	try {
		const response = await instance.delete(`/sales-price-lists/${id}`);
		return { data: response.data };
	} catch (error) {
		return { status: false, error: error };
	}
};
