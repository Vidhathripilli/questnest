"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { ApiClientUserAccount } from "@/service/ApiUserAccount";
import { setUserInfo } from "@/store/authSlice";
import { jwtDecode } from "jwt-decode";
import { User, Lock, Mail } from "lucide-react";
import icons from "../../../assets/icons/social_media_icons/login_icon.svg";
import Image from "next/image";
import Cookies from "js-cookie";
import LoadingPage from "@/app/Loading/page";
 
export default function LoginPage({ setIsSignUp }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFirstPassword, setShowFirstPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
 
  // Clear tokens on component mount and handle "Remember Me" functionality
  useEffect(() => {
    // Clear all tokens immediately on page load
    clearAllTokens();
 
    // Attempt to clear server-side tokens by calling logout endpoint
    // const clearServerTokens = async () => {
    //   try {
    //     await ApiClientUserAccount.post(
    //       "auth/logout",
    //       {},
    //       {
    //         withCredentials: true,
    //         headers: {
    //           "Content-Type": "application/json",
    //           "X-TENANT-ID": "TNT20250001",
    //         },
    //       }
    //     );
    //     console.log("Server-side tokens cleared on login page load");
    //   } catch (error) {
    //     console.error("Error clearing server-side tokens:", error);
    //   }
    // };
 
    // clearServerTokens();
 
    // Load saved credentials if remember me was checked
    const savedEmail = localStorage.getItem("rememberedEmail");
    const rememberMeStatus = localStorage.getItem("rememberMe") === "true";
 
    if (savedEmail && rememberMeStatus) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
 
    // Add event listener for page unload to ensure tokens are cleared on navigation
    const handleBeforeUnload = () => {
      const currentPath = window.location.pathname;
      if (!currentPath.includes("/dashboard")) {
        clearAllTokens();
      }
    };
 
    window.addEventListener("beforeunload", handleBeforeUnload);
 
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
 
  // Function to clear all possible token storage locations
  const clearAllTokens = () => {
    console.log("Attempting to clear all tokens");
 
    try {
      // Clear all cookies that might contain tokens
      const cookieNames = [
        "access_token",
        "authToken",
        "refreshToken",
        "refresh_token",
        "jwt",
        "token",
        "auth",
        "user_session",
      ];
 
      cookieNames.forEach((name) => {
        Cookies.remove(name);
        Cookies.remove(name, { path: "/" });
        Cookies.remove(name, { secure: true });
        Cookies.remove(name, { path: "/", secure: true });
 
        const domain = window.location.hostname;
        if (domain) {
          Cookies.remove(name, { domain });
          Cookies.remove(name, { domain, path: "/" });
 
          if (domain.includes(".")) {
            const rootDomain = domain.split(".").slice(-2).join(".");
            Cookies.remove(name, { domain: rootDomain });
            Cookies.remove(name, { domain: rootDomain, path: "/" });
          }
        }
      });
 
      // Clear localStorage items that might contain tokens
      const localStorageKeys = [
        "access_token",
        "authToken",
        "refreshToken",
        "refresh_token",
        "token",
        "auth",
        "user_session",
        "user_info",
        "userData",
        "isLoggedIn",
      ];
 
      localStorageKeys.forEach((key) => {
        localStorage.removeItem(key);
      });
 
      // Clear sessionStorage items that might contain tokens
      localStorageKeys.forEach((key) => {
        sessionStorage.removeItem(key);
      });
 
      // Attempt to overwrite cookies (won't affect HttpOnly cookies)
      document.cookie =
        "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=strict";
      document.cookie =
        "authToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=strict";
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=strict";
      document.cookie =
        "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=strict";
 
      // Log remaining cookies for debugging
      const remainingCookies = document.cookie;
      console.log("Remaining cookies after clearing:", remainingCookies);
 
      // Clear Redux state
      dispatch(setUserInfo(null));
    } catch (error) {
      console.error("Error clearing tokens:", error);
    }
  };
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
 
  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };
 
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
 
    // Handle "Remember Me" functionality
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", formData.email);
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("rememberMe");
    }
 
    // Clear any existing tokens before login attempt
    clearAllTokens();
 
    try {
      const response = await ApiClientUserAccount.post(
        "auth/user_login",
        {
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "X-TENANT-ID": "TNT20250001",
          },
        }
      );
 
      if (response.status === 200) {
        const accessToken = response.data.access;
        const refreshToken = response.data.refresh;
 
        if (!accessToken || !refreshToken) {
          throw new Error("Invalid tokens received from server");
        }
 
        // Set interceptors for future API calls
        ApiClientUserAccount.interceptors.request.use(
          (config) => {
            if (accessToken) {
              config.headers.Authorization = `Bearer ${accessToken}`;
            }
            return config;
          },
          (error) => Promise.reject(error)
        );
 
        // Decode access token
        const decodedToken = jwtDecode(accessToken);
        const UserDetails = {
          userId: decodedToken.user_id,
          tenantId: decodedToken.custom_claims.tenant_id,
          tenantRole: decodedToken.custom_claims.tenant_role,
          selectedEntity: decodedToken.custom_claims.selected_entity,
          selectedEntityRole: decodedToken.custom_claims.selected_entity_role,
          payment_status: decodedToken.custom_claims.payment_status,
          shop_id: decodedToken.custom_claims.shop_id,
          paid_entities: decodedToken.custom_claims.entities.paid_entities,
          unpaid_entities: decodedToken.custom_claims.entities.unpaid_entities,
          organization: decodedToken.custom_claims.organization,
        };
 
        // Store user info in Redux
        dispatch(setUserInfo(UserDetails));
 
        // Store login indication
        sessionStorage.setItem("isLoggedIn", "true");
 
        // Navigate to dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 100);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        if (error.response.status === 401) {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(
            error.response.data?.message || "Login failed. Please try again."
          );
        }
      } else if (error.request) {
        console.error("Error request:", error.request);
        setError(
          "No response from server. Please check your internet connection."
        );
      } else {
        setError("Login process failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
 
  // if (loading) {
  //   return <LoadingPage />;
  // }
 
  return (
    <div className="flex w-full items-center">
      <div className="flex items-center md:h-[90vh] mx-auto h600:h-[90vh] w-[430px] justify-center rounded-r-3xl bg-transparent p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 md:mb-8">
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center">
                <Image src={icons} alt="Login icon" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white h600:text-[25px]">
              Login
            </h2>
            <p className="text-gray-400 mt-1 md:mt-2 h600:mb-0 text-sm md:text-base">
              Please enter all details to SignIn
            </p>
          </div>
 
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
 
          <form
            onSubmit={handleLogin}
            className="space-y-3 px-4 justify-center mx-auto md:space-y-4"
          >
            <div>
              <label className="block text-white text-sm mb-1" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 h600:h-[40px] md:py-3 rounded-lg text-white bg-transparent border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
                required
                autoComplete="username"
              />
            </div>
 
            <div className="relative">
              <label
                className="block text-white text-sm mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showFirstPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 h600:h-[40px] py-2 md:px-4 md:py-3 text-white rounded-lg bg-transparent border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                  onClick={() => setShowFirstPassword(!showFirstPassword)}
                >
                  {showFirstPassword ? (
                    <svg
                      className="h-5 w-5 text-white text-opacity-70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.227-3.592M6.223 6.223A9.953 9.953 0 0112 5c4.477 0 8.267 2.943 9.542 7a9.956 9.956 0 01-4.186 5.012M15 12a3 3 0 01-3 3m0 0a3 3 0 01-3-3m6 0a3 3 0 00-3-3m0 0a3 3 0 00-3 3m6 0a3 3 0 01-3-3m0 0L3 3"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-white text-opacity-70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                className="h-3 w-3 md:h-4 md:w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="remember" className="ml-2 text-white text-sm">
                Remember me
              </label>
            </div>
 
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-white text-[#7060BD] py-2 md:py-3 rounded-lg transition duration-300 font-medium text-sm md:text-base ${
                loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading ? "Please wait..." : "Get started"}
            </button>
          </form>
 
          <div className="text-center mt-4 md:mt-6">
            <p className="text-white text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-white font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}