import instance from '@/lib/api';

//Get last transaction by supplier and item
export const getLastTransactionsBySupplier = async (body) => {
  try {
    const response = await instance.get(`transactions/last-by-supplier-and-item`, {params: body});
    return {data: response.data};
  } catch (error) {
    return {data: [], error: error};
  }
};


export const getTransactionTypes = async () => {
    try {
        const response = await instance.get(`transactions/types`);
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};

export const getTransactionHistory = async (filters) => {
    try {
        const response = await instance.get('/reports/transaction-history', {params: filters});
        return {data: response.data}
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};

export const getTransactionHistoryExport = async (filters) => {
    try {
        const response = await instance.get('/reports/transaction-history/export', {
            params: filters,
            responseType: 'blob'
        });
        return {data: response.data}
    } catch (error) {
        return {data: [], error: error}
    }
};

export const getLatestTransactions = async () => {
    try {
        const response = await instance.get(`/transactions/last-by-user`);
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};