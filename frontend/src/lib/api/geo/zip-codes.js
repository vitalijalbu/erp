import instance from '@/lib/api';

// Get all zipcodes 
export const getAllZipCodes = async (filters) => {
    try {
        const response = await instance.get('/geo/zips', {params: filters});
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};


// Create zipcode
export const createZipCode = async (body) => {
    try {
        const response = await instance.post(`/geo/zips`, body);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
      }
};


// Update zipcode
export const updateZipCode = async (id, body) => {
    try {
        const response = await instance.put(`/geo/zips/${id}`, body);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};

// Delete zipcode
export const deleteZipCode = async (id) => {
    try {
        const response = await instance.delete(`/geo/zips/${id}`);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};