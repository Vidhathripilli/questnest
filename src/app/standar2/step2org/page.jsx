"use client";
export const dynamic = "force-dynamic"; // Disable static generation

import { useState, useEffect, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { UserAccountMasterData } from "@/src/service/ApiUserAccount";
import logo from "../../../assets/Questnet_logo.png";
import Image from "next/image";
import { setUserInfo } from "@/store/authSlice";

function Step2OrgContent() {
  const user = useSelector((state) => state.auth.user);
  console.log("user", user);
  const router = useRouter();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [isGSTRegistered, setIsGSTRegistered] = useState(true);
  const [industryDropdown, setIndustryDropdown] = useState(false);
  const [industrySearch, setIndustrySearch] = useState("");
  const [showAddressFields, setShowAddressFields] = useState(false);
  const [isSchoolCreated, setIsSchoolCreated] = useState(!!user?.orgname); // Set based on initial user state
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Initialize data with fallback values if user is null
  const [data, setData] = useState({
    organization_name: user?.orgname || "",
    communication: {
      primary_phone: user?.communication?.primary_phone || "",
    },
    address: {
      address_1: user?.address?.address_1 || "",
      address_2: user?.address?.address_2 || "",
      pincode: user?.address?.pincode || "",
      city_name: user?.address?.city_name || "",
      state_name: user?.address?.state_name || "",
      state_code_id: user?.address?.state_code_id || "",
      country_code_id: user?.address?.country_code_id || "",
      country_name: user?.address?.country_name || "",
      created_by: user?.id || "",
      updated_by: user?.id || "",
    },
    gst_number: user?.gst_number || "", // Top-level field
    currency: user?.currency || "",
    currencyName: user?.currencyName || "",
    industry_segment: user?.industry_segment || "",
    industry: user?.industry || "",
  });

  const [ind, setInd] = useState([]);
  const [currency, setCurrency] = useState([]);
  const [city, setCity] = useState([]);
  const [state, setState] = useState([]);
  const [country, setCountry] = useState([]);
  const [searchTerm, setSearchTerm] = useState(user?.address?.state_name || "");
  const [citySearch, setCitySearch] = useState(user?.address?.city_name || "");
  const [cityDropdown, setCityDropdown] = useState(false);

  const filteredStates = state.filter((state) =>
    state.state_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredCity = city.filter((city) =>
    city.city_name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const filteredIndustries = ind.filter((industry) =>
    industry.segment_name.toLowerCase().includes(industrySearch.toLowerCase())
  );

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = (event) => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const fetchOrgData = async () => {
      if (user?.orgname) {
        setIsSchoolCreated(true);
        try {
          const response = await UserAccountMasterData.get(
            `/api/organization/${user.orgname}`
          );
          if (response.status === 200) {
            const orgData = response.data;
            console.log("API response data:", orgData); // Debug API response
            setData({
              organization_name: orgData.organization_name || user.orgname || "",
              communication: {
                primary_phone: orgData.communication?.primary_phone || user.communication?.primary_phone || "",
              },
              address: {
                address_1: orgData.address?.address_1 || user.address?.address_1 || "",
                address_2: orgData.address?.address_2 || user.address?.address_2 || "",
                pincode: orgData.address?.pincode || user.address?.pincode || "",
                city_name: orgData.address?.city_name || user.address?.city_name || "",
                state_name: orgData.address?.state_name || user.address?.state_name || "",
                state_code_id: orgData.address?.state_code_id || user.address?.state_code_id || "",
                country_code_id: orgData.address?.country_code_id || user.address?.country_code_id || "",
                country_name: orgData.address?.country_name || user.address?.country_name || "",
                created_by: orgData.created_by || user.id || "",
                updated_by: orgData.updated_by || user.id || "",
              },
              gst_number: orgData.gst_number || user.gst_number || "", // Ensure top-level
              currency: orgData.currency || user.currency || "",
              currencyName: orgData.currencyName || user.currencyName || "",
              industry_segment: orgData.industry_segment || user.industry_segment || "",
              industry: orgData.industry || user.industry || "",
            });
            setSearchTerm(orgData.address?.state_name || user.address?.state_name || "");
            setCitySearch(orgData.address?.city_name || user.address?.city_name || "");
            setShowAddressFields(!!orgData.address?.address_1 || !!user.address?.address_1);
          }
        } catch (error) {
          console.error("Error fetching organization data:", error);
          setData({
            organization_name: user.orgname || "",
            communication: {
              primary_phone: user.communication?.primary_phone || "",
            },
            address: {
              address_1: user.address?.address_1 || "",
              address_2: user.address?.address_2 || "",
              pincode: user.address?.pincode || "",
              city_name: user.address?.city_name || "",
              state_name: user.address?.state_name || "",
              state_code_id: user.address?.state_code_id || "",
              country_code_id: user.address?.country_code_id || "",
              country_name: user.address?.country_name || "",
              created_by: user.id || "",
              updated_by: user.id || "",
            },
            gst_number: user.gst_number || "", // Ensure top-level
            currency: user.currency || "",
            currencyName: user.currencyName || "",
            industry_segment: user.industry_segment || "",
            industry: user.industry || "",
          });
          setSearchTerm(user.address?.state_name || "");
          setCitySearch(user.address?.city_name || "");
          setShowAddressFields(!!user.address?.address_1);
        }
      } else {
        setData({
          organization_name: user.orgname || "",
          communication: {
            primary_phone: user.communication?.primary_phone || "",
          },
          address: {
            address_1: user.address?.address_1 || "",
            address_2: user.address?.address_2 || "",
            pincode: user.address?.pincode || "",
            city_name: user.address?.city_name || "",
            state_name: user.address?.state_name || "",
            state_code_id: user.address?.state_code_id || "",
            country_code_id: user.address?.country_code_id || "",
            country_name: user.address?.country_name || "",
            created_by: user.id || "",
            updated_by: user.id || "",
          },
          gst_number: user.gst_number || "", // Ensure top-level
          currency: user.currency || "",
          currencyName: user.currencyName || "",
          industry_segment: user.industry_segment || "",
          industry: user.industry || "",
        });
        setSearchTerm(user.address?.state_name || "");
        setCitySearch(user.address?.city_name || "");
        setShowAddressFields(!!user.address?.address_1);
      }
    };
    fetchOrgData();
  }, [user]);

  useEffect(() => {
    const fetchIndustryData = async () => {
      try {
        const response = await UserAccountMasterData.get("api/industry-segment");
        setInd(response.status === 200 ? response.data : []);
      } catch (error) {
        console.error("Error fetching industry data:", error);
      }
    };

    const fetchCurrencyData = async () => {
      try {
        const response = await UserAccountMasterData.get("api/currency");
        setCurrency(response.status === 200 ? response.data : []);
      } catch (error) {
        console.error("Error fetching currency data:", error);
      }
    };

    const fetchCityData = async () => {
      try {
        const response = await UserAccountMasterData.get("/api/city");
        setCity(response.data);
      } catch (error) {
        console.error("Error fetching city data:", error);
      }
    };

    const fetchStateData = async () => {
      try {
        const response = await UserAccountMasterData.get("api/state");
        setState(response.data);
      } catch (error) {
        console.error("Error fetching state data:", error);
      }
    };

    const fetchCountryData = async () => {
      try {
        const response = await UserAccountMasterData.get("/api/country");
        setCountry(response.data);
      } catch (error) {
        console.error("Error fetching country data:", error);
      }
    };

    fetchIndustryData();
    fetchCurrencyData();
    fetchCityData();
    fetchStateData();
    fetchCountryData();
  }, []);

  const handleInputChange = (e) => {
    if (isSchoolCreated) return;

    const { name, value } = e.target;

    setData((prevData) => {
      let updatedData = { ...prevData };

      if (name === "primary_phone") {
        updatedData.communication.primary_phone = value;
      } else if (name in prevData.address) {
        updatedData.address[name] = value;
      } else if (name === "industry") {
        const selectedIndustry = ind.find(
          (industry) => industry.segment_name === value
        );
        updatedData.industry = value;
        updatedData.industry_segment = selectedIndustry
          ? selectedIndustry.segment_id
          : "";
      } else if (name === "currencyName") {
        const selectedCurrency = currency.find(
          (cur) => cur.currency_name === value
        );
        updatedData.currencyName = value;
        updatedData.currency = selectedCurrency ? selectedCurrency.id : "";
      } else if (name === "country_name") {
        const selectedCountry = country.find((c) => c.country_name === value);
        updatedData.address.country_name = value;
        updatedData.address.country_code_id = selectedCountry?.id || "";
      } else if (name === "state_name") {
        const selectedState = state.find(
          (s) => s.state_name.toLowerCase() === value.toLowerCase()
        );
        if (!selectedState) return prevData;
        updatedData.address.state_name = value;
        updatedData.address.state_code_id = selectedState.id || "";
        setSearchTerm(value);
      } else if (name === "city_name") {
        if (!Array.isArray(city) || city.length === 0) return prevData;
        const selectedCity = city.find(
          (cityItem) => cityItem.city_name.toLowerCase() === value.toLowerCase()
        );
        if (!selectedCity) return prevData;
        updatedData.address.city_name = selectedCity.city_name;
        updatedData.address.city_code_id = selectedCity.id || "";
        setCitySearch(selectedCity.city_name);
      } else {
        updatedData[name] = value;
      }
      return updatedData;
    });
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (isSchoolCreated) {
      router.push("/standar2/step4plan");
      return;
    }

    const newErrors = {};

    if (!data.organization_name) {
      newErrors.organization_name = "Organization name is required";
    }

    if (!data.industry) {
      newErrors.industry = "Industry is required";
    }

    if (!data.address.country_code_id) {
      newErrors.country = "Country is required";
    }

    if (!data.address.state_name && !searchTerm) {
      newErrors.state = "State is required";
    }

    if (!data.currencyName) {
      newErrors.currency = "Currency is required";
    }

    if (isGSTRegistered && !data.gst_number) {
      newErrors.gst_number = "GST number is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalData = {
      ...data,
      organization_id: user?.organization_id || "",
      customer_id: user?.customer_id || "",
      entity_id:user?.entity_id || '',
      type_of_update: "from_registration",
      type_of_plan: "from_tenant",
      created_by: user?.id || "",
      updated_by: user?.id || "",

    };

    console.log("finalData sent to API:", finalData); // Debug finalData

    const orgData = {
      ...user,
      orgname: data.organization_name,
      communication: {
        ...user.communication,
        primary_phone: data.communication.primary_phone || "",
      },
      address: {
        ...user.address,
        address_1: data.address.address_1 || "",
        address_2: data.address.address_2 || "",
        pincode: data.address.pincode || "",
        city_name: data.address.city_name || "",
        state_name: data.address.state_name || "",
        state_code_id: data.address.state_code_id || "",
        country_code_id: data.address.country_code_id || "",
        country_name: data.address.country_name || "",
      },
      gst_number: data.gst_number || "", // Ensure top-level
      currency: data.currency || "",
      currencyName: data.currencyName || "",
      industry_segment: data.industry_segment || "",
      industry: data.industry || "",
    };

    console.log("orgData for Redux:", orgData); // Debug orgData

    try {
      const response = await UserAccountMasterData.patch(
        `/api/organization/${user?.organization_id || ""}`,
        finalData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        dispatch(setUserInfo(orgData));
        router.push("/standar2/step4plan");
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      alert("Failed to create organization. Please try again.");
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !user) {
    return <div>Loading user data...</div>;
  }

  const currentStep = 3;
  
  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-12 lg:px-[120px]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-11 mb-3 items-center px-4">
        <div className="relative mx-auto md:mx-0 w-full">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[216px] h-0.5 bg-[#A999FA] z-0" />
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
        <div className="w-full flex justify-center items-center">
          <Image src={logo} alt="questnest logo" className="h-16 w-auto" />
        </div>
      </div>

      {isSchoolCreated && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 w-full max-w-md">
          <p className="font-medium">Information</p>
          <p>
            Your organization details are displayed in read-only mode. You can
            edit these details later in Settings.
          </p>
        </div>
      )}
      <div className="bg-[#402BA3] h-[933px] w-[649px] rounded-[36.34px] px-[33px] py-[46px] text-white shadow-md mx-auto gap-[10px] pl-[50px]">
        <h1 className="text-white text-center font-medium text-[30px] leading-[100%] tracking-[0%] mb-[36px]">
          Organization Name
        </h1>
        <form onSubmit={handleCreateOrg} className="max-w-md w-full">
          <div className="mb-4 relative">
            <label className="block text-white font-normal text-[20px] leading-[100%] tracking-[0%] mb-2">
              Organization Name <span className="text-red-400 ml-1">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Organization name"
              name="organization_name"
              className={`w-[561px] h-[50px] border-2 px-[13.89px] py-[10.9px] rounded-[11.76px] ${
                errors.organization_name ? "border-red-500" : "border-gray-300"
              } ${
                isSchoolCreated
                  ? "opacity-70 cursor-not-allowed bg-gray-700"
                  : "bg-transparent"
              } p-2 rounded-md bg-transparent placeholder-gray-400`}
              value={data.organization_name}
              onChange={handleInputChange}
              disabled={isSchoolCreated}
            />
            {errors.organization_name && (
              <p className="text-red-300 text-xs absolute right-0">
                {errors.organization_name}
              </p>
            )}
          </div>
          <div className="mb-2 relative">
            <label className="block text-white font-normal text-[20px] leading-[100%] tracking-[0%] mt-[28px] mb-3">
              Industry <span className="text-red-400 ml-1">*</span>
            </label>
            <select
              name="industry"
              className={`w-[561px] h-[50px] border-2 rounded-[11.76px] ${
                errors.industry ? "border-red-500" : "border-gray-300"
              } ${
                isSchoolCreated
                  ? "opacity-70 cursor-not-allowed bg-gray-700"
                  : "bg-transparent"
              } px-[13.89px] py-[10.69px] rounded-md bg-transparent placeholder-gray-400`}
              value={data.industry || ""}
              onChange={handleInputChange}
              disabled={isSchoolCreated}
            >
              <option value="" disabled hidden>
                Industry
              </option>
              {ind.map((industry) => (
                <option
                  key={industry.segment_id}
                  value={industry.segment_name}
                  className="text-black"
                >
                  {industry.segment_name}
                </option>
              ))}
            </select>
            {errors.industry && (
              <p className="text-red-300 text-xs absolute right-0 mt-1">
                {errors.industry}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-white font-normal text-[20px] leading-[100%] tracking-[0%] mt-[28px] mb-2">
              Organization Location <span className="text-red-400 ml-1">*</span>
            </label>
            <div className="flex gap-[50px]">
              <div className="w-1/2 relative">
                <select
                  name="country_code_id"
                  className={`border-2 ${
                    errors.country
                      ? "border-red-500"
                      : "border-gray-300 w-[248px] h-[50px] rounded-[11px]"
                  } ${
                    isSchoolCreated
                      ? "opacity-70 cursor-not-allowed bg-gray-700"
                      : "bg-transparent"
                  } p-2 rounded-md bg-transparent placeholder-gray-400`}
                  value={data.address.country_code_id || ""}
                  onChange={(e) => {
                    const selectedCountry = country.find((c) => c.id === parseInt(e.target.value));
                    setData((prev) => ({
                      ...prev,
                      address: {
                        ...prev.address,
                        country_code_id: e.target.value,
                        country_name: selectedCountry?.country_name || "",
                      },
                    }));
                  }}
                  disabled={isSchoolCreated}
                >
                  <option value="" className="text-black">
                    Country
                  </option>
                  {country.map((c) => (
                    <option key={c.id} value={c.id} className="text-black">
                      {c.country_name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-300 text-xs absolute right-0 mt-1">
                    {errors.country}
                  </p>
                )}
              </div>
              <div className="w-1/3 relative">
                <select
                  name="state_name"
                  className={`border-2 ${
                    errors.state
                      ? "border-red-500"
                      : "border-gray-300 w-[277px] h-[50px] ml-3 rounded-[11px]"
                  } ${
                    isSchoolCreated
                      ? "opacity-70 cursor-not-allowed bg-gray-700"
                      : "bg-transparent"
                  } p-2 rounded-md bg-transparent placeholder-gray-400`}
                  value={data.address.state_name || ""}
                  onChange={handleInputChange}
                  disabled={isSchoolCreated}
                >
                  <option value="" className="w-[230px] h-[24px] text-black">
                    State/Union Territory
                  </option>
                  {filteredStates.map((state) => (
                    <option
                      key={state.id}
                      className="text-black"
                      value={state.state_name}
                    >
                      {state.state_name}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-red-300 text-xs absolute right-0">
                    {errors.state}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-white font-normal text-[20px] leading-[100%] tracking-[0%] mt-[28px] mb-2">
                Regional Settings <span className="text-red-400 ml-1">*</span>
              </label>
            </div>
          </div>
          <div className="flex items-end gap-4 mb-10">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="bg-transparent relative w-full sm:w-auto">
                <select
                  name="currencyName"
                  className={`w-[250px] h-[50px] border-2 ${
                    errors.currency ? "border-red-500" : "border-gray-300"
                  } ${
                    isSchoolCreated
                      ? "opacity-70 cursor-not-allowed bg-gray-700"
                      : "bg-transparent"
                  } gap-[10px] rounded-[11px] bg-transparent placeholder-gray-400`}
                  value={data.currencyName || ""}
                  onChange={handleInputChange}
                  disabled={isSchoolCreated}
                >
                  <option value="" className="text-black">
                    Currency
                  </option>
                  {currency.map((currency) => (
                    <option
                      key={currency.id}
                      className="text-black w-4"
                      value={currency.currency_name}
                    >
                      {currency.currency_name}
                    </option>
                  ))}
                </select>
                {errors.currency && (
                  <p className="text-red-300 text-xs absolute right-0">
                    {errors.currency}
                  </p>
                )}
              </div>
              {showAddressFields && (
                <div className="w-full sm:w-auto">
                  <label className="block text-white font-normal text-[20px] leading-[100%] tracking-[0%] -mt-8 mb-3">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Enter Your Pincode.."
                    className={`w-[255px] h-[44px] border-2 border-[#DCEAEC] p-2 bg-transparent text-white placeholder-white gap-[10px] rounded-[11px] ${
                      isSchoolCreated
                        ? "opacity-70 cursor-not-allowed bg-gray-700"
                        : ""
                    }`}
                    value={data.address.pincode || ""}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          pincode: e.target.value,
                        },
                      }))
                    }
                    disabled={isSchoolCreated}
                  />
                </div>
              )}
            </div>
            {!showAddressFields && !isSchoolCreated && (
              <div
                className="flex items-center self-start ml-auto cursor-pointer"
                onClick={() => setShowAddressFields(true)}
              >
                <span className="w-5 h-5 ml-4 flex items-center justify-center bg-white text-[#046A77] rounded-full text-xs font-bold">
                  +
                </span>
                <span className="text-base text-white w-[227px] h-[19px] gap-[7px] ml-3">
                  Add Organization Address
                </span>
              </div>
            )}
          </div>
          {showAddressFields && (
            <div className="mb-4">
              <label className="block text-white font-normal text-[20px] leading-[100%] tracking-[0%] -mt-8 mb-3">
                Address
              </label>
              <textarea
                type="text"
                name="address_1"
                placeholder="Address"
                className={`w-[538px] h-[104px] border-2 border-[#DCEAEC] p-2 rounded-md bg-transparent text-white placeholder-white ${
                  isSchoolCreated ? "opacity-70 cursor-not-allowed bg-gray-700" : ""
                }`}
                value={data.address.address_1 || ""}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    address: {
                      ...prev.address,
                      address_1: e.target.value,
                    },
                  }))
                }
                disabled={isSchoolCreated}
              />
            </div>
          )}
          <div className="mb-4 relative">
            <label className="block text-white font-normal text-[20px] leading-[100%] tracking-[0%] mb-2">
              GST Details <span className="text-red-400 ml-1">*</span>
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">
                Is this business registered for GST
              </span>
            </div>
            {isGSTRegistered && (
              <div className="mt-4">
                <input
                  type="text"
                  name="gst_number"
                  placeholder="GST Number"
                  className={`w-[575px] border-2 ${
                    errors.gst_number ? "border-red-500" : "border-gray-300"
                  } p-2 rounded-[11px] h-[50px] bg-transparent placeholder-gray-400 ${
                    isSchoolCreated ? "opacity-70 cursor-not-allowed bg-gray-700" : ""
                  }`}
                  value={data.gst_number || ""}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, gst_number: e.target.value }))
                  }
                  disabled={isSchoolCreated}
                />
                {errors.gst_number && (
                  <p className="text-red-300 text-xs absolute right-0">
                    {errors.gst_number}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="relative">
          <button
    type="submit"
    disabled={isLoading}
    className={`w-[150px] h-[50px] border-[1px] bg-white text-[#402BA3] px-[24px] py-[12px] rounded-[10px] ${
      isLoading ? "opacity-70 cursor-not-allowed" : ""
    }`}
  >
    {isLoading ? (
      <div className="flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#402BA3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </div>
    ) : (
      "Next"
    )}
  </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Step2Org() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Step2OrgContent />
    </Suspense>
  );
}