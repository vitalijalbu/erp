import instance from '@/lib/api';

//Get lot by id
export const getLotStockById = async (id) => {
  try {
    const response = await instance.get(`/lots/${id}/stocks`);
    return {data: response.data};
  } catch (error) {
    return {data: [], error: error}
  }
};


//Get lot by Item Id
export const getLotByItemId = async (id) => {
  try {
    const response = await instance.get(`/lots?columns[IDitem][search][value]=${id}&columns[IDitem][search][operator]=%3D`);
    return {data: response.data};
  } catch (error) {
    return {data: [], error: error};
  }
};


//Get lot values
export const getLotValues = async (filters) => {
  try {
    const response = await instance.get(`/lots/values`, {params: filters});
    return {data: response.data};
  } catch (error) {
    return {data: [], error: error};
  }
};

//Update lot values
export const updateBulkLotValues = async (body) => {
  try {
    const response = await instance.put(`/lots/values`, body);
    return {status: true};
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors};
  }
};



//Get lot dimensions
export const getLotDimensions = async (id) => {
  try {
    const response = await instance.get(`/stocks/${id}/lot-dimensions`);
    return {data: response.data};
  } catch (error) {
    return {data: {}, error: error};
  }
};


//Delete lot from stock
export const deleteLotFromStock = async (id, body) => {
  try {
    const response = await instance.delete(`/stocks/${id}/erase-lot`, {params: body});
    return {status: true}
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {status: false, error: error, validationErrors: validationErrors};
  }
};

//Erase lot & add new
export const eraseLotStock = async (id, body) => {
  try {
    const response = await instance.put(`/stocks/${id}/erase-and-add-new-lot`, body);
    return {status: true};
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {status: false, error: error, validationErrors: validationErrors};
  }
};

//Update Lot Text
export const updateLotText = async (id, body) => {
  try {
    const response = await instance.put(`/lots/${id}/text`, body);
    return {status: true};
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {status: false, error: error, validationErrors: validationErrors};
  }
};


//Update Lot Value
export const updateLotValue = async (id, body) => {
  try {
    const response = await instance.put(`/lots/${id}/value`, body);
    return {status: true};
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {status: false, error: error, validationErrors: validationErrors};
  }
};

//Update Lot Value
export const updateLoInfo = async (id, body) => {
  try {
    const response = await instance.put(`/lots/${id}/info`, body);
    return {status: true};
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {status: false, error: error, validationErrors: validationErrors};
  }
};



//=============================================================================
// Lots Merge
//=============================================================================

//Get Lot To Merge
export const getLotToMerge = async (body) => {
  try {
    const response = await instance.get(`/order-lot-merge`, {params: body});
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error.message}`);
  }
};

//Get Additional Lots To Merge
export const getAdditionalLotsToMerge = async (body) => {
  try {
    const response = await instance.get(`/order-lot-merge/additional-lots`, {params: body});
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error.message}`);
  }
};

//Update Lot Value
export const createMerge = async (body) => {
  try {
    const response = await instance.post(`/order-lot-merge`, body);
    return {status: true};
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {status: false, error: error, validationErrors: validationErrors};
  }
};

//Update Lot Value
export const deleteMerge = async (id) => {
  try {
    const response = await instance.delete(`/order-lot-merge/${id}`);
    return {status: true};
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {status: false, error: error, validationErrors: validationErrors};
  }
};