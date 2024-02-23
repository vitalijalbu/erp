import instance from '@/lib/api';


// Business Partners
export const getAllPaymentMethods = async () => {
  try {
    const response = await instance.get('/payment-methods');
    return {data: response.data};
  } catch (error) {
      return {data: [], error: error};
  }
};

// Business Partners
export const getAllPaymentTerms = async () => {
  try {
    const response = await instance.get('/payment-terms');
    return {data: response.data};
  } catch (error) {
      return {data: [], error: error};
  }
};
