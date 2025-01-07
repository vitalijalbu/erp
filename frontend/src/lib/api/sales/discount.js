import instance from "@/lib/api";

// Get all quotations
export const getAllDiscountOverride = async (filters) => {
	try {
		const response = await instance.get("/sales/require-discount-approval", {
			params: filters,
		});
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
};

export const createOverrideDiscount = async (id, data) => {
	try {
		const response = await instance.post(`/sales/${id}/approve-discount`, data);
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


// Count all approvals
export const countApproval = async () => {
	try {
		const response = await instance.get('/sales/require-discount-approval-count')
		return { data: response.data }
	} catch (error) {
		return { data: [], error: error };
		
	}
}