import instance from "@/lib/api";

// Get all sales sequences
export const getAllSalesSequences = async (filters) => {
	try {
		//console.log('received-fi', filters)
		const response = await instance.get("/sale-sequences", { params: filters });
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// Get Sale Pricelist
export const getSaleSequence = async (id) => {
	try {
		const response = await instance.get(`/sale-sequences/${id}`);
		return { data: response.data };
	} catch (error) {
		return { data: {}, error: error };
	}
};

// Create Sale Pricelist
export const createSaleSequence = async (body) => {
	try {
		const response = await instance.post(`/sale-sequences`, body);
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
export const updateSaleSequence = async (id, body) => {
	try {
		const response = await instance.put(`/sale-sequences/${id}`, body);
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
export const deleteSaleSequence = async (id) => {
	try {
		const response = await instance.delete(`/sale-sequences/${id}`);
		return { data: response.data };
	} catch (error) {
		return { status: false, error: error };
	}
};
