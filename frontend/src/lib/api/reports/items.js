import instance from '@/lib/api';

export const getUnloadItemReports = async (filters) => {
    try {
        const response = await instance.get('/reports/unloaded-item', {params: filters});
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};

export const exportReportsUnloadItem = async (filters) => {
    try {
        const response = await instance.get('/reports/unloaded-item/export', {
            params: filters,
            responseType: 'blob'
        });
        return {data: response.data};
    } catch (error) {
        return {data: null, error: error};
    }
};