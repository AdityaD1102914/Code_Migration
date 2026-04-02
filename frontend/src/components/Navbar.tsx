import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Zap, LogOut, ChevronRight } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  clearLoggedInInfo,
  setLoggedInUserInfo,
} from "../store/slices/auth.slice";
import { getcurrentUser } from "../services/user.service";
import { logout } from "../services/auth.service";
import useToaster from "../hooks/useToaster";

interface UserDetails {
  username: string;
  roles: string[] | undefined;
  email: string;
  _id: string;
}

function Navbar() {
  const { authToken } = useSelector((state: any) => state.auth);
  const [userDetals, setUserDetals] = useState<Partial<UserDetails> | null>(
    null
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { showSuccessToast } = useToaster();

  // Logout Handler
  const handleLogout = () => {
    dispatch(clearLoggedInInfo());
    logout();
    showSuccessToast("User Logged out successfully!");
    navigate("/login");
  };

  useEffect(() => {
    if (authToken) {
      (async () => {
        // //use this Axios Instance
        const userDetals = await getcurrentUser();
        setUserDetals(userDetals?.data);
        dispatch(setLoggedInUserInfo(userDetals?.data));
      })();
    }
  }, [authToken]);

  return (
    <nav className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="group flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 transform group-hover:rotate-12">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-cyan-300 transition-all duration-300 ease-in-out">
              Migration Accelerator
            </div>
          </Link>
          {authToken ? (
            <div className={`flex items-center gap-2`}>
              <div className="text-lg">
                Hi, {userDetals?.roles?.[0] || "Guest"}
              </div>
              <div>
                <LogOut
                  onClick={() => handleLogout()}
                  size={20}
                  className="cursor-pointer text-blue-600 hover:text-blue-800 transition-colors"
                />
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className={`${location?.pathname === "/login" ? "hidden" : ""}`}
            >
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 pl-4 pr-3 rounded-full text-md shadow-lg hover:shadow-xl cursor-pointer ">
                Login
                <ChevronRight className="w-4 h-4 inline-block " />
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
