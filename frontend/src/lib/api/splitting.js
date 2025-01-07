import instance from '@/lib/api';


export const getSplittingInfo = async (idStock) => {
    try {
        const response = await instance.get(`/order-split`, {params: {
            idStock: idStock
        }});
        return {data: response.data};
    } catch (error) {
        return {data: {}, error: error};
    }
};

export const addNewCut = async (body) => {
    try {
        const response = await instance.post(`/order-split`, body);
        return {status: true};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};

export const removeCut = async (cutId) => {
    try {
        const response = await instance.delete(`/order-split/${cutId}`);
        return {status: true};
    } catch (error) {
        return {status: false, error: error};
    }
};

export const confirmSplitOrder = async (idStock) => {
    try {
        const response = await instance.post(`/order-split/confirm`, {
            idStock: idStock
        });
        return {status: true};
    } catch (error) {
        return {status: false, error: error};
    }
};