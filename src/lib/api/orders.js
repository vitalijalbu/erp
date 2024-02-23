import instance from "@/lib/api";

//=============================================================================
// Orders
//=============================================================================

// Get all Order Types
export const getAllOrderTypes = async () => {
	try {
		const response = await instance.get("/order-types");
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// Get all Order Types
export const getAllOrderStatuses = async () => {
	try {
		const response = await instance.get("/order-types");
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// Print sale PDF
export const printSale = async (id) => {
	try {
		const response = await instance.get(`/sales/${id}/print`, { responseType: "blob" });
		return { dataResponse: response.data };
	} catch (error) {
		return { dataResponse: null, error: error };
	}
};

// Send sale via Mail
export const sendMailSale = async (id, body) => {
	try {
		const response = await instance.post(`/sales/${id}/send`, body);
		return { status: true, data: response?.data };
	} catch (error) {
		const validationErrors = error.response?.status == 422 ? error.response.data.errors : false;
		return {
			status: false,
			error: error,
			errorMsg: error.response.data.message,
			validationErrors: validationErrors,
		};
	}
};
//=============================================================================
// Sales
//=============================================================================

// Get all Sales
export const getAllSales = async (filters) => {
	try {
		const response = await instance.get("/sales", { params: filters });
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// Get all Sales Types
export const getAllSalesTypes = async () => {
	try {
		const response = await instance.get("/sales/types");
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// Get Sale
export const getSaleById = async (id) => {
	try {
		const response = await instance.get(`/sales/${id}`);
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// Create Sale
export const createSale = async (body) => {
	try {
		const response = await instance.post("/sales", body);
		return { status: true, data: response?.data };
	} catch (error) {
		const validationErrors = error.response?.status == 422 ? error.response.data.errors : false;
		return {
			status: false,
			error: error,
			errorMsg: error.response.data.message,
			validationErrors: validationErrors,
		};
	}
};


// Update Sale
export const updateSale = async (id, body) => {
	try {
		const response = await instance.put(`/sales/${id}`, body);
		return { status: true, data: response.data };
	} catch (error) {
		const validationErrors = error.response?.status == 422 ? error.response.data.errors : false;
		return {
			status: false,
			error: error,
			fields: error.response.data.message,
			errorMsg: error.response.data.message,
			validationErrors: validationErrors,
		};
	}
};

// Create or Update sale row 
export const storeRowItem = async (id, body) => {
	try {
		const response = await instance.post(`/sales/${id}/row`, body);
		return { data: response.data };
	} catch (error) {
		const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
		return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
	}

}

// Convert sale to order
export const convertSale = async (body) => {
	try {
		const response = await instance.post(`/sales/quotation-to-sale`, body);
		return { data: response.data };
	} catch (error) {
		const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
		return {
			status: false,
			error: error,
			errorMsg: error.response.data.message,
			validationErrors: validationErrors,
		};
	}
};

// Delete Sale
export const updateOrderStats = async (id, body) => {
	try {
		const response = await instance.post(`/sales/${id}/change-state`, body);
		return { status: true };
	} catch (error) {
		const validationErrors = error.response?.status == 422 ? error.response.data.errors : false;
		return {
			status: false,
			error: error,
			fields: error.response.data.message,
			errorMsg: error.response.data.message,
			validationErrors: validationErrors,
		};
	}
};

export const updateRowState = async (id, state) => {
	try {
		const response = await instance.post(`/sales/row/${id}/change-state`, { state: state });
		console.log("rowstateres", response);
		return { status: response.status };
	} catch (error) {
		const validationErrors = error.response?.status == 422 ? error.response.data.errors : false;
		return {
			status: false,
			error: error,
			fields: error.response.data.message,
			errorMsg: error.response.data.message,
			validationErrors: validationErrors,
		};
	}
};

// price-calculation
export const getSaleRowPrices = async (body, controller) => {
	try {
		const response = await instance.post("/sales/get-row-price-preview", body, {
			signal: controller,
		});
		return { data: response?.data };
	} catch (error) {
		if (error.name === "CanceledError") {
			// Request was aborted, handle accordingly
			console.log("Request aborted");
			return {};
		}
		const validationErrors =
			error.response?.status == 422 ? error.response?.data.errors : false;
		return {
			status: error.response?.status,
			error: error,
			fields: error.response?.data.message,
			errorMsg: error.response?.data.message,
			validationErrors: validationErrors,
		};
	}
};
