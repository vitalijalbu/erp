import instance from "@/lib/api";
import { setUser, removeSession } from "@/lib/api";

/* Login API Action */
export const loginAction = async (body) => {
  return instance.post("/login", body).then((response) => {
    if (response.status === 200) {
      setUser(response.data);
    }
    return response;
  });
};

/* Logout API Action */
export const logoutAction = async () => {
  try {
    const response = await instance.post("/logout");
  } catch (error) {
  } finally {
    removeSession();
  }
  return true;
};


/* Get statically user data in Frontend */
export const getUserSession = () => {
  const user = localStorage.getItem("user");
  if (user) {
    return JSON.parse(user);
  }
  return null;
};

/* Update Profile */
export const updateProfile = (id, body) => {
  return instance.put(`/users/${id}`, body);
};
