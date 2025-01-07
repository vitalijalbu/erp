import instance from '@/lib/api';

// Get all provinces 
export const getAllProvinces = async (filters) => {
    try {
        const response = await instance.get('/geo/provinces', {params: filters});
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};


// Create province
export const createProvince = async (body) => {
    try {
        const response = await instance.post(`/geo/provinces`, body);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response?.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, errorMsg: error.response?.data.message, validationErrors: validationErrors};
      }
};


// Update province
export const updateProvince = async (id, body) => {
    try {
        const response = await instance.put(`/geo/provinces/${id}`, body);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};

// Delete province
export const deleteProvince = async (id) => {
    try {
        const response = await instance.delete(`/geo/provinces/${id}`);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};