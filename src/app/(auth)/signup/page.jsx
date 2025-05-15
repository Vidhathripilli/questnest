"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { ApiClientUserAccount } from "@/service/ApiUserAccount";
import Image from "next/image";
import icons from "../../../assets/icons/social_media_icons/login_icon.svg";

import {
  loginStart,
  loginSuccess,
  loginFailure,
  setUserInfo,
  setToken,
} from "@/store/authSlice";
import OtpModal from "@/app/otp/page";
import LoadingPage from "@/app/Loading/page";

export default function SignUpForm({ setIsSignUp }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFirstPassword, setShowFirstPassword] = useState(false);
  const [showSecondPassword, setShowSecondPassword] = useState(false);

  // State for form fields and validation errors
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    first_password: "",
    second_password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    username: "",
    first_password: "",
    second_password: "",
  });
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Regex patterns for validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9_\-\s'.]{3,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Validate the form
  const validateForm = () => {
    const newErrors = {
      email: emailRegex.test(formData.email) ? "" : "Invalid email address",
      username: usernameRegex.test(formData.username)
        ? ""
        : "Username must be at least 3 characters and can only contain letters, numbers, underscores, and hyphens",
      first_password: passwordRegex.test(formData.first_password)
        ? ""
        : "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
      second_password:
        formData.first_password === formData.second_password
          ? ""
          : "Passwords do not match",
    };

    setErrors(newErrors);

    // Return true only if there are no errors
    return !Object.values(newErrors).some((error) => error !== "");
  };

  // Handle input change and validate in real-time
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate the field as the user types
    switch (name) {
      case "email":
        setErrors({
          ...errors,
          email: emailRegex.test(value) ? "" : "Invalid email address",
        });
        break;

      case "username":
        setErrors({
          ...errors,
          username: usernameRegex.test(value)
            ? ""
            : "Username must be at least 3 characters and can only contain letters, numbers, underscores, and hyphens",
        });
        break;
      case "first_password":
        setErrors({
          ...errors,
          first_password: passwordRegex.test(value)
            ? ""
            : "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
        });
        break;
      case "second_password":
        setErrors({
          ...errors,
          second_password:
            value === formData.first_password ? "" : "Passwords do not match",
        });
        break;
      default:
        break;
    }
  };

  // Handle form submission
  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    dispatch(loginStart());
    setLoading(true);
    console.log(formData);
    try {
      const response = await ApiClientUserAccount.post(
        "auth/user-registration",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            "X-TENANT-ID": "TNT20250001",
          },
        }
      );

      const { token, user, id, user_profile_id } = response.data;
      const UserDetails = {
        ...user,
        id,
        user_profile_id,
        name: formData.username,
        email: formData.email,
      };

      if (response.status === 201) {
        dispatch(setUserInfo(UserDetails));
        dispatch(setToken(token));
        dispatch(loginSuccess({ user: UserDetails, token }));
        setShowOtpModal(true);
      } else if (response.status === 200) {
        if (response.data.message === "verify_otp") {
          dispatch(setUserInfo(UserDetails));
          dispatch(setToken(token));
          dispatch(loginSuccess({ user: UserDetails, token }));
          setShowOtpModal(true);
        }
        console.log(response);
      } else {
        throw new Error("Sign up failed. Please try again.");
      }
    } catch (error) {
      console.log(error);
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
      dispatch(loginFailure(error.message));
    } finally {
      setLoading(false);
    }
  };
  const handleCloseOtpModal = () => {
    setShowOtpModal(false);
  };
  // if (loading) {
  //   return <LoadingPage  />;
  // }
  return (
    <div className="flex w-full h-screen ">
      <div className="max-w-md mx-auto  h-[90vh] w-[430px] md:h-[90vh] flex flex-col justify-center px-12">
        <div className="text-center mb-8 md:mb-4">
          <div className="flex justify-center md:mb-3 mb-6">
            <div className="h-12 w-12 rounded-fullflex items-center justify-center ">
              <Image src={icons} alt="Login icon" />
            </div>
          </div>
          <h3 className="text-2xl font-bold md:text-xl text-white">
            Create an Account
          </h3>
          <p className="text-white text-opacity-80  text-sm">
            Please enter all details to Create an account
          </p>
        </div>

        {error && (
          <div className=" text-red-600 mx-auto rounded  text-sm">{error}</div>
        )}

        <form
          onSubmit={handleSignUp}
          autoComplete="off"
          className="space-y-4 md:space-y-0"
        >
          <div>
            <label className="block text-white text-sm mb-1 md:mb-0">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full md:h-[40px] px-4 py-3 rounded-lg text-white border border-white border-opacity-30 bg-white bg-opacity-10 focus:outline-none focus:ring-1 focus:ring-white"
              placeholder="Enter Your mail Id"
              required
              autoComplete="off"
            />
            {errors.email && (
              <p className="text-red-300 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-white text-sm mb-1 md:mb-0">
              Name
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-4 md:h-[40px] py-3 rounded-lg border border-white border-opacity-30 bg-white bg-opacity-10 text-white focus:outline-none focus:ring-1 focus:ring-white"
              placeholder="Enter the Name"
              required
              autoComplete="off"
            />
            {errors.username && (
              <p className="text-red-300 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-white text-sm mb-1">Password</label>
            <div className="relative">
              <input
                type={showFirstPassword ? "text" : "password"}
                name="first_password"
                value={formData.first_password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 md:h-[40px] text-white rounded-lg border border-white border-opacity-30 bg-white bg-opacity-10 focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="Enter password"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowFirstPassword(!showFirstPassword)}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                {showFirstPassword ? (
                  // Eye Off Icon
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
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.227-3.592M6.223 6.223A9.953 9.953 0 0112 5c4.477 0 8.267 2.943 9.542 7a9.956 9.956 0 01-4.186 5.012M15 12a3 3 0 01-3 3m0 0a3 3 0 01-3-3m6 0a3 3 0 00-3-3m0 0L3 3"
                    />
                  </svg>
                ) : (
                  // Eye Icon
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
            {errors.first_password && (
              <p className="text-red-300 text-xs mt-1">
                {errors.first_password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-white text-sm mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showSecondPassword ? "text" : "password"}
                name="second_password"
                value={formData.second_password}
                onChange={handleInputChange}
                className="w-full px-4 md:h-[40px] py-3 text-white rounded-lg border border-white border-opacity-30 bg-white bg-opacity-10 focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="Confirm password"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowSecondPassword(!showSecondPassword)}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                {showSecondPassword ? (
                  // Eye Off Icon
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
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.227-3.592M6.223 6.223A9.953 9.953 0 0112 5c4.477 0 8.267 2.943 9.542 7a9.956 9.956 0 01-4.186 5.012M15 12a3 3 0 01-3 3m0 0a3 3 0 01-3-3m6 0a3 3 0 00-3-3m0 0L3 3"
                    />
                  </svg>
                ) : (
                  // Eye Icon
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
            {errors.second_password && (
              <p className="text-red-300 text-xs mt-1">
                {errors.second_password}
              </p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              required
              className="h-4 w-4 md:h-[40px] text-purple-600  border-gray-300 rounded bg-white"
              autoComplete="off"
            />
            <label htmlFor="terms" className="ml-2 text-white text-sm">
              I agree to all Terms
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg transition duration-300 font-medium text-base mt-2 ${
              loading
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-white text-purple-600 hover:bg-gray-100"
            }`}
          >
            {loading ? "Creating Account..." : "Next"}
          </button>
        </form>

        <div className="text-center mt-6 md:mt-2">
          <p className="text-white text-sm">
            Already You have account?{" "}
            <button
              onClick={() => setIsSignUp(false)}
              className="text-white font-medium"
            >
              Login
            </button>
          </p>
        </div>
      </div>
      <OtpModal isOpen={showOtpModal} onClose={handleCloseOtpModal} />
    </div>
  );
}
