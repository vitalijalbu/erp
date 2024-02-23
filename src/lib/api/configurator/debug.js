import instance from "@/lib/api";

// Get all constraints
export const authorizeDebug = async (id) => {
  try {
    const response = await instance.post("/configurator/authorize-debug", {socket_id: id});
    return true;
  } catch (error) {
    return false;
  }
};

