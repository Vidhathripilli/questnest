"use client";
 
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { ApiClientLms } from "@/src/service/ApiUserAccount";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import arrow_down from "../../assets/icons/social_media_icons/Arrow_Down.png";
import { ApiClientUserAccount } from "@/service/ApiUserAccount";
import { updateSelectedEntity } from "@/store/authSlice";
import { setUser } from "@/store/authSlice"
 
const SchoolDropDown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [entityRole, setEntityRole] = useState('')
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  
  const dispatch = useDispatch();
//   const UserDetails = {
//     ...user,
//     user_profile_id,
//     name:formData.username,
//     email: formData.email,
//   };
// console.log("users details",UserDetails);
 
  const token = Cookies.get("access_token");
  const decoded = token ? jwtDecode(token) : null;
 
  const requestInProgress = useRef(false);
  const abortControllerRef = useRef(null);
 
  const fetchSchoolsByModules = useCallback(async () => {
    const allEntityIds = [
      ...(user.paid_entities || []),
      ...(user.unpaid_entities || []),
    ];
 
    if (allEntityIds.length === 0) return;
 
    try {
      const response = await ApiClientLms.post(
        "/schools/get-by-entity-ids",
        { entity_ids: allEntityIds },
        { withCredentials: true }
      );
 
      const courseData = response.data || [];
      setSchools(courseData);
 
      const defaultSchool = courseData.find(
        (school) => school.entity_id === user.selectedEntity
      );
 
      setSelectedSchool(defaultSchool || courseData[0]);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching school data:", error);
      }
    }
  }, [decoded]);
 
  useEffect(() => {
    fetchSchoolsByModules();
  }, [fetchSchoolsByModules]);
 
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
 
  const handleSelection = async(school) => {
    
  // console.log("beforte switching user",user);
    
    try {
  
      const response = await ApiClientUserAccount.post(
        `auth/switch-account`,
        {
          new_entity: school.entity_id, // this is the body data
        },
        {
          withCredentials: true,
          headers: {
            "X-TENANT-ID": "TNT20250001",
          },
        }
      );
      if (response.status === 200) {
        const accessToken = response.data.access;
        const decodedToken = jwtDecode(accessToken);
        const role = decodedToken.custom_claims.selected_entity_role;
      
        setEntityRole(role); // optional, if you need this in component state
        // console.log("new decoded token", role);
      
        const updatedUser = {
          ...user,
          selectedEntity: school.entity_id,
          selectedEntityRole: role  // ✅ this updates the correct field
        };
      
        dispatch(setUser(updatedUser));
        setSelectedSchool(school);
        setIsOpen(false);
        router.push('/dashboard')
        // console.log("after switching user", updatedUser);  // See updated role here
      }
      
//       console.log("dropdown response",entityRole);
//  console.log(entityRole)
//       const updatedUser = {
//         ...user,
//         selectedEntity: school.entity_id,
//         entityRole:role
//       };
//       dispatch(setUser(updatedUser));
//       setSelectedSchool(school);
//       setIsOpen(false);
      // console.log("after switching user",user);
 
    } catch (error) {
      console.error("Error fetching school courses:", error);
    }
    
  };
  console.log("school",selectedSchool);
  // console.log("after switching user",user);
  const getInitials = (name) => {
    if (!name) return "";
    const words = name.split(" ");
    return words.length >= 2 ? words[0][0] + words[1][0] : words[0][0] || "";
  };
 
  return (
    <div
      className="w-[242px] h-[42px] relative inline-block  border-gray-400 rounded-[20px] px-2 flex items-center justify-between bg-white"
      style={{ boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}
    >
      <button
        onClick={toggleDropdown}
        className="w-full flex items-center focus:outline-none"
      >
        <div
          style={{ backgroundColor: "#402BA3" }}
          className="w-[28px] h-[28px] text-white flex items-center justify-center rounded-full mr-2 font-bold text-sm"
        >
          {getInitials(selectedSchool?.name) || "QR"}
        </div>
        <span
          className="text-sm font-medium"
          style={{ color: "#402BA3", flex: 1, textAlign: "left" }}
        >
          {selectedSchool ? selectedSchool.name : "Quantum Rush"}
        </span>
        <Image
          src={arrow_down}
          alt="Dropdown Arrow"
          className="w-[28px] h-[28px] ml-2 "
        />
      </button>
      {/* <div
        className="w-[40px] h-[28px] flex items-center justify-center bg-purple-300 rounded-[10px] text-white text-xs font-bold"
        style={{ backgroundColor: "#6B46C1" }}
      >
        
      </div> */}
 
{isOpen && (
  <div className="absolute top-[42px] left-0 w-[242px] bg-white border border-gray-200 rounded-lg shadow-lg z-10">
    {schools.length > 0 ? (
      schools
        .filter((school) => school.id !== selectedSchool?.id) // 💡 Exclude selected
        .map((school) => (
          <a
            key={school.id}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleSelection(school);
            }}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <div
              className="w-8 h-8 text-white flex items-center justify-center rounded-md mr-2 font-bold text-sm"
              style={{ backgroundColor: "#6B46C1" }}
            >
              {getInitials(school.name)}
            </div>
            {school.name}
          </a>
        ))
    ) : (
      <p className="px-4 py-2 text-gray-500">Loading...</p>
    )}
    <hr className="border-t border-gray-300 mx-2" />
    {/* <button>...Create school logic</button> */}
  </div>
)}
 
    </div>
  );
};
 
export default SchoolDropDown;
 