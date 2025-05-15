"use client";
export const dynamic = "force-dynamic"; // Disable static generation

import Link from "next/link";
import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { UserAccountMasterData } from "@/src/service/ApiUserAccount";
import cloud from "../../../assets/icons/social_media_icons/cloud.png";
import User_Circle from "../../../assets/icons/social_media_icons/User_image.jpeg";
import Vector from "../../../assets/icons/social_media_icons/editVector.png";
import logo from "../../../assets/Questnet_logo.png";
import Image from "next/image";
import { setUserInfo } from "@/store/authSlice";
import LoadingPage from "@/app/Loading/page";

function Step2IndprofileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  console.log("user", user);
  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isProfileCreated, setIsProfileCreated] = useState(!!user?.profilePhone); // Set based on initial user state
  const [fieldsDisabled, setFieldsDisabled] = useState(!!user?.profilePhone); // Set based on initial user state
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoURL, setProfilePhotoURL] = useState(null);
  const fileInputRef = useRef(null);

  // Fallback if user is null during initial render
  if (!user) {
    return <div>Loading user data...</div>;
  }

  const { user_profile_id, customer_id, id, address_id } = user || {};
  console.log("User ID:", user_profile_id);
  console.log("Customer ID:", customer_id);
  console.log("User ID:", id);

  // Dropdown data
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isLoading, setIsLoading] = useState({
    countries: true,
    states: false,
    cities: false,
  });

  const [form, setForm] = useState({
    firstName: user?.name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
    phone: user?.contact_number || "",
    secondary_phone: user?.secondary_phone || "",
    secondaryEmail: user?.secondaryEmail || "",
    headline: user?.profile_headline || "",
    bio: user?.user_profile_bio || "",
    address_1: user?.address?.address_1 || "",
    address_2: user?.address?.address_2 || "",
    pincode: user?.address?.pincode || "",
    city: user?.address?.city_code_id?.toString() || "",
    state: user?.address?.state_code_id?.toString() || "",
    country: user?.address?.country_code_id?.toString() || "",
  });

  const [showSecondaryMobile, setShowSecondaryMobile] = useState(!!user?.secondary_phone);

  useEffect(() => {
    // Add entries to history to prevent going back
    window.history.pushState(null, "", window.location.href);

    // Event handler for popstate (when back button is clicked)
    const handlePopState = (event) => {
      window.history.pushState(null, "", window.location.href);
      // toast.info("Cannot navigate back from this page");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Fetch and populate user data when profile exists or on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.profilePhone) {
        setFieldsDisabled(true);
        setIsProfileCreated(true);
        try {
          // Attempt to fetch the latest data from the API
          const response = await UserAccountMasterData.get(
            `/api/user-profile/${user_profile_id}`
          );
          const userData = response.data;
          setForm({
            firstName: userData.name || user.name || "",
            lastName: userData.last_name || user.last_name || "",
            email: userData.email || user.email || "",
            phone: userData.contact_number || user.contact_number || "",
            secondary_phone: userData.secondary_phone || user.secondary_phone || "",
            secondaryEmail: userData.secondaryEmail || user.secondaryEmail || "",
            headline: userData.profile_headline || user.profile_headline || "",
            bio: userData.user_profile_bio || user.user_profile_bio || "",
            address_1: userData.address?.address_1 || user.address?.address_1 || "",
            address_2: userData.address?.address_2 || user.address?.address_2 || "",
            pincode: userData.address?.pincode || user.address?.pincode || "",
            city: userData.address?.city_code_id?.toString() || user.address?.city_code_id?.toString() || "",
            state: userData.address?.state_code_id?.toString() || user.address?.state_code_id?.toString() || "",
            country: userData.address?.country_code_id?.toString() || user.address?.country_code_id?.toString() || "",
          });
          setShowSecondaryMobile(!!userData.secondary_phone || !!user.secondary_phone);
          
          // Set profile photo URL if it exists
          if (userData.profile_photo) {
            setProfilePhotoURL(userData.profile_photo);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fallback to Redux user data if API fails
          setForm({
            firstName: user.name || "",
            lastName: user.last_name || "",
            email: user.email || "",
            phone: user.contact_number || "",
            secondary_phone: user.secondary_phone || "",
            secondaryEmail: user.secondaryEmail || "",
            headline: user.profile_headline || "",
            bio: user.user_profile_bio || "",
            address_1: user.address?.address_1 || "",
            address_2: user.address?.address_2 || "",
            pincode: user.address?.pincode || "",
            city: user.address?.city_code_id?.toString() || "",
            state: user.address?.state_code_id?.toString() || "",
            country: user.address?.country_code_id?.toString() || "",
          });
          setShowSecondaryMobile(!!user.secondary_phone);
          
          // Set profile photo URL if it exists in Redux state
          if (user.profile_photo) {
            setProfilePhotoURL(user.profile_photo);
          }
        }
      } else {
        // Initialize with Redux user data for new profiles
        setForm({
          firstName: user.name || "",
          lastName: user.last_name || "",
          email: user.email || "",
          phone: user.contact_number || "",
          secondary_phone: user.secondary_phone || "",
          secondaryEmail: user.secondaryEmail || "",
          headline: user.profile_headline || "",
          bio: user.user_profile_bio || "",
          address_1: user.address?.address_1 || "",
          address_2: user.address?.address_2 || "",
          pincode: user.address?.pincode || "",
          city: user.address?.city_code_id?.toString() || "",
          state: user.address?.state_code_id?.toString() || "",
          country: user.address?.country_code_id?.toString() || "",
        });
        setShowSecondaryMobile(!!user.secondary_phone);
        
        // Set profile photo URL if it exists in Redux state
        if (user.profile_photo) {
          setProfilePhotoURL(user.profile_photo);
        }
      }
    };
    fetchUserData();
  }, [user, user_profile_id]);

  // Validation patterns
  const phoneRegex = /^\d{10}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validation function for individual fields
  const validateField = (name, value) => {
    switch (name) {
      case "phone":
        if (!value) return "Mobile number is required";
        if (!phoneRegex.test(value)) return "Please enter a valid 10-digit phone number";
        return "";
      case "secondary_phone":
        if (value && !phoneRegex.test(value)) return "Please enter a valid 10-digit phone number";
        return "";
      case "email":
        if (!value) return "Email is required";
        if (!emailRegex.test(value)) return "Invalid email address";
        return "";
      case "secondaryEmail":
        if (value && !emailRegex.test(value)) return "Invalid email address";
        return "";
      case "country":
        if (!value) return "Country is required";
        return "";
      case "state":
        if (!value) return "State is required";
        return "";
      case "city":
        if (!value) return "City is required";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    if (fieldsDisabled) return;

    const { name, value } = e.target;

    // Validate the field as user types
    const errorMessage = validateField(name, value);

    // Update errors state based on validation result
    if (errorMessage) {
      setErrors((prev) => ({ ...prev, [name]: errorMessage }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === "country") {
      setForm({ ...form, country: value, state: "", city: "" });
      getStates(value);
    } else if (name === "state") {
      setForm({ ...form, state: value, city: "" });
      getCities(value);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validateForm = () => {
    if (fieldsDisabled) return {};

    const newErrors = {};

    // Validate all fields
    for (const [field, value] of Object.entries(form)) {
      const errorMessage = validateField(field, value);
      if (errorMessage) {
        newErrors[field] = errorMessage;
      }
    }

    // Special handling for required fields
    if (!form.phone) newErrors.phone = "Mobile number is required";
    if (!form.country) newErrors.country = "Country is required";
    if (!form.state) newErrors.state = "State is required";
    if (!form.city) newErrors.city = "City is required";

    return newErrors;
  };

  console.log("form data", form);

  // Function to handle profile photo change
  const handleProfilePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      setProfilePhotoURL(URL.createObjectURL(file));
    }
  };

  // Function to trigger file input click
  const handleProfilePhotoClick = () => {
    if (!fieldsDisabled) {
      fileInputRef.current.click();
    }
  };

  // Function to upload profile photo
 const uploadProfilePhoto = async () => {
  if (!profilePhoto) return null;

  try {
    const formData = new FormData();
    formData.append('cover_image', profilePhoto);
    
    const response = await UserAccountMasterData.post(
      `/api/upload-cover-image/${user_profile_id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      }
    );
    
    console.log("Profile photo uploaded:", response.data);
    
    // Adjust this based on your actual API response structure
    // If the image URL is directly in response.data
    return response.data.cover_image || 
           response.data.data?.cover_image || 
           response.data.imageUrl || 
           null;
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    return null;
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (fieldsDisabled) {
    router.push(`/standar2/step4plan`);
    return;
  }

  setFormSubmitted(true);
  setLoading(true);
  
  // Validate form before submission
  const validationErrors = validateForm();
  setErrors(validationErrors);

  if (Object.keys(validationErrors).length > 0) {
    console.log("Form has errors:", validationErrors);
    alert("Please fill in all required fields (Mobile Number, Country, State, City) and fix any validation errors.");
    return;
  }

  try {
    // Upload profile photo first if available
    let profilePhotoUrl = user.profile_photo; // Default to existing photo
    
    if (profilePhoto) {
      try {
        const uploadResponse = await uploadProfilePhoto();
        console.log("Upload response:", uploadResponse);
        
        // Check if upload was successful and contains a URL
        if (uploadResponse) {
          profilePhotoUrl = uploadResponse;
        } else {
          alert("Failed to upload profile photo. Please try again.");
          return;
        }
      } catch (photoError) {
        console.error("Error during profile photo upload:", photoError);
        alert("Failed to upload profile photo. Please try again.");
        return;
      }
    }
  
      const transformedData = {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        secondaryEmail: form.secondaryEmail,
        contact_number: form.phone,
        profile_headline: form.headline,
        user_profile_bio: form.bio,
        type_of_update: "from_registration",
        user_id: user.id,
        customer_id: customer_id,
        updated_by: user.id,
        created_by: user.id,
        entity_id: user?.entity_id || '',
        address: {
          address_1: form.address_1,
          address_2: form.address_2,
          pincode: form.pincode,
          city_code_id: parseInt(form.city),
          state_code_id: parseInt(form.state),
          country_code_id: parseInt(form.country),
        },
        communication: {
          primary_phone: form.phone,
          secondary_phone: form.secondary_phone,
        },
        cover_image: profilePhotoUrl
      };
  
      // Update Redux with all form data
      const profileData = {
        ...user,
        profilePhone: form.phone,
        name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        contact_number: form.phone,
        secondary_phone: form.secondary_phone || "", 
        secondaryEmail: form.secondaryEmail || "", 
        profile_headline: form.headline || "",
        user_profile_bio: form.bio || "",
        profile_photo: profilePhotoUrl || user.profile_photo, // Only update if new photo was successfully uploaded
        address: {
          ...user.address,
          address_1: form.address_1 || "",
          address_2: form.address_2 || "",
          pincode: form.pincode || "",
          city_code_id: parseInt(form.city) || user.address?.city_code_id || "",
          state_code_id: parseInt(form.state) || user.address?.state_code_id || "",
          country_code_id: parseInt(form.country) || user.address?.country_code_id || "",
        },
        cover_image: profilePhotoUrl 
      };
  
      console.log("transformedData", transformedData);
      console.log("profileData for Redux", profileData);
  
      const profileResponse = await UserAccountMasterData.patch(
        `/api/user-profile/${user_profile_id}`,
        transformedData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("User profile updated:", profileResponse.data);
      dispatch(setUserInfo(profileData)); 
      alert("Profile updated successfully!");
      router.push(`/standar2/step4plan`);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  // Fetch country list initially
  const getCountries = async () => {
    try {
      const countryRes = await UserAccountMasterData.get("/api/country");
      setCountries(countryRes.data);
      setIsLoading((prev) => ({ ...prev, countries: false }));
    } catch (error) {
      console.error("Error fetching countries:", error);
      setIsLoading((prev) => ({ ...prev, countries: false }));
    }
  };

  // Fetch states based on selected country
  const getStates = async (countryId) => {
    if (!countryId) {
      setStates([]);
      return;
    }

    setIsLoading((prev) => ({ ...prev, states: true }));
    try {
      const stateRes = await UserAccountMasterData.get(`/api/state?country=${countryId}`);
      setStates(stateRes.data);
    } catch (error) {
      console.error("Error fetching states:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, states: false }));
    }
  };

  // Fetch cities based on selected state
  const getCities = async (stateId) => {
    if (!stateId) {
      setCities([]);
      return;
    }

    setIsLoading((prev) => ({ ...prev, cities: true }));

    try {
      const cityRes = await UserAccountMasterData.get(`/api/city?state=${stateId}`);
      const filteredCities = cityRes.data.filter((c) => c.state === Number(stateId));
      setCities(filteredCities);
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, cities: false }));
    }
  };

  useEffect(() => {
    getCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (form.country) {
      getStates(form.country);
    } else {
      setStates([]);
      setCities([]);
    }
  }, [form.country]);

  // Load cities when state changes
  useEffect(() => {
    if (form.state) {
      getCities(parseInt(form.state));
    } else {
      setCities([]);
    }
  }, [form.state]);

  // Initialize location data if user has it set
  useEffect(() => {
    if (user?.address?.country_code_id) {
      setForm((prev) => ({
        ...prev,
        country: user.address.country_code_id.toString(),
        state: user.address.state_code_id?.toString() || "",
        city: user.address.city_code_id?.toString() || "",
      }));
    }
  }, [user]);

  const step = parseInt(searchParams.get("step")) || 2;
  const userType = searchParams.get("type") || "";
  console.log(userType);

  const [selectedType, setSelectedType] = useState(userType);

  const handleNext = () => {
    if (step <= 5) {
      router.push(`/standar2/?step=${step + 1}&type=${selectedType}`);
    }
  };

  const [activeTab, setActiveTab] = useState("address");

  // Function to determine field border color based on error state
  const getFieldBorderColor = (fieldName) => {
    if (errors[fieldName]) {
      return "border-red-500";
    }
    return "border-white/72";
  };
  const currentStep = 3;

  // if (loading) {
  //   return <LoadingPage />;
  // }
  return (
    <>
      <div className="flex justify-center items-center w-full mt-[50px] mx-auto">
        {/* Step indicators */}
        <div className="flex items-center justify-center sm:justify-start space-x-6 sm:space-x-10 relative z-10 mx-4 md:mx-6">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-sm font-semibold ${
                step < currentStep
                  ? "bg-[#402BA3] text-white border-[#402BA3]"
                  : step === currentStep
                  ? "bg-[#402BA3] text-white border-[#402BA3]"
                  : "border-[#402BA3] text-[#402BA3] bg-white"
              }`}
            >
              {step < currentStep ? "✓" : step}
            </div>
          ))}
        </div>
      </div>

      {/* Logo */}
      <div className="w-full flex justify-center items-center">
        <Image src={logo} alt="questnest logo" className="h-16 w-auto" />
      </div>

      <div className="w-[1200px] h-[1250px] mt-[49px] bg-[#402BA3] shadow-lg rounded-[36.34px] px-[36px] py-[60px] mb-[59px] mx-auto">
        <h1 className="text-white text-3xl text-center font-medium mb-[60px]">Profile</h1>

        {/* Profile already created notification */}
        {fieldsDisabled && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
            <p className="font-bold">Note:</p>
            <p>
              Your profile has already been created. All fields are disabled. To edit your profile
              information, please visit the Settings page.
            </p>
          </div>
        )}

        {/* Profile Section (Cover Photo, Headline & Bio) */}
        <div className="flex w-[1097px] h-[265px] gap-79px">
          <div className="p-4 flex flex-col md:flex-row gap-4 mb-6 h-[271px] w-[1097px] ">
            <div className="relative h-[194px] w-[522px] bg-[#4631A7] rounded-[8px] gap-[10px] px-[165px] py-[57px] flex border-[1px] border-white items-center justify-center">
              <div className="flex flex-col items-center">
                <Image src={cloud} className="mx-auto" alt="Cloud Upload Icon" />
                <span className="text-sm text-center text-white mt-2 opacity-50">
                  Drop your Cover image here or Browse
                </span>
              </div>

              {/* Hidden file input for profile photo */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfilePhotoChange}
                accept="image/*"
                className="hidden"
              />

              <div
                className="absolute bottom-[-100px] left-4 w-[156px] h-[156px] mt-[115px] ml-[px] border-2 py-[27px] px-[28px] gap-[10px] bg-white rounded-[78px]"
                onClick={handleProfilePhotoClick}
              >
                <div className="w-[100px] h-[100px] border-2 border-white bg-white rounded-full overflow-hidden my-auto">
                  {profilePhotoURL ? (
                    <img
                      src={profilePhotoURL}
                      alt="Profile"
                      className="mx-auto w-[100px] h-[100px] object-cover"
                    />
                  ) : (
                    <Image
                      src={User_Circle}
                      alt="user logo"
                      className="mx-auto w-[100px] h-[100px] object-cover"
                    />
                  )}
                </div>

                {/* Pencil Icon Overlay */}
                <div className="absolute bottom-1 right-0 w-[48px] h-[48px] bg-white rounded-full border-4 border-[#4631A7] flex items-center justify-center">
                  <Image src={Vector} alt="edit icon" className="w-[20px] h-[20px]" />
                </div>
              </div>
            </div>
          </div>

          <div className="">
            <label className="block font-normal text-[20px] leading-[100%] tracking-[0%] w-[496px] h-[24px] text-white ml-[30px] mb-3">
              HeadLine
            </label>

            <input
              type="text"
              name="headline"
              value={form.headline}
              onChange={handleChange}
              placeholder="One line about yourself..."
              disabled={fieldsDisabled}
              className={`w-[496px] h-[44px] rounded-[7px] px-[5px] py-[12px] border-[0.9px] bg-transparent text-white placeholder-white placeholder-opacity-40 mb-4 ml-[30px] ${getFieldBorderColor(
                "headline"
              )}`}
            />

            <div>
              <label className="block font-normal text-[20px] leading-[100%] tracking-[0%] w-[496px] h-[24px] text-white ml-[30px] mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Introduce Yourself..."
                disabled={fieldsDisabled}
                className={`w-[520px] h-[179px] rounded-[7px] px-[5px] py-[12px] gap-[10px] border-[0.9px] bg-transparent text-white placeholder-white placeholder-opacity-70 ml-[30px] ${getFieldBorderColor(
                  "bio"
                )}`}
              ></textarea>
            </div>
          </div>
        </div>
        <div className="w-[1093px] h-[497px] gap-[80px] mt-[81px]">
          {/* Personal Details */}
          <div className="p-4 mb-6">
            <h3 className="font-normal text-[20px] leading-[100%] tracking-[0%] w-[520px] h-[24px] text-white mb-4">
              Personal Details
            </h3>

            <div className="flex space-x-5">
              {/* First Name */}
              <div className="flex flex-col">
                <input
                  type="text"
                  name="firstName"
                  disabled
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="w-[220px] border border-gray-300 rounded-md px-3 py-2 bg-transparent text-gray-400 placeholder-white placeholder-opacity-50"
                />
              </div>

              {/* Last Name */}
              <div className="flex flex-col">
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  disabled={fieldsDisabled}
                  className={`w-[220px] border border-gray-300 rounded-md px-3 py-2 bg-transparent text-white placeholder-white placeholder-opacity-50 ${getFieldBorderColor(
                    "lastName"
                  )}`}
                />
              </div>

              {/* Email */}
              <div className="-mt-16">
                <label className="block font-normal text-[20px] leading-[100%] tracking-[0%] w-[520px] h-[24px] text-white mt-[24px] ml-[90px]">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  disabled
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter Your Email ID"
                  className={`w-[480px] border border-white rounded-md px-3 py-2 bg-transparent ml-[90px] text-gray-400 placeholder-white mt-4 ${getFieldBorderColor(
                    "email"
                  )}`}
                />
                {errors.email && (
                  <p className="text-red-300 text-xs mt-1 ml-[90px]">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Number & Email */}
          <div className="p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                {/* Primary Mobile */}
                <label className="font-normal text-[20px] leading-[100%] tracking-[0%] w-[520px] h-[24px] text-white -mt-10">
                  Mobile Number <span className="text-red-300">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="phone"
                    value={form.phone}
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, ''); // Remove non-digits
                      handleChange({ target: { name: 'phone', value: onlyNums } });
                    }}
                    placeholder="Enter Your Mobile Number"
                    disabled={fieldsDisabled}
                    className={`w-[400px] h-[44px] text-white rounded-[7px] border-[0.9px] px-[5px] py-[12px] bg-transparent placeholder-white opacity-72 mt-3 mb-4 ${getFieldBorderColor(
                      "phone"
                    )}`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-300 text-xs mt-1 mb-2">{errors.phone}</p>
                )}
                {/* Secondary Mobile */}
                {!showSecondaryMobile && !fieldsDisabled && (
                  <div
                    className="flex items-center mt-4 space-x-2 cursor-pointer"
                    onClick={() => setShowSecondaryMobile(true)}
                  >
                    <div className="w-[24px] h-[24px] flex items-center justify-center rounded-full bg-white text-[#402BA3] font-bold -mt-5 text-lg">
                      +
                    </div>
                    <label className="font-normal text-[20px] leading-[100%] tracking-[0%] w-[520px] h-[24px] text-white mb-4">
                      Secondary Mobile Number
                    </label>
                  </div>
                )}

                {/* Secondary Mobile - Input Field (shown only when button is clicked) */}
                {showSecondaryMobile && (
                  <div className="relative">
                    <label className="font-normal text-[20px] leading-[100%] tracking-[0%] w-[520px] h-[24px] text-white mt-10">
                      Secondary Mobile Number
                    </label>
                    <input
                      type="number"
                      name="secondary_phone"
                      value={form.secondary_phone}
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/\D/g, ''); // Remove non-digits
                        handleChange({ target: { name: 'secondary_phone', value: onlyNums } });
                      }}
                      placeholder="Enter Your Secondary Mobile Number"
                      disabled={fieldsDisabled}
                      className={`w-[400px] border text-white rounded-md mt-3 px-3 py-2 bg-transparent opacity-50 ${getFieldBorderColor(
                        "secondary_phone"
                      )}`}
                    />
                    {errors.secondary_phone && (
                      <p className="text-red-300 text-xs mt-1">{errors.secondary_phone}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="font-normal text-[20px] leading-[100%] tracking-[0%] w-[493px] h-[24px] text-white mb-4 ml-10">
                  Secondary Email ID
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    name="secondaryEmail"
                    value={form.secondaryEmail}
                    onChange={handleChange}
                    placeholder="Enter Your Email ID"
                    className={`w-[493px] border text-white rounded-[7px] h-[44px] mt-3 gap-[10px] px-[5px] py-[12px] bg-transparent opacity-50 ml-10 ${getFieldBorderColor(
                      "secondaryEmail"
                    )}`}
                    disabled={fieldsDisabled}
                  />
                </div>
                {errors.secondaryEmail && (
                  <p className="text-red-300 text-xs mt-1 ml-10">{errors.secondaryEmail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Sections */}
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Left Column: Address 1 */}
              <div className="col-span-1">
                <label className="font-normal text-[20px] leading-[100%] tracking-[0%] w-[520px] h-[24px] text-white -mt-22">
                  Address
                </label>
                <textarea
                  name="address_1"
                  value={form.address_1}
                  onChange={handleChange}
                  placeholder="Enter your Address 1"
                  disabled={fieldsDisabled}
                  className={`h-[165px] w-[500px] border border-gray-300 rounded-md px-3 py-2 bg-transparent mt-3 ${getFieldBorderColor(
                    "address_1"
                  )}`}
                />
              </div>

              {/* Right Column: Pincode, Country, State, City */}
              <div className="ml-60 col-span-2 grid grid-cols-2 gap-x-6 gap-y-4">
                {/* Pincode Field */}
                <div>
                  <label className="font-normal text-[20px] leading-[100%] tracking-[0%] w-[240px] h-[24px] text-white">
                    Pincode
                  </label>
                  <input
                    type="number"
                    name="pincode"
                    value={form.pincode}
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, ''); // Remove non-digits
                      handleChange({ target: { name: 'pincode', value: onlyNums } });
                    }}
                    placeholder="Enter your pincode..."
                    disabled={fieldsDisabled}
                    className={`w-full border border-gray-300 rounded-md px-3 py-2 bg-transparent focus:ring-1 focus:ring-blue-500 mt-3 ${getFieldBorderColor(
                      "pincode"
                    )}`}
                  />
                </div>

                {/* Country Field */}
                <div className="relative">
                  <label className="font-normal text-[20px] leading-[100%] tracking-[0%] w-[240px] h-[24px] text-white">
                    Country <span className="text-red-300">*</span>
                  </label>
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    disabled={fieldsDisabled}
                    className={`w-[226px] border text-white rounded-md px-3 py-2 bg-transparent focus:ring-1 focus:ring-blue-500 mt-3 ${getFieldBorderColor(
                      "country"
                    )}`}
                  >
                    <option value="" className="text-black">
                      Select Country
                    </option>
                    {countries.map((c) => (
                      <option className="text-black" key={c.id} value={c.id}>
                        {c.country_name}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-red-300 text-xs mt-1">{errors.country}</p>
                  )}
                </div>

                {/* State Field */}
                <div className="relative">
                  <label className="font-normal text-[20px] leading-[100%] tracking-[0%] w-[240px] h-[24px] text-white">
                    State <span className="text-red-300">*</span>
                  </label>
                  <select
                    name="state"
                    value={form.state}
                    onChange={(e) => {
                      handleChange(e);
                      setForm((prevForm) => ({ ...prevForm, city: "" }));
                    }}
                    disabled={!form.country || fieldsDisabled}
                    className={`w-full border text-white rounded-md px-3 py-2 bg-transparent focus:ring-1 focus:ring-blue-500 mt-3 ${getFieldBorderColor(
                      "state"
                    )}`}
                  >
                    <option value="" className="text-black">
                      Select State
                    </option>
                    {states.map((s) => (
                      <option className="text-black" key={s.id} value={s.id}>
                        {s.state_name}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="text-red-300 text-xs mt-1">{errors.state}</p>
                  )}
                </div>

                {/* City Field */}
                <div className="relative">
                  <label className="font-normal text-[20px] leading-[100%] tracking-[0%] w-[240px] h-[24px] text-white">
                    City <span className="text-red-300">*</span>
                  </label>
                  <select
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    disabled={!form.state || fieldsDisabled}
                    className={`w-[240px] h-[44px] border text-white rounded-[7px] px-[5px] py-[12px] bg-transparent focus:ring-1 focus:ring-blue-500 mt-3 ${getFieldBorderColor(
                      "city"
                    )}`}
                  >
                    <option value="" className="text-black">
                      Select City
                    </option>
                    {cities
                      .filter((c) => c.state == form.state)
                      .map((c) => (
                        <option className="text-black" key={c.id} value={c.id}>
                          {c.city_name}
                        </option>
                      ))}
                  </select>
                  {formSubmitted && errors.city && (
                    <p className="text-red-300 text-xs mt-1">{errors.city}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Show all errors at the top of button section if form is submitted with errors */}
          {formSubmitted && Object.keys(errors).length > 0 && (
            <div className="text-red-300 text-sm mb-2 ml-4">
              Please fill all required fields marked with *
            </div>
          )}

          {/* Back & Next Buttons */}
          <div className="flex justify-between w-[1096px] gap-[796px] h-[50px] mt-[50px]">
            <button
              onClick={() => router.back()}
              className="w-[130px] h-[50px] text-white rounded-md border border-white transition ml-4"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="w-[130px] h-[50px] text-[#4631A7] rounded-md bg-white transition"
              disabled={loading}
              >
                {loading ? 'Loading...' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Step2Indprofile() {
  return (
    <Suspense fallback={<div>Loading Step 2 Individual Profile...</div>}>
      <Step2IndprofileContent />
    </Suspense>
  );
}