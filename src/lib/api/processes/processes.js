import instance from '@/lib/api';

export const getAllProcesses = async (filters) => {
	try {
		const response = await instance.get('/processes', { params: filters });
		return { data: response.data }
	} catch (error) {
		return { data: [], error: error };
	}
}

export const getProcessById = async (id) => {
	try {
		const response = await instance.get(`/processes/${id}`);
		return { data: response.data };
	} catch (error) {
		return { data: [], error: error };
	}
}

export const createProcess = async (body) => {
	try {
		const body2=body;
		// remove id from body
	

		const response = await instance.post(`/processes`, body2);
		return { data: response.data };
	} catch (error) {
		const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
		return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
	}
}

export const updateProcess = async (id, body) => {
	try {
		const response = await instance.put(`/processes/${id}`, body);

		return { data: response.data };
	} catch (error) {
		
		const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
		return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
	}
}

export const deleteProcess = async (id) => {
	try {
		const response = await instance.delete(`/processes/${id}`);
		return { data: response.data };
	} catch (error) {
		
		const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
		return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
	}
}

export const processesAutocomplete = async (filters) => {
    try {
        const response = await instance.get(`/processes/autocomplete`, {params: {search:filters}});
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};
