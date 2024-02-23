import instance from '@/lib/api';

//Confirm receipt
export const confirmReceiptPurchase = async (body) => {
    try {
        const response = await instance.post(`/receipts/purchase`, body);
        return {status: true};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};


export const printLabelRange = async (body) => {
    try {
        const response = await instance.get(`/print/label-range`, {params: body, responseType: 'blob'});
        return {data: response.data};
    } catch (error) {
        let validationErrors = false;
        if(error.response.status == 422) {
            const jsonResponse = JSON.parse(await error.response.data.text());
            validationErrors = jsonResponse?.errors;
        }
        return {data: null, error: error, validationErrors: validationErrors};
    }
};

export const getFromChiorinoItems = async (params) => {
    try {
        const response = await instance.get(`/receipts/from-chiorino`, {
            params
        });
        return {data: response.data};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {data: [], error: error, validationErrors: validationErrors};
    }
};

export const confirmReceiptFromChiorino = async (body) => {
    try {
        const response = await instance.post(`/receipts/from-chiorino/confirm`, body);
        return {status: true};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};
