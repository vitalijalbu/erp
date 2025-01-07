import instance from '@/lib/api';

// Get all provinces 
export const getAllCities = async (filters) => {
    try {
        const response = await instance.get('/geo/cities', {params: filters});
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};


// Create province
export const createCity = async (body) => {
    try {
        const response = await instance.post(`/geo/cities`, body);
        return { data: response.data };
    } catch (error) {
        const validationErrors = error.response?.status == 422 ? error.response?.data.errors : false;
        return { status: false, error: error, errorMsg: error.response?.data.message, validationErrors: validationErrors };
    }
};


// Update province
export const updateCity = async (id, body) => {
    try {
        const response = await instance.put(`/geo/cities/${id}`, body);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response?.status == 422 ? error.response?.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};

// Delete province
export const deleteCity = async (id) => {
    try {
        const response = await instance.delete(`/geo/cities/${id}`);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};