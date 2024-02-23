import instance from '@/lib/api';


export const getProductionOrderInfo = async (idLot) => {
    try {
        const response = await instance.get(`/orders-production`, {params: {
            idLot: idLot
        }});
        return {data: response.data};
    } catch (error) {
        return {data: {}, error: error};
    }
};


export const addComponent = async (idLot, idItem) => {
    try {
        const response = await instance.post(`/orders-production`, {
            idLot,
            idItem
        });
        return {status: true};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};

export const removeComponent = async (IDcomp) => {
    try {
        const response = await instance.delete(`/orders-production/${IDcomp}`);
        return {status: true};
    } catch (error) {
        return {status: false, error: error};
    }
};

export const updateOrder = async (body) => {
    try {
        const response = await instance.put(`/orders-production`, body);
        return {status: true};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};

export const confirmOrder = async (idLot) => {
    try {
        const response = await instance.post(`/orders-production/confirm`, {
            idLot: idLot
        });
        return {status: true};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};


export const printCuttingPlanPdf = async (idLot) => {
    try {
        const response = await instance.get(`/cutting/print`, {params: {
            idLot: idLot
        }, responseType: 'blob'});
        return {data: response.data};
    } catch (error) {
        return {data: null, error: error};
    }
};

export const printCuttingLabelsPdf = async (ids) => {
    try {
        const response = await instance.get(`/cutting/print-labels`, {params: {
            ids: ids
        }, responseType: 'blob'});
        return {data: response.data};
    } catch (error) {
        return {data: null, error: error};
    }
};