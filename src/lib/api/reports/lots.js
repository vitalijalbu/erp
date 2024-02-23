import instance from '@/lib/api';


//Lot Tracking API
export const getLotTrackingReport = async (idLot, filters) => {
    try {
        const response = await instance.get('/reports/lot-tracking', {params: {
            ...filters,
            idLot: idLot
        }});
        return {data: response.data}
    } catch (error) {
      const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
      return {data: [], error: error, validationErrors: validationErrors};
    }
};


/* Export EXCEL Lot Tracking */
export const exportReportsTracking = async (idLot, filters) => {
    try {
        const response = await instance.get('/reports/lot-tracking/export', {params: {
            ...filters,
            idLot: idLot
        }, responseType: 'blob'});
        return {data: response.data}
    } catch (error) {
        return {data: null, error: error}
    }
};

export const getLotShippedReport = async (filters) => {
  try {
      const response = await instance.get('/reports/lot-shipped-bp', {params: filters});
      return {data: response.data}
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {data: [], error: error, validationErrors: validationErrors};
  }
};


export const exportLotShipped = async (filters) => {
  try {
      const response = await instance.get('/reports/lot-shipped-bp/export', {params: filters, responseType: 'blob'});
      return {data: response.data}
  } catch (error) {
      return {data: null, error: error}
  }
};


export const getLotReceivedReport = async (filters) => {
  try {
      const response = await instance.get('/reports/lot-received-bp', {params: filters});
      return {data: response.data}
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {data: [], error: error, validationErrors: validationErrors};
  }
};

export const exportLotReceived = async (filters) => {
  try {
      const response = await instance.get('/reports/lot-received-bp/export', {params: filters, responseType: 'blob'});
      return {data: response.data}
  } catch (error) {
      return {data: null, error: error}
  }
};

//Lot Tracking API
export const getLotValueHistory = async (id) => {
  try {
    const response = await instance.get(`lots/${id}/value-history`);
    return {data: response.data};
  } catch (error) {
    return {data: {}, error: error}
  }
};