import instance from '@/lib/api';


// Get all contacts
export const getAllContacts = async (filters) => {
    try {
        const response = await instance.get('/contacts', {params: filters});
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};


// Get all contacts
export const getAllContactTypes = async () => {
    try {
        const response = await instance.get('/contacts/types');
        return {data: response.data};
    } catch (error) {
        return {data: [], error: error};
    }
};


// Get Contact
export const getContactById = async (id) => {
    try {
        const response = await instance.get(`/contacts/${id}`);
        return {data: response.data};
    } catch (error) {
        return {data: {}, error: error};
    }
};


// Create Contact
export const createContact = async (body) => {
  try {
    const response = await instance.post(`/contacts`, body);
    return { status: true, data: response.data };
  } catch (error) {
    const validationErrors =
      error.response.status == 422 ? error.response.data.errors : false;
    return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
  }
};

// Update Contact
export const updateContact = async (id, body) => {
  try {
    const response = await instance.put(`/contacts/${id}`, body);
    return { status: true, data: response.data };
  } catch (error) {
    const validationErrors =
      error.response.status == 422 ? error.response.data.errors : false;
    return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
  }
};


// Delete Contact
export const deleteContact = async (id) => {
  try {
    const response = await instance.delete(`/contacts/${id}`);
    return {data: response.data};
  } catch (error) {
    return {status: false, error: error};
  }
};


//=============================================================================
// Destinations
//=============================================================================

// Create
export const createContactDestination = async (id, body) => {
  try {
    const response = await instance.post(`/contacts/${id}/destinations`, body);
    return {status: true};
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {status: false, error: error, validationErrors: validationErrors};
  }
};


export const updateContactDestination = async ({id, selected, body}) => {
  try {
    const response = await instance.put(`/contacts/${id}/destinations/${selected}`, body);
    return {status: true};
  } catch (error) {
    const validationErrors = error.response.status == 422 ? error.response.data.errors : false;
    return {status: false, error: error, validationErrors: validationErrors};
  }
};


export const deleteContactDestination = async (id, IDdestination) => {
  try {
    const response = await instance.delete(`/contacts/${id}/destinations/${IDdestination}`);
    return {status: true};
  } catch (error) {
    return {status: false, error: error}
  }
};


//=============================================================================
// Suppliers
//=============================================================================
export const getAllSuppliers = async (filters) => {
  try {
    const response = await instance.get('/contacts?columns[supplier][search][value]=1', {params: filters});
    return response;
  } catch (error) {
    return {data: [], error: error};
  }
};
