"use client"; // If you're using Next.js app router
 
import { UserAccountMasterData } from "@/service/ApiUserAccount";
import React, { useState,useEffect} from "react";
import { useSelector } from "react-redux";
 
const OrganizationInfo = () => {
 
  const user = useSelector((state) => state.auth.user); 
  console.log('orggggggggggggggggg',user)
  const userId = user?.userId;
  
  const organization = user?.organization;
  console.log("org ",organization);
  const [industrySegment,setIndustrySegment] = useState([]);
  const [currency,setCurrency] = useState([]);
  const [country,setCountry] = useState([]);
  const [states,setState] = useState([]);
 
 
  // console.log("user from my account from org",user);
 
  // Dummy Data
  const [organizationData, setOrganizationData] = useState({
    organization_name: "",
    industry: "",
    country: "",
    state: "",
    currency: "",
    address:"",
  });
 
  const getOrganizationData = async()=>{
    try{
      const response = await UserAccountMasterData.get(`api/organization/${organization}`,  
        {
          withCredentials: true,
        }
      );
      // setSchoolData(response.data.data)
      console.log("response org data from org page",response);
      setOrganizationData(response.data)
  
    }catch(error){
      console.log("error",error);
      
    }
  }
  
  const getIndustrySegment = async()=>{
    try{
      const response = await UserAccountMasterData.get(`api/industry-segment`,  
        {
          withCredentials: true,
        }
      );
      setIndustrySegment(response.data)
  
    }catch(error){
      console.log("error",error);
      
    }
  }
  
  const getCurrency = async()=>{
    try{
      const response = await UserAccountMasterData.get(`api/currency`,  
        {
          withCredentials: true,
        }
      );
      setCurrency(response.data)
 
  
    }catch(error){
      console.log("error",error);
      
    }
  }
  const getCountry = async()=>{
    try{
      const response = await UserAccountMasterData.get(`api/country`,  
        {
          withCredentials: true,
        }
      );
      setCountry(response.data)
 
  
    }catch(error){
      console.log("error",error);
      
    }
  }
 
  const getState = async()=>{
    try{
      const response = await UserAccountMasterData.get(`api/state`,  
        {
          withCredentials: true,
        }
      );
      console.log(response)
      setState(response.data)
 
  
    }catch(error){
      console.log("error",error);
      
    }
  }
  
  useEffect(()=>{
    getOrganizationData();
    getIndustrySegment();
    getCurrency();
    getCountry();
    getState();
  },[organization])
//  console.log("industry segment",industrySegment);
//  console.log("country",country);
//  console.log("state data",states);
 
 
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrganizationData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const filteredStates = states.filter(
    (state) => state.country === organizationData.address.country_code
  );
  // Save Changes
  const handleSaveChanges = async() => {
 
    const payload = {
      type_of_update: "from_user_profile",
      user_id: userId,
      organization_name: organizationData.organization_name,
      address: {
        address_1: organizationData.address?.address_1 || "",
        address_2: organizationData.address?.address_2 || "",
        pincode: organizationData.address?.pincode || "",
        city_code_id: organizationData.address?.city_code || null,
        state_code_id: organizationData.state?.id || null,
        country_code_id: organizationData.country?.id || organizationData.address?.country_code || null,
        updated_by: userId,
        created_by: userId,
      },
      communication: {
        primary_phone: organizationData.communication?.primary_phone || "",
        phone_verification_status: organizationData.communication?.phone_verification_status || false,
        secondary_phone: organizationData.communication?.secondary_phone || "",
        email: organizationData.communication?.email || "",
        email_verification_status: organizationData.communication?.email_verification_status || false,
        website: organizationData.communication?.website || "",
        linkedin: organizationData.communication?.linkedin || "",
        facebook: organizationData.communication?.facebook || "",
        twitter: organizationData.communication?.twitter || "",
        instagram: organizationData.communication?.instagram || "",
        updated_by: userId,
        created_by: userId,
      },
      currency: organizationData.currency?.id || null,
      industry_segment: organizationData.industry_segment_data?.segment_id || "",
      
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };
    console.log("payload",payload);
    
    try {
      const response = await UserAccountMasterData.patch(
        `api/organization/${organization}`,
        payload,
        {
          withCredentials: true,
        }
      );
      console.log("response", response);
      if(response.status ==200){
        alert("profile updated successfully");
      }
    } catch (error) {
      console.log("error", error);
    }
    
  };
 console.log(organizationData)
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-400 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-1">Oranization Information</h2>
        <p className="text-gray-500 mb-6">Manage Your Oranization profile</p>
 
        <div className="space-y-4">
          {/* Organization Name */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Organization Name</label>
            <input
              name="organization_name"
              value={organizationData.organization_name || ""}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
 
          {/* Industry */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Industry</label>
            <select
                name="industry_segment_data"
                value={organizationData.industry_segment_data?.segment_id || ""}
                onChange={(e) => {
                  const selectedSegment = industrySegment.find(
                    (seg) => seg.segment_id === parseInt(e.target.value)
                  );
                  setOrganizationData({
                    ...organizationData,
                    industry_segment_data: selectedSegment || {},
                  });
                }}
                className="w-full border p-2 rounded"
              >
                <option value="">Select Industry</option>
                {industrySegment.map((segment) => (
                  <option key={segment.segment_id} value={segment.segment_id}>
                    {segment.segment_name}
                  </option>
                ))}
              </select>
 
          </div>
 
          {/* Organization Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Country</label>
              <select
                name="country"
                value={organizationData.address.country_code || ""}
                onChange={(e) => {
                  const selectedCountry = country.find(
                    (c) => c.id === parseInt(e.target.value)
                  );
                  setOrganizationData({
                    ...organizationData,
                    country: selectedCountry || {},
                  });
                }}
                className="w-full border p-2 rounded"
              >
                <option value="">Select Country</option>
                {country.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.country_name}
                  </option>
                ))}
              </select>
 
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">State</label>
              <select
                name="state"
                value={organizationData.address.state_code || ""}
                onChange={(e) => {
                  const selectedState = states.find(
                    (s) => s.id === parseInt(e.target.value)
                  );
                  setOrganizationData({
                    ...organizationData,
                    state: selectedState || {},
                  });
                }}
                className="w-full border p-2 rounded"
              >
                <option value="">Select State</option>
                {filteredStates.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.state_name}
                  </option>
                ))}
              </select>
 
            </div>
          </div>
 
          {/* Regional Settings */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Currency</label>
            <select
              name="currency"
              value={organizationData.currency || ""}
              onChange={(e) => {
                const selectedCurrency = currency.find(
                  (cur) => cur.id === parseInt(e.target.value)
                );
                setOrganizationData({
                  ...organizationData,
                  currency: selectedCurrency || {},
                });
              }}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Currency</option>
              {currency.map((cur) => (
                <option key={cur.id} value={cur.id}>
                  {cur.currency_name}
                </option>
              ))}
            </select>
 
          </div>
 
          {/* Organization Address */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Organisation address</label>
            <textarea
              name="address"
              value={organizationData.address}
              onChange={handleChange}
              rows={4}
              className="w-full border p-2 rounded"
            ></textarea>
          </div>
 
          {/* Save Changes Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSaveChanges}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default OrganizationInfo;
 