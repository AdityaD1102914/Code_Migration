import { useEffect, useMemo, useState } from "react";
import { Lock, User, AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setUserLoginInfo } from "../store/slices/auth.slice";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth.service";
import useToaster from "../hooks/useToaster";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<any>({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<any>({
    username: "",
    password: "",
  });
  const [loginError, setLoginError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { showSuccessToast, showErrorToast } = useToaster();
  const { isLoggedIn, authToken, error, isLoginInProcess } = useSelector(
    (state: any) => state.auth
  );

  useEffect(() => {
    if (isLoggedIn && authToken) {
      setFormData({ username: "", password: "" });
      setErrors({ username: "", password: "" });
      navigate("/project");
    }
  }, [isLoggedIn, authToken]);

  const validateForm = () => {
    const newErrors = {
      username: "",
      password: "",
    };

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // await new Promise(resolve => setTimeout(resolve, 1500));

      // alert('Login successful!');
      const resp = await login(formData);
      if (resp) {
        dispatch(setUserLoginInfo(resp.data));
        navigate("/project");
      }
      showSuccessToast("User Login successfully!");
    } catch (error: any) {
      console.error("Login failed:", error);
      showErrorToast(
        `${error?.response?.data?.message ?? error?.message}` ||
          "something went wrong!"
      );
      setLoginError(error?.response?.data?.message ?? error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">
              Welcome Back
            </h1>
            <p className="text-center text-blue-100">Sign in to your account</p>
          </div>

          {/* {loginError && <p className="text-center text-red-600 p-3">{loginError}</p>} */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                    errors.username
                      ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                  }`}
                  placeholder="Enter your username"
                />
              </div>
              {errors.username && (
                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.username}</span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                    errors.password
                      ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                  }`}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && (
                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <a
                href="#"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign up
              </a>
            </div>
          </form>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Secure login powered by modern encryption</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
