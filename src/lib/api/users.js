import instance from '@/lib/api';

export const getAllUsers = async (filters) => {
    try {
      const response = await instance.get(`/users`, {params: filters});
      return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};

export const getAllRoles = async (filters) => {
    try {
        const response = await instance.get(`/roles`, {params: filters});
        return {data: response.data, error: false};
    } catch (error) {
        return {data: [], error: error};
    }
};



export const createUser = async (data) => {
    try {
        const response = await instance.post(`/users`, data);
        return {status: true};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};

// Update User
export const updateUser = async (id, data) => {
    try {
        const response = await instance.put(`/users/${id}`, data);
        return {status: true};
    } catch (error) {
		const validationErrors =
			error.response?.status == 422 ? error.response.data.errors : false;
		return {
			status: false,
			error: error,
			errorMsg: error.response.data.message,
			validationErrors: validationErrors,
		};
	}
};

export const deleteUser = async (id) => {
    try {
        const response = await instance.delete(`/users/${id}`);
        return {status: true};
    } catch (error) {
        return {status: false, error: error};
    }
};

export const getUser = async (id) => {
    try {
        const response = await instance.get(`/users/${id}`);
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};

export const getAllPermissions = async () => {
    try {
        const response = await instance.get(`/permissions`);
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};

export const getRoleOverview = async () => {
  try {
    const response = await instance.get(`/roles/${id}?populate=*`);
    return response;
  } catch (error) {
    return(`Failed to get data from API: ${error.message}`);
  }
};

/* Get Role details */
export const getRole = async (id) => {
    try {
        const response = await instance.get(`/roles/${id}`);
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};

export const createRole = async (data) => {
    try {
        const response = await instance.post(`/roles`, data);
        return {status: true};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};
export const updateRole = async (id, data) => {
    try {
        const response = await instance.put(`/roles/${id}`, data);
        return {status: true};
    } catch (error) {
        const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
        return {status: false, error: error, validationErrors: validationErrors};
    }
};

export const deleteRole = async (roleId) => {
    try {
        const response = await instance.delete(`/roles/${roleId}`);
        return {status: true}
    } catch (error) {
        return {status: false, error: error};
    }
};


