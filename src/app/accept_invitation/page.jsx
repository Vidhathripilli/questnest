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
import logo from "../../assets/Questnet_logo.png";
import Image from "next/image";
import loginimage from "../../assets/icons/dashboard_icons/loginimage.png";
import { setUserInfo } from "@/store/authSlice";
import { ApiClientUserAccount } from "@/service/ApiUserAccount";
 
function Invitation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isProfileCreated, setIsProfileCreated] = useState(false);
  const [fieldsDisabled, setFieldsDisabled] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
 
  const user_id = searchParams.get("user_id");
  const module_id = searchParams.get("module_id");
  const entity_id = searchParams.get("entity_id");
  const acceptance_of = searchParams.get("acceptance_of");
  const module_role = searchParams.get("module_role");
  const user_prof_id = searchParams.get("user_profile_id");
  const invitedRole = searchParams.get("role") || "Student"; // Default to "Student" if not provided
  const courseName = searchParams.get("course") || "Advanced Web Development"; // Default if not provided
 
  const handleAcceptInvitation = async () => {
    const transformedData = {
      user_id,
      updated_by: user_id,
      created_by: user_id,
      user_profile_id: user_prof_id === "not_present" ? null : user_prof_id,
      acceptance_of,
      entity_id,
      module_id: module_id,
      module_role: module_role === "not_present" ? null : module_role,
    };
 
    try {
      const response = await ApiClientUserAccount.post(
        `auth/invitation_acceptance`,
        transformedData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
 
      if (response.status === 200) {
        router.push(`/`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to accept invitation. Please try again.");
    }
  };
 
  // Fallback if user is null during initial render
  if (!user) {
    return <div>Loading user data...</div>;
  }
 
  const { user_profile_id, customer_id, id, address_id } = user || {};
 
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
 
    if (!form.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!form.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
 
    // Secondary fields validation (only if they have values)
    if (form.secondary_phone && !phoneRegex.test(form.secondary_phone)) {
      newErrors.secondary_phone = "Please enter a valid 10-digit phone number";
    }
 
    if (form.secondaryEmail && !emailRegex.test(form.secondaryEmail)) {
      newErrors.secondaryEmail = "Invalid email address";
    }
 
    if (!termsAccepted) {
      newErrors.terms = "You must agree to the terms";
    }
 
    return newErrors;
  };
 
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
      user_id: user_id,
      user_profile_id: user_prof_id === "not_present" ? null : user_prof_id,
      acceptance_of: acceptance_of,
      entity_id,
      module_id: module_id,
      module_role: module_role,
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
 
    try {
      const profileResponse = await ApiClientUserAccount.post(
        `auth/invitation_acceptance`,
        transformedData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (profileResponse.status === 200) {
        alert("Profile updated successfully!");
        router.push(`/`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };
 
  // Function to determine field border color based on error state
  const getFieldBorderColor = (fieldName) => {
    if (formSubmitted && errors[fieldName]) {
      return "border-red-500";
    }
    return "border-white/30";
  };
 
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="w-[1126px] h-[665px] rounded-[20px] bg-[#402BA3] overflow-hidden flex">
        {/* Left side illustration */}
        <div className="w-[563px] h-[665px] relative">
          <Image
            src={loginimage}
            alt="login illustration"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ borderRadius: '20px 0 0 20px' }}
            priority
          />
        </div>
 
        {/* Right side form */}
        <div className="w-[563px] h-[665px] bg-[#402BA3] rounded-r-[20px] overflow-hidden">
          <div className="h-full overflow-y-auto p-8 pt-12 flex flex-col items-center">
            <div className="bg-white rounded-[12px] px-[6.4px] py-1 mb-4">
              <Image src={logo} alt="questnet logo" className="w-[96px] h-[26.4px]" />
            </div>
 
            <div className="text-center mb-6">
              <h1 className="text-white text-2xl font-medium">Create an Account</h1>
              <p className="text-white/70 text-sm mt-1">
                Please enter all details to Create an account
              </p>
            </div>
 
            {/* Invitation status badge */}
            <div className="mb-6">
              <div className="border border-white text-white px-6 py-2 rounded-full text-sm">
                Invited as {invitedRole}
              </div>
            </div>
 
            {/* Info box */}
            <div className="border border-white/55 rounded-[15px] w-full mb-8 p-5 text-white/70">
              <p className="mb-4">You were invited to this platform with this email address for this course</p>
 
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="  text-white text-sm mb-2">Email</p>
                  <div className=" mb-2 h-[34px] w-[223px] bg-[#D9D9D933] border border-white/80 rounded-[6px] p-3">
                    {form.email || "Tarak97@gmail.com"}
                  </div>
                </div>
                <div>
                  <p className="text-white text-sm mb-2">Course</p>
                  <div className="h-[34px] w-[233px] bg-[#D9D9D933] rounded-[6px] border border-white/80 mb-2 p-3 truncate">
                    {courseName}
                  </div>
                </div>
              </div>
            </div>
 
            <form onSubmit={handleSubmit} className="w-full">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-white text-sm mb-1">First Name</p>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Enter First Name"
                    className={`w-full bg-[#402BA3] border border-white/80 rounded-[6px] ${getFieldBorderColor("firstName")}
                      rounded-md p-3 text-white focus:outline-none focus:border-white`}
                  />
                  {errors.firstName && (
                    <p className="text-red-300 text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>
 
                <div>
                  <p className="text-white text-sm mb-1">Last Name</p>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Enter Last Name"
                    className={`w-full  bg-[#402BA3] border border-white/80 rounded-[6px] ${getFieldBorderColor("lastName")}
                      rounded-md p-3 text-white focus:outline-none focus:border-white`}
                  />
                  {errors.lastName && (
                    <p className="text-red-300 text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>
 
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-white text-sm mb-1">Secondary Email</p>
                  <input
                    type="email"
                    name="secondaryEmail"
                    value={form.secondaryEmail}
                    onChange={handleChange}
                    placeholder="Enter Secondary Email"
                    className={`w-full bg-[#402BA3] border border-white/80 rounded-[6px] ${getFieldBorderColor("secondaryEmail")}
                      rounded-md p-3 text-white focus:outline-none focus:border-white`}
                  />
                  {errors.secondaryEmail && (
                    <p className="text-red-300 text-xs mt-1">{errors.secondaryEmail}</p>
                  )}
                </div>
 
                <div>
                  <p className="text-white text-sm mb-1">Mobile Number</p>
                  <div className="flex">
                    <div className="bg-[#402BA3] border border-white/80 rounded-[6px] p-3 text-white flex items-center">
                      <span>+91</span>
                      <span className="ml-1">▼</span>
                    </div>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter Mobile Number"
                      className={`w-full bg-[#402BA3] border border-white/80 rounded-[6px] ${getFieldBorderColor("phone")}
                        border-l-0 rounded-r-md p-3 text-white focus:outline-none focus:border-white`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-300 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
 
              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={() => setTermsAccepted(!termsAccepted)}
                  className="mr-2 h-5 w-5 accent-white"
                />
                <label htmlFor="terms" className="text-white text-sm">
                  I agree to all Terms
                </label>
                {errors.terms && (
                  <p className="text-red-300 text-xs ml-2">{errors.terms}</p>
                )}
              </div>
 
              <button
                type="submit"
                className=" -mr-5 w-[490px] h-[50px] text-[#402BA3] font-medium bg-white rounded-[8.55px] px-[156.03px] py-[11.76px] hover:bg-gray-100 transition-colors"
              >
                Create An Account
              </button>
 
            </form>
 
            {user_prof_id === "not_present" && (
              <div className="hidden">
                <button onClick={handleAcceptInvitation}>
                  Accept Invitation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default function Step2Indprofile() {
  return (
    <Suspense fallback={<div>Loading Step 2 Individual Profile...</div>}>
      <Invitation />
    </Suspense>
  );
}

