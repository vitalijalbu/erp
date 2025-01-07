import instance from '@/lib/api';

export const getStockLimitsReports = async (idWarehouse, filters) => {
  try {
    const response = await instance.get('/reports/stock-limits', {
      params: {
        idWarehouse: idWarehouse,
        ...filters
      }
    });
    return {data: response.data};
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {data: [], error: error, validationErrors: validationErrors};
  }
};

export const getStockLimitsExport = async (idWarehouse, filters) => {
  try {
    const response = await instance.get('/reports/stock-limits/export', {
      params: {
        idWarehouse: idWarehouse,
        ...filters
      },
      responseType: 'blob'
    });
    return {data: response.data};
  } catch (error) {
    return {data: null, error: error};
  }
};

//
export const getReportsStockWidth = async (filters) => {
    try {
        const response = await instance.get('/reports/stock-by-width', {params: filters});
        return {data: response.data}
    } catch (error) {
        return {data: [], error: error}
    }
};



export const getGraphStock = async (filters) => {
  try {
    const response = await instance.get('/reports/graph-stock-at-date', {params: filters});
    return {data: response.data};
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {data: [], error: error, validationErrors: validationErrors};
  }
};

export const getStockValue = async (filters) => {
  try {
    const response = await instance.get('/reports/stock-value-by-group', {params: filters});
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error}`);
  }
};

export const getStockValueItem = async (filters) => {
  try {
    const response = await instance.get('/reports/stock-value-by-item', {params: filters});
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error}`);
  }
};




export const getStockValueDate = async (filters) => {
  try {
    const response = await instance.get('/reports/stock-value-on-date', {params: filters});
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error}`);
  }
};

export const getStockValueDateExport = async (filters) => {
  try {
    const response = await instance.get('/reports/stock-value-on-date/export', {
      params: filters,
      responseType: 'blob'
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error}`);
  }
};

export const getStockLotDetails = async (filters) => {
  try {
    const response = await instance.get('/reports/stock-on-date-details', {params: filters});
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error}`);
  }
};

export const getStockLotDetailsExport = async (filters) => {
  try {
    const response = await instance.get('/reports/stock-on-date-details/export', {
      params: filters,
      responseType: 'blob'
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error}`);
  }
};
