import instance from '@/lib/api';

export const getAllInventory = async (filters) => {
  try {
    const response = await instance.get(`/inventory`, {params: filters});
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error.message}`);
  }
};

export const getInventoryById = async (id) => {
  try {
    const response = await instance.get(`/inventory/${id}`);
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error.message}`);
  }
};


/* Get Inventory details */
export const getInventoryLotsById = async (filters) => {
  try {
    const response = await instance.get('/reports/inventory-lots', {params: filters});
    return {data: response.data};
  } catch (error) {
    return {data: [], error: error};
  }
};

/* Get Inventory details */
export const getInventoryAdjusments = async (filters) => {
  try {
    const response = await instance.get('/reports/adjustment-inventory-lots', {params: filters});
    return {data: response.data};
  } catch (error) {
    return {data: [], error: error};
  }
};


//Update Lot Value
export const createInventory = async (body) => {
  try {
    const response = await instance.post(`/inventory`, body);
    return {status: true};
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
  }
};


//Update Lot Value
export const concludeInventory = async (id) => {
  try {
    const response = await instance.put(`/inventory/${id}/conclude`);
    return {status: true};
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {status: false, error: error, validationErrors: validationErrors};
  }
};



//Check Invetory by Lot Id
export const checkInventoryByLot = async (id) => {
  try {
    const response = await instance.get(`/lots/${id}/inventory-check`);
    return {data: response.data};
  } catch (error) {
    return {data: null, error: error};
  }
};

//Update Lot Value
export const addLotToInventory = async (id, body) => {
  try {
    const response = await instance.put(`/stocks/inventory-lots/${id}`, body);
    return {status: true};
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {status: false, error: error, validationErrors: validationErrors};
  }
};

//Update Lot Value
export const deleteLotFromInventory = async (id, body) => {
  try {
    const response = await instance.delete(`/stocks/inventory-lots/${id}`, {params: body});
    return {status: true};
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
  }
};
