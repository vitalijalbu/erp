import instance from '@/lib/api';

//Get UM Dimensions 
export const getAllUM = async () => {
  try {
    const response = await instance.get('/um');
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error.message}`);
  }
};

//Get UM Dimensions By Category
export const getUMById = async (um) => {
  try {
    const response = await instance.get(`/um/${um}/dimensions`);
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error.message}`);
  }
};

//Get All Timezones
export const getAllTimezones = async (filters) => {
  try {
      const response = await instance.get(`/timezones`, {params: filters});
      return {data: response.data};
  } catch (error) {
      return {data: [], error: error};
  }
};

// Get all adjustments type for page
export const getAdjustmentTypes = async () => {
  try {
    const response = await instance.get('/adjustments-type');
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error.message}`);
  }
};


// Get all adjustments type for page
export const getAllLanguages = async () => {
  try {
    const response = await instance.get('/languages');
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error.message}`);
  }
};


// Business Partners
export const getAllLanguagesDoc = async () => {
  try {
    const response = await instance.get('/document-languages');
    return {data: response.data};
  } catch (error) {
      return {data: [], error: error};
  }
};


// Business Partners
export const getAllDeliveryTerms = async () => {
  try {
    const response = await instance.get('/delivery-terms');
    return {data: response.data};
  } catch (error) {
      return {data: [], error: error};
  }
};


// Business Partners
export const getAllShippingtMethods = async () => {
  try {
    const response = await instance.get('/invoice-shipping-methods');
    return {data: response.data};
  } catch (error) {
      return {data: [], error: error};
  }
};


