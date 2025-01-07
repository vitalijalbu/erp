import instance from '@/lib/api';

export const getOpenPurchases = async (params) => {
  try {
    const response = await instance.get('/reports/open-purchase-biella', {
      params: params
    });
    return {data: response.data};
  } catch (error) {
    return {data: [], error: error};
  }
};

export const getOpenPurchasesExport = async (params) => {
  try {
    const response = await instance.get('/reports/open-purchase-biella/export', {
      params: params,
      responseType: 'blob'
    });
    return {data: response.data};
  } catch (error) {
    return {data: null, error: error};
  }
};