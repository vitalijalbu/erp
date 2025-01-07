import instance from '@/lib/api';

// Working days rules
export const getAllWorkingDays = async () => {
  try {
    const response = await instance.get('/working-days-rules');
    return {data: response.data};
  } catch (error) {
      return {data: [], error: error};
  }
};

// Working days rules
export const checkWorkingDays = async (filters) => {
  try {
    const response = await instance.get('/working-days-rules/check', {params: filters});
    return {data: response.data};
  } catch (error) {
      return {data: [], error: error};
  }
};


// Working days rules
export const createWorkingDate = async (body) => {
  try {
    const response = await instance.post('/working-days-rules', body);
    return {status: true};
  } catch (error) {
    const validationErrors = error.response?.status == 422 ? error.response.data.errors : false;
    return {status: false, error: error, validationErrors: validationErrors};
  }
};


// Working days rules
export const updateWorkingDate = async (id, body) => {
  try {
    const response = await instance.put(`/working-days-rules/${id}`, body);
    return {status: true};
  } catch (error) {
    const validationErrors = error.response?.status == 422 ? error.response.data.errors : false;
    return {status: false, error: error, validationErrors: validationErrors};
  }
};


// Working days rules
export const deleteWorkingDate = async (id) => {
  try {
    const response = await instance.delete(`/working-days-rules/${id}`);
    return {status: true};
  } catch (error) {
    const validationErrors = error.response?.status == 422 ? error.response.data.errors : false;
    return {status: false, error: error, validationErrors: validationErrors};
  }
};
