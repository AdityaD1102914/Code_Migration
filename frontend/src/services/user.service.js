import axiosInstance from "../config/axiosInstance";
import { ENDPOINTS } from "../config/api.config";

export const getcurrentUser = async()=> {
    const resp= await axiosInstance.get(`${ENDPOINTS.user}/currentUser`);
    return resp.data || null;
}