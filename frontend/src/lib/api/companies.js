import instance from "@/lib/api";

export const getAllCompanies = async (withShared = false) => {
    try {
        const response = await instance.get(`/companies`, {params: {all: withShared ? 1 : 0}});
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};

/* Get Company details */
export const getCompanyById = async (id) => {
  try {
    const response = await instance.get(`/companys/${id}`);
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error.message}`);
  }
};

// Get all warehouses related to company
export const getAllCompanyWarehouses = async (id) => {
  try {
    const response = await instance.get(`/companies/${id}/warehouses`);
    return { data: response.data };
  } catch (error) {
    return { data: [], error: error };
  }
};


// Get all workcenters related to company
export const getAllCompanyWorkcenters = async (id) => {
  try {
    const response = await instance.get(`/companies/${id}/workcenters`);
    return { data: response.data };
  } catch (error) {
    return { data: [], error: error };
  }
};


// Get all warehouses related to company
export const getAllCompanyEmployees = async (id) => {
  try {
    const response = await instance.get(`/companies/${id}/employees`);
    return { data: response.data };
  } catch (error) {
    return { data: [], error: error };
  }
};
