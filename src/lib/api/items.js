import instance from "@/lib/api";

//=============================================================================
// Items CRUD API
//=============================================================================


// Get all items
export const getAllItems = async (filters) => {
  try {
    const response = await instance.get("/items", { params: filters });
    return { data: response.data };
  } catch (error) {
    return { data: [], error: error };
  }
};

// Get all item types
export const getAllItemTypes = async () => {
  try {
    const response = await instance.get("/items/types");
    return { data: response.data };
  } catch (error) {
    return { data: [], error: error };
  }
};



// Get all enabled Items
export const getAllItemsEnabled = async (filters) => {
  try {
    const response = await instance.get("/items/enabled", { params: filters });
    return response;
  } catch (error) {
    throw new Error(`Failed to get data from API: ${error}`);
  }
};


// Create new item
export const createItem = async (body) => {
  try {
    const response = await instance.post(`/items`, body);
    return { status: true, data: response.data };
  } catch (error) {
    const validationErrors =
      error.response.status == 422 ? error.response.data.errors : false;
    return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
  }
};


// Update item
export const updateItem = async (id, body) => {
  try {
    const response = await instance.put(`/items/${id}`, body);
    return { status: true, data: response.data };
  } catch (error) {
    const validationErrors =
      error.response.status == 422 ? error.response.data.errors : false;
    return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
  }
};

// Update item state
export const toggleItem = async (id, status) => {
  try {
    const response = await instance.put(`/items/${id}/toggle/${status}`);
    return { status: true, data: response.data };
  } catch (error) {
    const validationErrors =
      error.response.status == 422 ? error.response.data.errors : false;
    return { status: false, error: error, errorMsg: error.response.data.message, validationErrors: validationErrors };
  }
};

// Get Item by id
export const getItemById = async (id) => {
  try {
    const response = await instance.get(`/items/${id}`);
    return { data: response.data };
  } catch (error) {
    return { data: {}, error: error };
  }
};

export const getStockLimits = async (id) => {
  try {
    const response = await instance.get(`/items/${id}/stock-limits`);
    return { data: response.data };
  } catch (error) {
    return { data: {}, error: error };
  }
};

export const getStockLimitsHistory = async (id) => {
  try {
    const response = await instance.get(`/items/${id}/stock-limits-history`);
    return { data: response.data };
  } catch (error) {
    return { data: {}, error: error };
  }
};



export const addStockLimit = async (id, body) => {
  try {
    const response = await instance.put(`/items/${id}/stock-limits`, body);
    return { status: true, data: response.data };
  } catch (error) {
    const validationErrors =
      error.response.status == 422 ? error.response.data.errors : false;
    return { status: false, error: error, validationErrors: validationErrors };
  }
};

export const setAlternativeCode = async (id, body) => {
  try {
    const response = await instance.put(`/items/${id}/alternative`, body);
    return { status: true };
  } catch (error) {
    const validationErrors =
      error.response.status == 422 ? error.response.data.errors : false;
    return { status: false, error: error, validationErrors: validationErrors };
  }
};

//Create new lot for item
export const loadNewLot = async (id, body) => {
  try {
    const response = await instance.post(`/items/${id}/load-new-lot`, body);
    return { status: true };
  } catch (error) {
    const validationErrors =
      error.response.status == 422 ? error.response.data.errors : false;
    return {
      status: false,
      error: error,
      errorMsg: error.response.data.message,
      validationErrors: validationErrors,
    };
  }
};

//Get all item sub-families
export const getAllItemSubFamilies = async () => {
  try {
    const response = await instance.get("/items-subfamilies");
    return { data: response.data };
  } catch (error) {
    return { data: [], error: error };
  }
};


//Get All Item-Line
export const getAllItemLines = async (filters) => {
  try {
    const response = await instance.get("/items-lines", { params: filters });
    return { data: response.data };
  } catch (error) {
    return { data: [], error: error };
  }
};



//=============================================================================
// Other API Items
//=============================================================================


export const searchItemsAutocomplete = async (query) => {
  try {
    const byItem = instance.get("/items", {
      params: {
        columns: {
          item: {
            search: {
              value: query,
            },
          },
        },
      },
    });
    const byDesc = instance.get("/items", {
      params: {
        columns: {
          item_desc: {
            search: {
              value: query,
            },
          },
        },
      },
    });

    const results = await Promise.all([byItem, byDesc]);
    const allItems = [
      ...new Map(
        [...results.map((r) => r.data.data)].flat().map((i) => [i.item, i])
      ),
    ];

    return { data: allItems };
  } catch (error) {
    return { data: [], error: error };
  }
};

export const itemsSearch = async (query) => {
    try {
      const resp = await instance.get('items/autocomplete', {params:{search:query}})
      return {data: resp.data}
    } catch (error) {
      return { data: [], error: error };
    }
}

export const itemsSearchAutoComplete = async (query) => {
  try {
    const resp = await instance.get('sales/autocomplete', {params:{search:query}})
    return {items: resp.data?.items,standard_products:resp.data.standard_products}
  } catch (error) {
    return { data: [], error: error };
  }
}


// Get All Weights List
export const getAllWeightsUM = async () => {
  try {
    const response = await instance.get("/weights");
    return { data: response.data };
  } catch (error) {
    return { data: [], error: error };
  }
};


// Get All Weights List
export const getAllClassifications = async (filters) => {
  try {
    const response = await instance.get("/items-classifications", {params: filters});
    return { data: response.data };
  } catch (error) {
    return { data: [], error: error };
  }
};


// Get all items groups
export const getItemGroups = async () => {
  try {
    const response = await instance.get("/items/groups");
    return { data: response.data };
  } catch (error) {
    return { data: [], error: error };
  }
};


// Get all items groups by company ID
export const getItemGroupsByCompany = async (company, withShared) => {
  try {
    const response = await instance.get(`/companies/${company}/items/groups`, {params: {withShared: withShared ? 1 : 0}});
    return { data: response.data };
  } catch (error) {
    return { data: [], error: error };
  }
};
