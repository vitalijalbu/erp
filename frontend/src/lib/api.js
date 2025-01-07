import axios from "axios";
import { message } from "antd";
import UserPermissions from "@/policy/ability";
import {setCsrfCookie} from "@/api/cookie";



//=============================================================================
// Axios
//=============================================================================


// Define storage OBJ
const Storage = () => {
  if (typeof window !== "undefined") {
      return window.sessionStorage;
  }
  return undefined;
};

// Axios istance
const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Cache-Control": "max-age=604800, public"
    },
    transformRequest: [
        (data, headers) => {
            return JSON.stringify(
                data,
                (k, v) => {
                    return v === undefined ? null : v;
                }
            );
        }
    ],
    withCredentials: true, // enable sending cookies
    timeout: 60000
});

/*
//convert undefined values in null in order to sent always in the request
instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    if (config.headers['Content-Type'] === 'application/json') {
      const undefinedToNull = function (obj) {
        if (obj && typeof obj === 'object') {
          for (const property in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, property)) {
              if (typeof obj[property] === "object") {
                undefinedToNull(obj[property]);
              } else if (typeof obj[property] === "undefined") {
                obj[property] = null;
              }
            }
          }
        }
      };
      undefinedToNull(config.data);
    }
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
});
*/


// Axios istance errors and redirects
instance.interceptors.response.use(undefined, function (error) {
  // Do something with request error

  switch (error?.response?.status) {
    case 401:
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = process.env.NEXT_PUBLIC_BASE_URL + '/login';
      }
      break;
    case 403:
      message.error("You are not allowed to perform the operation. You will be redirected to the homepage");
      if (!window.location.pathname.startsWith('/login')) {
          window.location.href = process.env.NEXT_PUBLIC_BASE_URL + "/";
      }
      break;
    case 419:
      // Update csrf and retry
      const { config } = error;
      if (config && (config.retry === undefined || config.retry === true)) {
        config.retry = false;
        return setCsrfCookie().then(() => axios(config));
      }
      break;
    default:
      break;
  }

  return Promise.reject(error);
});


//=============================================================================
// User Session
//=============================================================================

  
// Get user session  
export const getSession = () => {
    const session = Storage()?.getItem("user");
    return session ? JSON.parse(session) : null;
};

// Set user session  
export const setUser = (user) => {
    const storage = Storage();
    if(storage) {
        storage.setItem("user", JSON.stringify(user));
    }
    UserPermissions.defineAbilityFor(user);
}

// Remove user session (logout) 
export const removeSession = () => {
    const storage = Storage();
    if(storage) {
        storage.removeItem("user");
    }
    UserPermissions.clearAbility();
};

// Update user session (update profile)  
export const updateSession = async (body) => {
    const response = await instance.get("/user");
    setUser(response.data);
};

export default instance;
