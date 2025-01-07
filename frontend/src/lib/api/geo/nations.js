import instance from '@/lib/api';

// Get all nations 
export const getAllNations = async (filters) => {
    try {
        const response = await instance.get('/geo/nations', {params: filters});
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};