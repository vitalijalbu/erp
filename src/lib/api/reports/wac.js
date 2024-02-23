import instance from '@/lib/api';


export const getAllLayers = async () => {
    try {
        const response = await instance.get(`/wac/layers`);
        return response;
    } catch (error) {
        return {data: [], error: error};
    }
};

export const getAvailableYears = async () => {
    try {
        const response = await instance.get(`/wac/available-years`);
        return {data: response.data};
    } catch (error) {
      return {data: [], error: error};
    }
};


export const addOrRecreateLayer = async (year) => {
    try {
        const response = await instance.post(`/wac`, {year: year});
        return {status: true};
    } catch (error) {
      const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
      return {status: false, error: error, validationErrors: validationErrors};
    }
};


export const getLayerDetails = async (filters, year) => {
    try {
        const response = await instance.get(`/wac/layers/${year}/report`, {params: filters});
        return {data: response.data};
    } catch (error) {
      const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
      return {data: [], error: error, validationErrors: validationErrors};
    }
};

export const getLayerDetailsExport = async (filters, year) => {
    try {
        const response = await instance.get(`/wac/layers/${year}/report/export`, {
            params: filters,
            responseType: 'blob'
        });
        return {data: response.data};
    } catch (error) {
      return {data: null, error: error};
    }
};


export const calcYearToDate = async (filters) => {
    try {
        const response = await instance.get(`/wac/calc-year-to-date`, {params: filters});
        return {data: response.data};
    } catch (error) {
      const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
      return {data: [], error: error, validationErrors: validationErrors};
    }
};

export const calcYearToDateDetails = async (filters) => {
    try {
        const response = await instance.get(`/wac/calc-year-to-date-lots-details`, {params: filters});
        return {data: response.data};
    } catch (error) {
      const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
      return {data: [], error: error, validationErrors: validationErrors};
    }
};

export const calcSimulation = async (filters) => {
    try {
        const response = await instance.get(`/wac/calc-simulation`, {params: filters});
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {data: [], error: error, validationErrors: validationErrors};
    }
};



export const getWacYtdLotsReports = async (filters) => {
    try {
        const response = await instance.get('/wac/calc-year-to-date-lots-details', {params: filters});
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};

//Da controllare
export const getWacYtdLotsDetailExport = async (filters) => {
    try {
      const response = await instance.get(`/wac/calc-year-to-date-lots-details/export`, {
            params: filters,
            responseType: 'blob'
        })
        return {data: response.data};

    } catch (error) {
        return {data: null, error: error};
    }   

}

export const calcYearToDateExport = async (filters) => {
    try {
      const response = await instance.get(`/wac/calc-year-to-date/export`, {
        params: filters,
        responseType: 'blob'
    })
    return {data: response.data};

    } catch (error) {
        return {data: null, error: error};
    }   

}

export const calcSimulationExport = async (filters) => {
    try {
      const response = await instance.get(`/wac/calc-simulation/export`, {
        params: filters,
        responseType: 'blob'
    })
    return {data: response.data};

    } catch (error) {
        return {data: null, error: error};
    }   

}

export const setLayerDefinitive = async (IDlayer) => {
    try {
        const response = await instance.put(`/wac/${IDlayer}/set-definitive`);
        return {status: true};
    } catch (error) {
        return {status: false, error: error};
    }
};