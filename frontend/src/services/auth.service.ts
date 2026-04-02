import axios from "axios";
import { ENDPOINTS } from "../config/api.config";

const AUTHTOKENKEY = import.meta.env.VITE_AUTHTOKEN_KEY;

export async function login(creds: { userName: string, password: string }) {
    console.log('inside login service')
    const res = await axios.post(ENDPOINTS.login, creds);
    console.log('res', res);
    return res.data;
}


export async function logout() {
    localStorage.removeItem(AUTHTOKENKEY);
}