"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import downArrow from '../../assets/icons/social_media_icons/downArrow.png';
import { ApiClientUserAccount, UserAccountMasterData } from "@/service/ApiUserAccount";
import { useSelector, useDispatch } from "react-redux";
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";
import { logout } from "@/store/authSlice";
 
export default function Profile() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [profileDetails, setProfileDetails] = useState('');
  const user = useSelector((state) => state.auth.user);
  console.log(user)
  const authState = useSelector((state) => state.auth.user) || {};
  const isEntityOwner = authState.selectedEntityRole === "entity_owner";
  const router = useRouter();
  const dispatch = useDispatch();
 
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
 
 
  useEffect(() => {
 
    const ProfileImage = async () => {
  
      try {
  
        const token = localStorage.getItem("token"); // or sessionStorage or your auth context
   
        const response = await UserAccountMasterData.get(
  
          `/api/upload-cover-image/${user.userId}`,
  
          {
  
            headers: {
  
              'Authorization': `Bearer ${token}`,
  
              'Content-Type': 'multipart/form-data',
  
            },
  
            withCredentials: true,
  
          }
  
        );
   
        console.log('Profile image response:', response);
  
      } catch (err) {
  
        console.log('Error fetching profile image:', err);
  
      }
  
    };
   
    ProfileImage();
  
  }, []);
  
   
 
  const handleLogout = async () => {
    try {
      // Call the logout API to clear the server-side HttpOnly cookie
     const response = await ApiClientUserAccount.post(
        "/auth/user_logout",{},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "X-TENANT-ID": "TNT20250001",
          },
        }
      );
 
      if(response.status === 200) {
      dispatch(logout());
      router.push('/');
 
      }
      // Clear all cookies
      // const cookieNames = [
      //   'access_token',
      //   'authToken',
      //   'refreshToken',
      //   'refresh_token',
      //   'jwt',
      //   'token',
      //   'auth',
      //   'user_session'
      // ];
 
      // cookieNames.forEach(name => {
      //   Cookies.remove(name);
      //   Cookies.remove(name, { path: '/' });
      //   Cookies.remove(name, { secure: true });
      //   Cookies.remove(name, { path: '/', secure: true });
 
      //   const domain = window.location.hostname;
      //   if (domain) {
      //     Cookies.remove(name, { domain });
      //     Cookies.remove(name, { domain, path: '/' });
 
      //     if (domain.includes('.')) {
      //       const rootDomain = domain.split('.').slice(-2).join('.');
      //       Cookies.remove(name, { domain: rootDomain });
      //       Cookies.remove(name, { domain: rootDomain, path: '/' });
      //     }
      //   }
      // });
 
      // Clear localStorage and sessionStorage
      // localStorage.clear();
      // sessionStorage.clear();
 
      // Clear Redux state
 
      // Redirect to login page
    } catch (error) {
      console.log("Logout error:", error);
      // Even if the API fails, clear client-side state and redirect
      // localStorage.clear();
      // sessionStorage.clear();
      // dispatch(logout());
      // router.push('/');
    }
  };
 
  useEffect(() => {
    const getProfile = async () => {
      try {
        if (user && user.userId) {
          const profileResponse = await ApiClientUserAccount.get(
            `auth/user-registration/${user.userId}`,
            {
              withCredentials: true,
              headers: { "Content-Type": "application/json" },
            }
          );
          if (profileResponse.status === 200) {
            setProfileDetails(profileResponse.data);
          }
          console.log("User profile updated:", profileResponse.status);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getProfile();
  }, [user]);
 
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
 
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Dropdown Trigger */}
      <div
        className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full bg-[#AF9FFF] hover:bg-[#ddd1ff] transition-all duration-150"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Profile Image inside purple ring */}
        <div className="w-8 h-8 rounded-full border-2 border-white shadow-md ring-2 ring-[#6B3EFF] overflow-hidden">
          <img
            src="https://igimage.indiaglitz.com/telugu/news/sam241118_1m-83c.jpg"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-[#3E1D8F] font-semibold text-sm">{profileDetails?.username}</span>
        <Image src={downArrow} className="w-[15px] h-[8px]" alt="Down arrow" />
      </div>
 
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white shadow-lg rounded-xl p-5 z-50">
          <div className="flex flex-col items-center relative">
            {/* Profile Image with Camera Icon */}
            <div className="relative">
              <img
                src="https://igimage.indiaglitz.com/telugu/news/sam241118_1m-83c.jpg"
                alt="Profile"
                className="w-20 h-20 rounded-full border-2 border-gray-300"
              />
              <div className="absolute bottom-0 right-0 bg-[#046A77] p-2 rounded-full">
                <FaCamera className="text-white text-xs" />
              </div>
            </div>
 
            {/* User Info */}
            <h2 className="text-lg font-bold mt-2">{profileDetails?.username}</h2>
            {isEntityOwner && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs mt-1">
                Entity Owner
              </span>
            )}
           
            <p className="text-gray-500 text-sm mt-1">Created at: {formatDate(profileDetails?.otp_created_at)}</p>
          </div>
 
          {/* Buttons */}
          <Link href="/dashboard/settings/my_account" legacyBehavior>
            <a
              className="w-full bg-[#046A77] text-white py-2 mt-4 rounded-lg block text-center"
              onClick={() => setIsOpen(false)}
            >
              My Account
            </a>
          </Link>
          <button className="w-full bg-gray-300 text-black py-2 mt-2 rounded-lg" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}