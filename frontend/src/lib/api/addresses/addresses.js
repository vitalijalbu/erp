import instance from '@/lib/api';

// Get all addresses
export const getAllAddresses = async (filters) => {
	try {
		const response = await instance.get('/addresses', { params: filters })
		return { data: response.data }
	} catch (error) {
		return { data: [], error: error };
		
	}
}


export const getAddressById = async (id) => {
	try {
		const response = await instance.get(`/addresses/${id}`);
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
}
export const createAddress = async (body) => {
	try {
		const response = await instance.post(`/addresses`, body);
		return { data: response.data };
	} catch (error) {
		const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
		return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
	}

}
export const updateAddress = async (id, body) => {
	try {
		const response = await instance.put(`/addresses/${id}`, body);
		return { data: response.data };
	} catch (error) {
		const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
		return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
	}
}
export const deleteAddress = async (id) => {
	try {
		const response = await instance.delete(`/addresses/${id}`);
		return { data: response.data };
	} catch (error) {
		const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
		return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
	}
}