import instance from '@/lib/api';


//=============================================================================
// Functions API
//=============================================================================

// Get all function
export const getAllFunctions = async (filters) => {
    try {
        const response = await instance.get(`/functions`, { params: filters });
        return { data: response.data };
    } catch (error) {
        return { data: [], error: error };
    }
};

// Get function by id
export const getFunctionById = async (id) => {
    try {
        const response = await instance.get(`/functions/${id}`);
        return { data: response.data };
    } catch (error) {
        return { data: [], error: error };
    }
};

// Create function
export const createFunction = async (body) => {
    try {
        const response = await instance.post(`/functions`, body);
        return { data: response.data };
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
    }
};


// Update function
export const updateFunction = async (id, body) => {
    try {
        const response = await instance.put(`/functions/${id}`, body);
        return { data: response.data };
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return { status: false, error: error, validationErrors: validationErrors };
    }
};

// Delete function
export const deleteFunction = async (id) => {
    try {
        const response = await instance.delete(`/functions/${id}`);
        return { data: response.data };
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return { status: false, error: error, validationErrors: validationErrors };
    }
};


// Test function
export const testFunction = async (id, body) => {
    try {//id funzione nell'url e nel body chiave params
        const response = await instance.post(`/functions/${id}/test`, { params: body });
        return { data: response.data, status: response.status};
    } catch (error) {
        const validationErrors =
            error.response && error.response.status === 422
                ? error.response.data.errors
                : false;

        return {
            status: error.response.status,
            error: error,
            validationErrors: validationErrors,
        };


    }
};

//=============================================================================
// Categories API
//=============================================================================

// Get all categories
export const getAllFunctionCategories = async () => {
    try {
        const response = await instance.get(`/function-categories`);
        return { data: response.data };
    } catch (error) {
        return { data: [], error: error };
    }
};

// Create category
export const createFunctionCategory = async (body) => {
    try {
        const response = await instance.post(`/function-categories`, body);
        return { data: response.data };
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return { status: false, error: error, validationErrors: validationErrors };
    }
};

// Update category
export const updateFunctionCategory = async (id, body) => {
    try {
        const response = await instance.put(`/function-categories/${id}`, body);
        return { data: response.data };
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return { status: false, error: error, validationErrors: validationErrors };
    }
};

// Delete category
export const deleteFunctionCategory = async (id) => {
    try {
        const response = await instance.delete(`/function-categories/${id}`);
        return { data: response.data };
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return { status: false, error: error, validationErrors: validationErrors };
    }
};


