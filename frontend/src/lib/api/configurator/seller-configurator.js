import instance from '@/lib/api';


export const getAllStandardProducts = async () => {
    try {
        const response = await instance.get(`standard-products`);
        return {data:response.data}
    } catch (error) {
        return {data: [], error: error};
    }
};


export const initializeConfigurator = async (payload) => {
    try {
        const response = await instance.post(`/configurator/init`,payload);
        return {data: response.data, status:response.status};
    } catch (error) {
        return {data: [], error: error};
    }
};



export const eventConfigurator = async (payload) => {
    try {
        const response = await instance.post('configurator/event', payload);
        return {data: response.data, status:response.status};
    } catch (error) {
        return {data: [], error: error};
    }
};



export const completeConfiguration = async (payload) => {
    try {
        const response = await instance.post('configurator/complete', payload);
        return {data: response.data, status:response.status};
    } catch (error) {
        return {data: [], error: error};
    }
};
