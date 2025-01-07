import instance from '@/lib/api';


// Get all workcenters
export const getAllWorkcenters = async (filters) => {
    try {
        const response = await instance.get('/workcenters', {params: filters});
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};


// Get Workcenter
export const getWorkcenterById = async (id) => {
    try {
        const response = await instance.get(`/workcenters/${id}`);
        return {data: response.data};
    } catch (error) {
        return {data: {}, error: error};
    }
};


// Create Workcenter
export const createWorkcenter = async (body) => {
  try {
    const response = await instance.post(`/workcenters`, body);
    return { status: true, data: response.data };
  } catch (error) {
    const validationErrors =
      error.response.status == 422 ? error.response.data.errors : false;
    return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
  }
};

// Update Workcenter
export const updateWorkcenter = async (id, body) => {
  try {
    const response = await instance.put(`/workcenters/${id}`, body);
    return { status: true, data: response.data };
  } catch (error) {
    const validationErrors =
      error.response.status == 422 ? error.response.data.errors : false;
    return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
  }
};


// Delete Workcenter
export const deleteWorkcenter = async (id) => {
  try {
    const response = await instance.delete(`/workcenters/${id}`);
    return {data: response.data};
  } catch (error) {
    return {status: false, error: error};
  }
};
