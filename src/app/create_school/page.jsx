"use client";
 
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ApiClientUserAccount } from "@/src/service/ApiUserAccount";
import { setUserInfo } from "@/src/store/authSlice";
import logo from "../../assets/Questnet_logo.png";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import LoadingPage from "../Loading/page";
// import LoadingPage from "../loading/page";
 
export default function Step3School() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  // const [loading, setLoading] = useState(false);

  console.log(user)
  // Track if we've already submitted the form in this session
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
 
  // Check if school is already created (based on school_id in user data or localStorage)
  const [isSchoolCreated, setIsSchoolCreated] = useState(false);
 
  // Initialize formData with existing school name or empty string
  const [formData, setFormData] = useState({
    name: user?.school_name || "",
  });
 
  useEffect(() => {
    // Add entries to history to prevent going back
    window.history.pushState(null, "", window.location.href);
 
    // Event handler for popstate (when back button is clicked)
    const handlePopState = (event) => {
      // Push another entry to prevent going back
      window.history.pushState(null, "", window.location.href);
 
      // Optionally show a toast notification
      toast.info("Cannot navigate back from this page");
    };
 
    // Add event listener for back button
    window.addEventListener("popstate", handlePopState);
 
    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
  // Check if school already exists on component mount
  useEffect(() => {
    // Check if school_id exists in user state
    if (user?.school_name) {
      setIsSchoolCreated(true);
      return;
    }
 
    // Check if we have a flag in localStorage
    const schoolCreated = localStorage.getItem('schoolCreated');
    if (user?.school_name === 'true') {
      setIsSchoolCreated(true);
      return;
    }
 
    // If returning from another page, check API for existing school
    const checkExistingSchool = async () => {
      if (user?.id) {
        try {
          const response = await ApiClientUserAccount.get(
            `auth/entities/school/${user.id}`,
            {
              headers: {
                "Content-Type": "application/json",
                "X-TENANT-ID": "TNT20250001",
              },
            }
          );
 
          if (response.data && response.data.school_name) {
            setIsSchoolCreated(true);
            localStorage.setItem('schoolCreated', 'true');
 
            // Update Redux state with school info
            const schoolInfo = {
              ...user,
              school_id: response.data.school_id,
              school_name: response.data.name || formData.name,
            };
            dispatch(setUserInfo(schoolInfo));
          }
        } catch (error) {
          console.log("No existing school found");
        }
      }
    };
 
    checkExistingSchool();
  }, [user, dispatch]);
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (!isSchoolCreated && !user?.school_name) {
      setFormData({ ...formData, [name]: value });
    }
    // setFormData({ ...formData, [name]: value });
  };
 
  const handleCreate = async (e) => {
    e.preventDefault();
 
    // If school is already created, just navigate to the next page
    if (isSchoolCreated) {
      router.push("/standar2");
      return;
    }
    setLoading(true);
    const schoolDetails = {
      user_id: user?.id,
      name: formData.name,
      created_by: user?.id,
      updated_by: user?.id,
    };
    console.log(schoolDetails,)
    try {
      const response = await ApiClientUserAccount.post(
        "auth/entities",
        schoolDetails,
        {
          headers: {
            "Content-Type": "application/json",
            "X-TENANT-ID": "TNT20250001",
          },
        }
      );
 
      const {
        address_id,
        communication_id,
        customer_id,
        entity_id,
        organization_id,
        school_id,
        shop_id,
      } = response.data;
 
      const UserDetails = {
        ...user,
        address_id,
        communication_id,
        customer_id,
        entity_id,
        organization_id,
        school_id,
        shop_id,
        school_name: formData.name, // Save school name in user state
        email: user.email,
        first_password: user.first_password,
        second_password: user.second_password,
      };
 
      if (response.status === 201) {
        // Mark as submitted and created
        setHasSubmitted(true);
        setIsSchoolCreated(true);
 
        // Store flag in localStorage
        localStorage.setItem('schoolCreated', 'true');
 
        // Update Redux state
        dispatch(setUserInfo(UserDetails));
 
        toast.success("School saved successfully!");
        router.push("/standar2"); // Redirect to next page
      }
    } catch (error) {
      console.log(error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create school. Please try again.");
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };
  const currentStep = 1;
 
  if (loading) {
    return <LoadingPage />;
  }
 
  return (
 
 
 
    <div className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-12 lg:px-[120px]">
      <Toaster position="top-center" />
      {/* Logo and Step Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-11 mb-3 items-center px-4">
        {/* Step Indicators */}
        <div className="relative mx-auto md:mx-0 w-full">
          {/* Background line */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[216px] h-0.5 bg-[#A999FA] z-0" />
 
 
          {/* Step Indicator Circles */}
 
          <div className="flex items-center justify-center sm:justify-start space-x-6 sm:space-x-10 relative z-10 mx-4 md:mx-6">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-sm font-semibold ${step < currentStep
                  ? "bg-[#402BA3] text-white border-[#402BA3]" // Completed step
                  : step === currentStep
                    ? "bg-[#402BA3] text-white border-[#402BA3]" // Current step
                    : "border-[#402BA3] text-[#402BA3] bg-white" // Future step
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
      </div>
 
 
      {/* Main Form Box */}
      <div className="w-full max-w-[1215px] h-auto mt-10 px-4 sm:px-6 md:px-10 py-10 rounded-[36px] bg-gradient-to-r from-[#AF9FFF] to-[#402BA3] text-white shadow-lg mx-auto">
        <form onSubmit={handleCreate}>
          <div className="w-full max-w-[646px] mx-auto px-2 mt-[80px] md:mt-[100px] ">
            <label className="block font-normal text-[32px] text-center font-inter">
              School Name
            </label>
            <p className="justify-center h-[24px] w-full max-w-[357px] mx-auto text-[20px] mb-6 mt-1 text-center">
              Let's setup your educational platform
            </p>

            {isSchoolCreated || user?.school_name ? (
              <div className="bg-white/20 p-3 rounded-md mb-4 text-center">
                <p className="text-white text-sm">
                  Your school is already set up. You can continue to the next step.
                </p>
              </div>
            ) : null}
            
            <input
              type="text"
              name="name"
              value={user?.school_name || formData.name}
              onChange={handleInputChange}
              placeholder="Enter name of your school"
              className={`w-full h-[61px] text-[20px] font-normal leading-[100%] tracking-[0%] rounded-[7.16px] border-[0.9px] border-white/50 bg-transparent placeholder-white placeholder-opacity-50 mt-4 mb-5 px-[15px] py-[13px] ${
                isSchoolCreated || user?.school_name ? "opacity-70 cursor-not-allowed" : ""
              }`}
              readOnly={isSchoolCreated || !!user?.school_name}
              disabled={isSchoolCreated || !!user?.school_name}
            />
  
            {/* Buttons Row */}
            <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 w-full mt-10 px-2">
              <button
                type="submit"
                className="w-full sm:w-[150px] h-[50px] mx-auto bg-white text-[#7261BF] px-6 py-2 rounded font-semibold hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        </form>
      </div>
 
 
    </div>
  );
}
 