import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import useAxiosInterceptor from "../hooks/useAxiosInterceptor"

const AxiosInterceptorWrapper = ({ children }: any) => {
    const axios = useAxiosInterceptor();
    return <>
        {/* <Navbar apiInstance={axios} /> */}
        {children}</>
}

export default AxiosInterceptorWrapper;