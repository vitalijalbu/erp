import instance from '@/lib/api';


export const getAllStocks = async (filters) => {
    try {
        const response = await instance.get(`/stocks`, {params: filters});
        return response;
    } catch (error) {
        return {data: [], error: error};
    }
};

export const getAllStocksExport = async (filters) => {
    try {
        const response = await instance.get(`/stocks/export`, {
            params: filters,
            responseType: 'blob'
        });
        return response;
    } catch (error) {
        throw new Error(`Failed to get data from API: ${error}`);
    }
};

export const getReportExportAll = async () => {
    try {
        const response = await instance.get(`/stocks/report-export-all`, {
            responseType: 'blob'
        });
        return {data: response.data};
    } catch (error) {
        return {data: null, error: error};
    }
};

export const addLotToInventory = async (idLot, body) => {
    try {
        const response = await instance.put(`/stocks/inventory-lots/${idLot}`, body);
        return {data: response.data};
    } catch (error) {
        return {data: null, error: error};
    }
};

export const removeLotFromInventory = async (idLot, body) => {
    try {
        const response = await instance.delete(`/stocks/inventory-lots/${idLot}`, {data: body});
        return {data: response.data};
    } catch (error) {
        return {data: null, error: error};
    }
};

//=============================================================================
// Materials Transfer
//=============================================================================

// Create materials transfer
export const createMaterialTransfer = async (body) => {
  try {
    const response = await instance.post(`/materials-transfer`, body);
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error}`);
  }
};

// Get all materials transfer
export const getAllMaterialTransfer = async () => {
  try {
    const response = await instance.get(`/materials-transfer`);
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error}`);
  }
};

// Create materials transfer
export const confirmMaterialTransfer = async (body) => {
  try {
    const response = await instance.post(`/materials-transfer/confirm`, body);
    return response;
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
  }
};

// Create materials transfer
export const deleteMaterialTransfer = async (id) => {
  try {
    const response = await instance.delete(`/materials-transfer/${id}`);
    return {data: response.data};
  } catch (error) {
      const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
      return {status: false, error: error, validationErrors: validationErrors};
  }
};

//=============================================================================
// Materials Issue
//=============================================================================

// Create materials transfer
export const createMaterialIssue = async (body) => {
  try {
    const response = await instance.post(`/materials-issue`, body);
    return response;
  } catch (error) {
      const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
      return {status: false, error: error, validationErrors: validationErrors};
  }
};

// Get all materials transfer
export const getAllMaterialIssue = async () => {
  try {
    const response = await instance.get(`/materials-issue`);
    return response;
  } catch (error) {
      const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
      return {status: false, error: error, validationErrors: validationErrors};
  }
};


// Create materials transfer
export const confirmMaterialIssue = async (body) => {
  try {
    const response = await instance.post(`/materials-issue/confirm`, body);
    return {status: true};
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
  }
};

// Create materials transfer
export const deleteMaterialIssue = async (id) => {
  try {
    const response = await instance.delete(`/materials-issue/${id}`);
    return {data: response.data};
  } catch (error) {
      const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
      return {status: false, error: error, validationErrors: validationErrors};
  }
};