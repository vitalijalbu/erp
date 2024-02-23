import instance from '@/lib/api';


export const getCuttingInfo = async (idLot) => {
    try {
        const response = await instance.get(`/cutting`, {params: {
            idLot: idLot
        }});
        return {data: response.data};
    } catch (error) {
        return {data: {}, error: error};
    }
};


export const addNewCut = async (body) => {
    try {
        const response = await instance.post(`/cutting`, body);
        return {status: true};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};

export const removeCut = async (cutId) => {
    try {
        const response = await instance.delete(`/cutting/${cutId}`);
        return {status: true};
    } catch (error) {
        return {status: false, error: error};
    }
};

export const updateCuttingOrder = async (body) => {
    try {
        const response = await instance.put(`/cutting`, body);
        return {status: true};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};

export const confirmCuttingOrder = async (idLot) => {
    try {
        const response = await instance.post(`/cutting/confirm`, {
            idLot: idLot
        });
        return {status: true};
    } catch (error) {
        return {status: false, error: error};
    }
};


export const printCuttingPlanPdf = async (idLot) => {
    try {
        const response = await instance.get(`/print/cutting-order`, {params: {
            idLot: idLot
        }, responseType: 'blob'});
        return {data: response.data};
    } catch (error) {
        return {data: null, error: error};
    }
};
