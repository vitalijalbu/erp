import instance from '@/lib/api';

export const getCuttingHistoryReports = async (filters) => {
    try {
        const response = await instance.get('/reports/cutting-history', {params: filters});
        return {data: response.data}
    } catch (error) {
        return {data: [], error: error}
    }
};




/* Get Customer details */
/*
export const getCuttingReportById = async (id) => {
  try {
    const response = await instance.get(`/reports/cutting-history/${id}`);
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error.message}`);
  }
};
*/

/* Export EXCEL */
export const exportReportsCuttingWaste = async (filters) => {
    try {
        const response = await instance.get('/reports/cutting-waste/export', {
            params: filters, 
            responseType: 'blob'
        });
        return {data: response.data}
    } catch (error) {
        return {data: [], error: error}
    }
};


export const getCuttingWasteReports = async (filters) => {
    try {
        const response = await instance.get('/reports/cutting-waste', {params: filters});
        return {data: response.data}
    } catch (error) {
        return {data: [], error: error}
    }
};


//Active
export const getCuttingActiveReports = async (filters) => {
    try {
        const response = await instance.get('/reports/cutting-active', {params: filters});
        return {data: response.data}
    } catch (error) {
        return {data: [], error: error}
    }
};


/* Export EXCEL */
export const exportReportsCuttingActive = async (filters) => {
    try {
        const response = await instance.get('/reports/cutting-active/export', {
            params: filters, 
            responseType: 'blob'
        });
        return {data: response.data}
    } catch (error) {
        return {data: [], error: error}
    }
};
