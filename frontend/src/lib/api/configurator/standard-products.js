import instance from '@/lib/api';

// Get all standard products
export const getAllStdProducts = async (filters) => {
    try {
        const response = await instance.get('/standard-products', {params: filters});
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};

// Get standard products by id
export const getStdProduct = async (id) => {
    try {
        const response = await instance.get(`/standard-products/${id}`);
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};

// Create standard product
export const createStdProduct = async (body) => {
    try {
        const response = await instance.post(`/standard-products`, body);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
    }
};

// Update standard product
export const updateStdProduct = async (id, body) => {
    try {
        const response = await instance.put(`/standard-products/${id}`, body);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
    }
};

// Duplicate standard product
export const cloneStdProduct = async (id, body) => {
    try {
        const response = await instance.post(`/standard-products/${id}/clone`, body);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
    }
};

// Delete standard product
export const deleteStdProduct = async (id) => {
    try {
        const response = await instance.delete(`/standard-products/${id}`);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
    }
};


//=============================================================================
// Configuration API
//=============================================================================


// Create feature standard product
export const createFeatureStdProduct = async (id, body) => {
    try {
        const response = await instance.post(`/standard-products/${id}/configure`, body);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
    }
};

// Update feature standard product
export const updateFeatureStdProduct = async (id, configId,  body) => {
    try {
        const response = await instance.put(`/standard-products/${id}/configure/${configId}`, body);
        return {data: response};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
    }
};

// Delete feature associated standard product
export const deleteFeatureAssociatedStdProduct = async (idStdProduct, id) => {
    try {
        const response = await instance.delete(`/standard-products/${idStdProduct}/configure/${id}`);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
    }
};

// Create bulk features to std product
export const createBulkFeatures = async (id, body) => {
    try {
        const {data, status} = await instance.post(`/standard-products/${id}/configure/bulk-features`, body);
        return {data: data, status: status };
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
    }
};


//=============================================================================
// BOM Rules API
//=============================================================================


// Create BOM rule standard product
export const createBOMRuleStdProduct = async (id, body) => {
    try {
        const response = await instance.post(`/standard-products/${id}/bom-rule`, body);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
    }
};

// Update BOM rule standard product
export const updateBOMRuleStdProduct = async (id, bomRuleId,  body) => {
    try {
        const response = await instance.put(`/standard-products/${id}/bom-rule/${bomRuleId}`, body);
        return {data: response};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
    }
};

// Delete feature associated standard product
export const deleteBOMRuleAssociatedStdProduct = async (idStdProduct, id) => {
    try {
        const response = await instance.delete(`/standard-products/${idStdProduct}/bom-rule/${id}`);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
    }
};

// Create bulk BOM Rules to std product
export const createBulkBOMRules = async (id, body) => {
    try {
        const {data, status} = await instance.post(`/standard-products/${id}/bom-rule/bulk-bom-rules`, body);
        return {data: data, status: status };
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
    }
};






//=============================================================================
// Routing Rules API
export const createRoutingStdProduct = async (id, body) => {
    try {
        const response = await instance.post(`/standard-products/${id}/routing`, body);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
    }
};


export const deleteRoutingRuleAssociatedStdProduct = async (id, routing) => {
    try {
        const response = await instance.delete(`/standard-products/${id}/routing/${routing}`);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
    }
};

export const createBulkRoutingRules = async (id, body) => {
    try {
        const {data, status} = await instance.post(`/standard-products/${id}/routing/bulk-routing`, body);
        return {data: data, status: status };
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
    }
};



export const doProcessCall = async () => {
    try {
        const response = await instance.get(`/processes`);
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
    }
};


export const createSalesPricingStdProduct = async (id, body) => {
    try {
        const {data, status} = await instance.post(`/standard-products/${id}/sale-pricing/bulk-pricing`, body);
        return {data: data, status: status };
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
    }
};
