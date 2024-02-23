import instance from '@/lib/api';

/* Get Warehouse details */
export const getAllCountries = async () => {
    try {
        const response = await instance.get(`/countries`);
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};