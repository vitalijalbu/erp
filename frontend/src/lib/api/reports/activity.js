import instance from '@/lib/api';

export const getActivityViewerReports = async () => {
    try {
        const response = await instance.get('/reports/activity-viewer');
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};
