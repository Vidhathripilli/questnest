"use client";
export const dynamic = "force-dynamic"; // Disable static generation

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { UserAccountMasterData } from "@/src/service/ApiUserAccount";
import cloud from "../../assets/icons/social_media_icons/cloud.png";
import User_Circle from "../../assets/icons/social_media_icons/User_image.jpeg";
import Vector from "../../assets/icons/social_media_icons/editVector.png";
 
// import logo from "../../../assets/Questnet_logo.png";
import logo from "../../assets/Questnet_logo.png";
import Image from "next/image";
import { setUserInfo } from "@/store/authSlice";

function Invitation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  console.log("user", user);
  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isProfileCreated, setIsProfileCreated] = useState(false);
  const [fieldsDisabled, setFieldsDisabled] = useState(false);
  

  // Fallback if user is null during initial render
  if (!user) {
    return <div>Loading user data...</div>;
  }

  const { user_profile_id, customer_id, id, address_id } = user || {};
//   console.log("User ID:", user_profile_id);
//   console.log("Customer ID:", customer_id);
//   console.log("User ID:", id);

  // Dropdown data
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [country, setCountries] = useState([]);
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
    secondary_phone: "",
    secondaryEmail: "",
    headline: user?.profile_headline || "",
    bio: user?.user_profile_bio || "",
    address_1: user?.address?.address_1 || "",
    address_2: user?.address?.address_2 || "",
    pincode: user?.address?.pincode || "",
    city: user?.address?.city_code_id?.toString() || "",
    state: user?.address?.state_code_id?.toString() || "",
    country: user?.address?.country_code_id?.toString() || "",
  });

  const [showSecondaryMobile, setShowSecondaryMobile] = useState(false);

  // Check if user.profilePhone exists and disable fields accordingly
  useEffect(() => {
    if (user?.profilePhone) {
      setFieldsDisabled(true);
      setIsProfileCreated(true);
      
      // Fetch existing organization data
      const fetchOrgData = async () => {
        try {
          const response = await UserAccountMasterData.get(
            `/api/organization/${user.profilePhone}`
          );
          
          if (response.status === 200) {
            setData(response.data);
          }
        } catch (error) {
          console.error("Error fetching organization data:", error);
        }
      };
      
      fetchOrgData();
    }
  }, [user]);

  const handleChange = (e) => {
    // If fields are disabled, don't allow changes
    if (fieldsDisabled) return;
    
    const { name, value } = e.target;
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
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
    // Skip validation if fields are disabled
    if (fieldsDisabled) return {};
    
    const newErrors = {};
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Validate required fields
    if (!form.phone) {
      newErrors.phone = "Mobile number is required";
    } else if (!phoneRegex.test(form.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    
    if (!form.country) {
      newErrors.country = "Country is required";
    }
    
    if (!form.state) {
      newErrors.state = "State is required";
    }
    
    if (!form.city) {
      newErrors.city = "City is required";
    }
    
    // Secondary fields validation (only if they have values)
    if (form.secondary_phone && !phoneRegex.test(form.secondary_phone)) {
      newErrors.secondary_phone = "Please enter a valid 10-digit phone number";
    }
    
    if (form.secondaryEmail && !emailRegex.test(form.secondaryEmail)) {
      newErrors.secondaryEmail = "Invalid email address";
    }
    
    return newErrors;
  };

  console.log("form data", form);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If profile exists, just proceed to next step
    if (fieldsDisabled) {
      router.push(`/standar2/step4plan`);
      return;
    }
    
    setFormSubmitted(true);
    
    // Validate form before submission
    const validationErrors = validateForm();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      console.log("Form has errors:", validationErrors);
      // Alert to show validation errors
      alert("Please fill in all required fields (Mobile Number, Country, State, City) and fix any validation errors.");
      return; // Stop form submission if there are errors
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
    };
    const profileData = {
      ...user,
      profilePhone: form.phone
    }

    console.log("transformedData", transformedData);

    try {
      const profileResponse = await UserAccountMasterData.patch(
        `/api/user-profile/${user_profile_id}`,
        transformedData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("User profile updated:", profileResponse.data);
      dispatch(setUserInfo(profileData))
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
      console.log("countries",country);
      
      setIsLoading((prev) => ({ ...prev, countries: false }));
    } catch (error) {
      console.error("Error fetching countries:", error);
      setIsLoading((prev) => ({ ...prev, countries: false }));
    }
  };

  // Fetch states based on selected country
  const getStates = async (countryId) => {
    console.log(countryId);
    if (!countryId) {
      setStates([]);
      return;
    }

    setIsLoading((prev) => ({ ...prev, states: true }));
    try {
      const stateRes = await UserAccountMasterData.get(
        `/api/state?country=${countryId}`
      );
      setStates(stateRes.data);
    } catch (error) {
      console.error("Error fetching states:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, states: false }));
    }
  };
  console.log(states);

  // Fetch cities based on selected state
  const getCities = async (stateId) => {
    if (!stateId) {
      setCities([]);
      return;
    }

    console.log("Fetching cities for state:", stateId);

    setIsLoading((prev) => ({ ...prev, cities: true }));

    try {
      const cityRes = await UserAccountMasterData.get(
        `/api/city?state=${stateId}`
      );
      console.log("Received cities:", cityRes.data);

      // Filter cities immediately after fetching
      const filteredCities = cityRes.data.filter(
        (c) => c.state === Number(stateId)
      );

      // Ensure we only set cities if state hasn't changed mid-call
      setCities((prevCities) => {
        if (form.state === stateId.toString()) {
          return filteredCities;
        }
        return prevCities;
      });
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, cities: false }));
    }
  };

  console.log(cities);
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
    // Only fetch cities if we have a valid state selected
    if (form.state) {
      getCities(parseInt(form.state)); // Ensure stateId is a number if your API expects it
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
    if (formSubmitted && errors[fieldName]) {
      return "border-red-500";
    }
    return "border-white/72";
  };

  return (
    <>
      <div className="flex justify-center   items-center w-full mt-[50px] mx-auto ">
        {/* Step indicators */}
         <div className="grid grid-cols-1 md:grid-cols-3  mx-auto gap-4 w-full mt-11 mb-3 items-center">
               <div className="relative mx-auto md:mx-0">
               <div className="absolute top-1/2 left-4 right-0 h-0.5 bg-[#A999FA] z-0 w-[200px] hidden sm:block xl:ml-0 2xl:ml-[470px]" />
                 <div className="flex items-center mx-auto justify-center sm:justify-start space-x-4 sm:space-x-8 relative z-10 xl:ml-0 2xl:ml-[470px]">
         
         
                   {[1, 2, 3, 4].map((step) => (
                     <div
                       key={step}
                       className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-sm font-semibold ${step === 3
                         ? "bg-[#402BA3] text-white border-[#402BA3]"
                         : "border-[#402BA3] text-[#402BA3] bg-white"
                         }`}
                     >
                       {step}
                     </div>
                   ))}
                 </div>
               </div>
         
               <div className="w-full flex justify-center items-center">
                 <Image src={logo} alt="questnet logo" className="h-16 w-auto" />
               </div>
         
               <div className="hidden md:block" />
             </div>
        {/* Spacer */}
        <div className="w-[617px]"></div>
      </div>
      <div className=" w-[1200px] h-[1250px] mt-[49px] bg-[#402BA3] shadow-lg rounded-[36.34px] px-[36px] py-[60px] mb-[59px] mx-auto ">
        <h1 className="text-white text-3xl  text-center font-medium mb-[60px]">Profile</h1>
        
        {/* Profile already created notification */}
        {fieldsDisabled && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
            <p className="font-bold">Note:</p>
            <p>Your profile has already been created. All fields are disabled. To edit your profile information, please visit the Settings page.</p>
          </div>
        )}
 
        {/* Profile Section (Cover Photo, Headline & Bio) */}
        <div className="flex  w-[1097px] h-[265px] gap-79px">
          <div className="p-4 flex flex-col md:flex-row gap-4 mb-6 h-[271px] w-[1097px] gap- [79px] ">
            <div className="relative h-[194px] w-[522px] bg-[#4631A7] rounded-[8px] gap-[10px] px-[165px] py-[57px] flex border-[1px] border-white items-center justify-center ">
              <div className="flex flex-col items-center ">
                <Image src={cloud} className="mx-auto" alt="Cloud Upload Icon" />
                <span className="text-sm text-center text-white mt-2 opacity-50">
                  Drop your Cover image here or Browse
                </span>
              </div>
 
              <div className="absolute bottom-[-100px] left-4 w-[156px] h-[156px] mt-[115px] ml-[px] border-2  py-[27px] px-[28px] gap-[10px] bg-white rounded-[78px] ">
                <div className="w-[100px] h-[100px] border-2 border-white bg-white rounded-full overflow-hidden my-auto">
                  <Image src={User_Circle} alt="user logo" className=" mx-auto w-[100px] h-[100px] object-cover " />
                </div>
 
                {/* Pencil Icon Overlay */}
                <div className="absolute bottom-1 right-0 w-[48px] h-[48px] bg-white rounded-full border-4 border-[#4631A7] flex items-center justify-center ">
                  <Image src={Vector} alt="edit icon" className="w-[20px] h-[20px]" />
                </div>
              </div>
            </div>
          </div>
 
          <div className="">
            <label className=" block font-normal text-[20px] leading-[100%] tracking-[0%] w-[496px] h-[24px] text-white ml-[30px]  mb-3">
              HeadLine
            </label>
 
            <input
              type="text"
              name="headline"
              value={form.headline}
              onChange={handleChange}
              placeholder="One line about yourself..."
              disabled={fieldsDisabled}
              className="w-[496px] h-[44px] rounded-[7px] px-[5px] py-[12px] border-[0.9px] border-white bg-transparent text-white placeholder-white placeholder-opacity-40 mb-4 ml-[30px]"
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
                className="w-[520px] h-[179px] rounded-[7px] px-[5px] py-[12px] gap-[10px] border-[0.9px] border-white  bg-transparent text-white placeholder-white placeholder-opacity-70 ml-[30px] "
              ></textarea>
            </div>
          </div>
        </div>
        <div className=" w-[1093px] h-[497px] gap-[80px] mt-[81px]">
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
                  className="w-[220px] border border-gray-300 rounded-md px-3 py-2 bg-transparent text-white placeholder-white placeholder-opacity-50"
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
                  className="w-[220px] border border-gray-300 rounded-md px-3 py-2 bg-transparent text-white placeholder-white placeholder-opacity-50"
                />
              </div>
 
              {/* Email */}
              <div className="-mt-16">
 
                <label className=" block font-normal text-[20px] leading-[100%] tracking-[0%] w-[520px] h-[24px] text-white  mt-[24px] ml-[90px]">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  disabled
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter Your Email ID"
                  className="w-[480px] border border-white rounded-md px-3 py-2 bg-transparent ml-[90px] text-white placeholder-white  mt-4"
                />
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
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter Your Mobile Number"
                    disabled={fieldsDisabled}
                    className={`w-[400px] h-[44px] rounded-[7px] border-[0.9px] px-[5px] py-[12px] bg-transparent placeholder-white opacity-72 mt-3 mb-4 ${getFieldBorderColor('phone')}`}
                  />
                </div>
                {formSubmitted && errors.phone && (
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
                      type="text"
                      name="secondary_phone"
                      value={form.secondary_phone}
                      onChange={handleChange}
                      placeholder="Enter Your Secondary Mobile Number"
                      disabled={fieldsDisabled}
                      className={`w-[400px] border rounded-md mt-3 px-3 py-2 bg-transparent opacity-50 ${getFieldBorderColor('secondary_phone')}`}
                    />
                    {formSubmitted && errors.secondary_phone && (
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
                    disabled={fieldsDisabled}
                    className={`w-[493px] border rounded-[7px] h-[44px] mt-3 gap-[10px] px-[5px] py-[12px] bg-transparent opacity-50 ml-10 ${getFieldBorderColor('secondaryEmail')}`}
                  />
                </div>
                {formSubmitted && errors.secondaryEmail && (
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
                  className="h-[165px] w-[500px] border border-gray-300 rounded-md px-3 py-2 bg-transparent mt-3"
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
                    onChange={handleChange}
                    placeholder="Enter your pincode..."
                    disabled={fieldsDisabled}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-transparent focus:ring-1 focus:ring-blue-500 mt-3"
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
                    className={`w-[226px] border text-white rounded-md px-3 py-2 bg-transparent focus:ring-1 focus:ring-blue-500 mt-3 ${getFieldBorderColor('country')}`}
                  >
                    <option value="" className="text-black">
                      Select Country
                    </option>
                    {country.map((c) => (
                      <option className="text-black" key={c.id} value={c.id}>
                        {c.country_name}
                      </option>
                    ))}
                  </select>
                  {formSubmitted && errors.country && (
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
                    className={`w-full border text-white rounded-md px-3 py-2 bg-transparent focus:ring-1 focus:ring-blue-500 mt-3 ${getFieldBorderColor('state')}`}
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
                  {formSubmitted && errors.state && (
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
                    className={`w-[240px] h-[44px] border text-white rounded-[7px] px-[5px] py-[12px] bg-transparent focus:ring-1 focus:ring-blue-500 mt-3 ${getFieldBorderColor('city')}`}
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
            >
              {fieldsDisabled ? "Next" : "Save & Next"}
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
      <Invitation />
    </Suspense>
  );
}