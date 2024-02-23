import instance from '@/lib/api';

// Get all quotations
export const getAllQuotations = async (filters) => {
	try {
		const response = await instance.get('/quotations', { params: filters })
		return { data: response.data }
	} catch (error) {
		return { data: [], error: error };
		
	}
}


// Get quotation by id
export const getQuotationById = async (id) => {
	try {
		const response = await instance.get(`/quotations/${id}`);
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
}

// Create quotation
export const createQuotation = async (body) => {
	try {
		const response = await instance.post(`/quotations`, body);
		return { data: response.data };
	} catch (error) {
		const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
		return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
	}

}



// Update quotation
export const updateQuotation = async (id, body) => {
	try {
		const response = await instance.put(`/quotations/${id}`, body);
		return { data: response.data };
	} catch (error) {
		const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
		return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
	}
}



// Delete quotation
export const deleteQuotation = async (id) => {
	try {
		const response = await instance.delete(`/quotations/${id}`);
		return { data: response.data };
	} catch (error) {
		const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
		return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
	}
}


export const getMailTemplate = async(id) => {
	try {
		const response = await instance.get(`sales/${id}/send-template`);
		return {data: response.data};
	} catch (error) {
		return { status: false, error: error };
	}	
}