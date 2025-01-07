import instance from '@/lib/api';

export const getAllWarehouses = async () => {
  try {
    const response = await instance.get('/warehouses');
    return {data: response.data};
  } catch (error) {
    return {data: [], error: error};
  }
};

export const getWarehouseLocationTypes = async (params) => {
    try {
        const response = await instance.get('/warehouses/locations/types');
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
  };

 //Get location By Warehouse Id 
  export const getLocationsById = async (id) => {
    try {
        const response = await instance.get(`/warehouses/locations?columns[warehouse.id][search][value]=${id}&columns[warehouse.id][operator][value]=%3D`);
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};


/* Get Warehouse details */
export const getWarehouseById = async (id) => {
  try {
    const response = await instance.get(`/warehouses/${id}`);
    return {data: response.data};
} catch (error) {
    return {data: [], error: error};
}
};

export const getAllWarehouseLocationReport = async (filters) => {
    try {
        const response = await instance.get(`/warehouses/locations`, {params: filters});
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};

export const createWarehouse = async (body) => {
    try {
        const response = await instance.post('/warehouses', body);
        return {status: true};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};

export const createWarehouseLocation = async (warehouseId, body) => {
    try {
        const response = await instance.post(`/warehouses/${warehouseId}/locations`, body);
        return {status: true};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};

export const updateWarehouseLocation = async (locationId, warehouseId, body) => {
    try {
        const response = await instance.patch(`/warehouses/${warehouseId}/locations/${locationId}`, body);
        return {status: true};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};