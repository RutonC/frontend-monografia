import axios from "axios";
import { baseURL } from "./constants";

const instance = axios.create({
  baseURL: baseURL.API_URL,
  withCredentials: true,
});

//Inteceptores
instance.interceptors.response.use(
  (response) => response,
  (error: any) => {
    if (import.meta.env.VITE_NODE_ENV !== "production") {
      console.error("[Axios Error]", error.response?.data || error.message);
    }
    return Promise.reject(error);
  },
);

export default instance;
