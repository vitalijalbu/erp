import instance from '@/lib/api';


export const printLabelsPdf = async (ids) => {
    try {
        const response = await instance.get(`/print/labels`, {params: {
            ids: ids
        }, responseType: 'blob'});
        return {data: response.data};
    } catch (error) {
        return {data: null, error: error};
    }
};