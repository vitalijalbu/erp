import instance from '@/lib/api';

//Get all features
export const getAllFeatures = async (filters) => {
    try {
        const response = await instance.get(`/features`, {params: filters});
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};

// Get all available features excluding the ones or including the ones
export const getAvailableFeatures = async (filters) => {
    try {
        const response = await instance.get(`/features?${filters}`);
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};

//Get all features
export const getAllFeatureAttributes = async () => {
    try {
        const response = await instance.get(`/features/attributes`);
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};

//Get features types
export const getFeaturesTypes = async () => {
    try {
        const response = await instance.get(`features/types`);
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};

//Create feature
export const createFeature = async (body) => {
    try {
        const response = await instance.post(`/features`, body);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};


//Update feature
export const updateFeature = async (id, body) => {
    try {
        const response = await instance.put(`/features/${id}`, body);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};


//Delete feature
export const deleteFeature = async (id) => {
    try {
        const response = await instance.delete(`/features/${id}`);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }

}