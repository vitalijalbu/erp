import instance from '@/lib/api';


/* Set CSRF token cookie */
export const setCsrfCookie = async () => {

    //axios automatically set the csrf headers based on the response
    const response = await instance.get('/csrf-cookie');
};