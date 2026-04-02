import { useEffect, useRef } from "react";
import axiosInstance from "../config/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { clearLoggedInInfo } from "../store/slices/auth.slice";
import { logout } from "../services/auth.service";
import { useNavigate } from "react-router-dom";
const AUTHTOKENKEY = import.meta.env.VITE_AUTHTOKEN_KEY;
const useAxiosInterceptor = () => {
    const { authToken } = useSelector((state: any) => state.auth);
    const initialized = useRef(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Run synchronously to catch first request
    if (!initialized.current) {
        axiosInstance.interceptors.request.use((config) => {
            const token = localStorage.getItem(AUTHTOKENKEY); // fallback
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
        });

        axiosInstance.interceptors.response.use(
            (res) => res,
            (error) => {
                if (error.response?.status === 401) {
                    console.log("401 detected → logging out...");
                    logout();
                    dispatch(clearLoggedInInfo());
                    navigate('/login')
                }
                return Promise.reject(error);
            }
        );

        initialized.current = true;
    }

    // Optional: update request token when Redux changes
    useEffect(() => {
        if (authToken) {
            axiosInstance.defaults.headers.Authorization = `Bearer ${authToken}`;
            localStorage.setItem(AUTHTOKENKEY, authToken);
        }
    }, [authToken]);

    return axiosInstance;
};

export default useAxiosInterceptor;
