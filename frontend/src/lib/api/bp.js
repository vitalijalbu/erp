import instance from "@/lib/api";

// Business Partners
export const getAllBP = async (filters) => {
	try {
		const response = await instance.get("/bp", { params: filters });
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

export const getAllBPSupplier = async (filters) => {
	const filters2 = _.merge(filters, { " columns[supplier][search][value]": 1 });

	try {
		const response = await instance.get("/bp", { params: filters2 });
		/* 	const filtered = response.data?.data?.filter((el) => el?.supplier) || [];
		response.data.data = filtered;
		response.data.recordsFiltered = filtered.length;
		response.data.recordsTotal = filtered.length; */
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// Business Partners shipping addresses
export const getBPShippingAddresses = async (id, type) => {
	try {
		const response = await instance.get(`/bp/${id}/addresses/${type}`);
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};
// Business Partners shipping addresses
export const getBPContacts = async (id, type) => {
	try {
		const response = await instance.get(`/bp/${id}/contacts/${type}`);
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// Business Partners
export const getAllBPCategories = async () => {
	try {
		const response = await instance.get("/bp/categories");
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// NAICS codes
export const getAllNAICS = async (filters) => {
	try {
		const response = await instance.get("/bp/naics", { params: filters });
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// Get BP by ID
export const getBPById = async (id) => {
	try {
		const response = await instance.get(`/bp/${id}`);
		return { data: response.data };
	} catch (error) {
		return { data: {}, error: error };
	}
};

// Create BP
export const createBP = async (body) => {
	try {
		const response = await instance.post("/bp", body);
		return { status: true, data: response?.data };
	} catch (error) {
		const validationErrors =
			error.response?.status == 422 ? error.response.data.errors : false;
		return {
			status: false,
			error: error,
			errorMsg: error.response.data.message,
			validationErrors: validationErrors,
		};
	}
};

// Update BP
export const updateBP = async (id, body) => {
	try {
		const response = await instance.put(`/bp/${id}`, body);
		return { status: true };
	} catch (error) {
		const validationErrors =
			error.response?.status == 422 ? error.response.data.errors : false;
		return {
			status: false,
			error: error,
			fields: error.response.data.message,
			errorMsg: error.response.data.message,
			validationErrors: validationErrors,
		};
	}
};

// Delete BP
export const deleteBP = async (id) => {
	try {
		const response = await instance.delete(`/bp/${id}`);
		return { status: true };
	} catch (error) {
		return { status: false, error: error };
	}
};

/* DESTINATIONS */
export const createBPDestination = async (id, body) => {
	try {
		const response = await instance.post(`/bp/${id}/destinations`, body);
		return { status: true };
	} catch (error) {
		const validationErrors =
			error.response?.status == 422 ? error.response.data.errors : false;
		return { status: false, error: error, validationErrors: validationErrors };
	}
};

export const updateBPDestination = async ({ id, selected, body }) => {
	try {
		const response = await instance.put(
			`/bp/${id}/destinations/${selected}`,
			body
		);
		return { status: true };
	} catch (error) {
		const validationErrors =
			error.response?.status == 422 ? error.response.data.errors : false;
		return { status: false, error: error, validationErrors: validationErrors };
	}
};

export const deleteBPDestination = async (id, IDdestination) => {
	try {
		const response = await instance.delete(
			`/bp/${id}/destinations/${IDdestination}`
		);
		return { status: true };
	} catch (error) {
		return { status: false, error: error };
	}
};

//=============================================================================
// BP Groups
//=============================================================================

// Business Partners Groups
export const getAllBPGroups = async (filters) => {
	try {
		const response = await instance.get("/bp-groups", { params: filters });
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// Create BP
export const createBPGroup = async (body) => {
	try {
		const response = await instance.post("/bp-groups", body);
		return { status: true, data: response?.data };
	} catch (error) {
		const validationErrors =
			error.response?.status == 422 ? error.response.data.errors : false;
		return {
			status: false,
			error: error,
			errorMsg: error.response.data.message,
			validationErrors: validationErrors,
		};
	}
};

// Update BP
export const updateBPGroup = async (id, body) => {
	try {
		const response = await instance.put(`/bp-groups/${id}`, body);
		return { status: true };
	} catch (error) {
		const validationErrors =
			error.response?.status == 422 ? error.response.data.errors : false;
		return {
			status: false,
			error: error,
			fields: error.response.data.message,
			errorMsg: error.response.data.message,
			validationErrors: validationErrors,
		};
	}
};

// Delete BP
export const deleteBPGroup = async (id) => {
	try {
		const response = await instance.delete(`/bp-groups/${id}`);
		return { status: true };
	} catch (error) {
		return { status: false, error: error };
	}
};

//=============================================================================
// Customers
//=============================================================================

export const getAllCustomers = async (filters) => {
	try {
		const response = await instance.get(
			"/bp?columns[customer][search][value]=1",
			{ params: filters }
		);
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

// Get All Customer destinations
export const getCustomerDestinations = async (id) => {
	try {
		const response = await instance.get(`/bp/${id}/destinations`);
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

//=============================================================================
// Suppliers
//=============================================================================
export const getAllSuppliers = async (filters) => {
	try {
		const response = await instance.get(
			"/bp?columns[supplier][search][value]=1",
			{ params: filters }
		);
		return response;
	} catch (error) {
		return { data: [], error: error };
	}
};

//=============================================================================
// Currency
//=============================================================================

export const getAllCurrencies = async () => {
	try {
		const response = await instance.get("currencies");
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

//=============================================================================
// Language
//=============================================================================
