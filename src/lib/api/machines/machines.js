import instance from '@/lib/api';


export const getAllMachines = async (filters) => {
  try {
    const response = await instance.get('/machines', { params: filters });
    return { data: response.data }
  } catch (error) {
    return { data: [], error: error };
  }
}

export const getMachineById = async (id) => {
  try {
    const response = await instance.get(`/machines/${id}`);
    return { data: response.data };
  } catch (error) {
    return { data: [], error: error };
  }
}

export const createMachine = async (body) => {
  try {
    const response = await instance.post(`/machines`, body);
    return { data: response.data };
  } catch (error) {
    const validationErrors = error.response?.status == 422 ? error.response.data.errors : false;
    return { status: false, error: error, errorMsg: error.response?.data.message, validationErrors: validationErrors };
  }
}

export const updateMachine = async (id, body) => {
  try {
    const response = await instance.put(`/machines/${id}`, body);

    return { data: response.data };
  } catch (error) {

    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
  }
}

export const deleteMachine = async (id) => {
  try {
    const response = await instance.delete(`/machines/${id}`);
    return { data: response.data };
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
  }
}
