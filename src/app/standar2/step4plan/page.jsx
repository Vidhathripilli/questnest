"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "../../../assets/Questnet_logo.png";
import { ApiClientUserAccount } from "@/src/service/ApiUserAccount";
import LoadingPage from "@/app/Loading/page";
// import bestvalue from "../../../assets/icons/social_media_icons/bestvalue.svg";
// import tick from "../../../assets/icons/social_media_icons/tick.svg";

const Step4Plan = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [plans, setPlans] = useState([]);
  const dispatch = useDispatch();
  const router = useRouter();
  const [planId, setPlanId] = useState();
  const user = useSelector((state) => state.auth.user);
  const userId = user?.id;
  const [loadingPlanId, setLoadingPlanId] = useState(null);



  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (userId) fetchPricingPlans(isAnnual, userId);
  }, [isAnnual, userId]);

  const fetchPricingPlans = async (isAnnual, userId) => {
    try {
      const response = await ApiClientUserAccount.get("/subscription/plans", {
        headers: {
          "Content-Type": "application/json",
          "X-TENANT-ID": "TNT20250001",
        },
        annual: isAnnual,
        type_of_plan: "from_tenant",
        user_id: userId,
        recurring_invoice_id: user.recurring_invoice_id,
      });
      if (response.status === 200) {
        setPlans(response.data);
        setPlanId(response.data.id);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const handleSelectPlan = async (plan) => {

    setLoadingPlanId(plan.id);
    
    try {
      setLoading(true);
      const response = await ApiClientUserAccount.post(
        "/subscription/select-plan",
        {
          plan_id: plan.id,
          customer_id: user.customer_id,
          recurring_invoice_id: user.recurring_invoice_id,
        }
      );
      if (response.status === 201) {
        const queryParams = new URLSearchParams({
          recurring_invoice: JSON.stringify(response.data.recurring_invoice),
          plan_data: JSON.stringify(response.data.plan_data),
        }).toString();
        router.push(`/checkout?${queryParams}`);
      }
    } catch (error) {
      console.error("Error selecting plan", error);
    }
  };
  const currentStep = 4;
  if (loading) {
    return <LoadingPage />;
  }
  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-12 lg:px-[120px]">
      {/* <Toaster position="top-center" /> */}

      {/* Logo and Step Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-11 mb-3 items-center px-4">
        {/* Step Indicators */}
        <div className="relative w-full flex justify-center md:justify-start">
          {/* Background line */}
          <div className="absolute top-1/2 left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0 -translate-y-1/2 w-[216px] h-0.5 bg-[#A999FA] z-0" />

          {/* Step Indicator Circles */}
          <div className="flex items-center justify-center sm:justify-start space-x-4 sm:space-x-6 md:space-x-10 relative z-10">
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
        <div className="w-full flex justify-center md:justify-center items-center">
          <Image
            src={logo}
            alt="questnest logo"
            className="h-16 w-auto max-w-full"
          />
        </div>
      </div>

      <div className="flex justify-center bg-white ">
        <h2 className="text-3xl font-bold text-[#402BA3] mb-6 ">
          Choose a Plan
        </h2>
      </div>

      <div className="flex justify-center mb-6 mt-3">
        <div className="relative w-72 h-10 bg-white border border-[#402BA3] rounded-full flex items-center justify-between p-1">
          <button
            onClick={() => setIsAnnual(false)}
            className={`mx-auto flex-1 h-8 z-10 text-center text-sm font-medium rounded-full transition-colors duration-300 ${
              !isAnnual
                ? "text-white bg-[#402BA3]"
                : "text-[#402BA3] px-4 transition-all"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`flex-1 z-10 h-8 text-center text-sm font-medium rounded-full transition-colors duration-50 ${
              isAnnual
                ? "text-white bg-[#402BA3]"
                : "text-[#402BA3] px-4 transition-all"
            }`}
          >
            Annually
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-4 gap-10 w-[1133px] h-[244px]">
        {isAnnual ? (
          <p className="text-xl col-span-4 text-center font-extrabold text-transparent  bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-700 animate-pulse mt-16">
            Annual plans are being crafted with care. Hang tight – amazing value
            is on the way!
          </p>
        ) : Array.isArray(plans) && plans.length > 0 ? (
          plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`group relative border p-8 rounded-2xl shadow-lg text-center bg-white transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:bg-[#402BA3] hover:text-white cursor-pointer ${
                index === 1 ? "border-purple-600 shadow-xl" : "border-gray-200"
              }`}
            >
              {index === 1 && (
                <div
                  className="absolute top-0 left-[145.01px] bg-[#402BA3] text-white text-[10px] font-semibold text-center leading-tight shadow-md transition group-hover:bg-white group-hover:text-[#402BA3]"
                  style={{
                    width: "57.14px",
                    height: "27.14px",
                    padding: "3.97px",
                    borderBottomLeftRadius: "5.29px",
                    borderBottomRightRadius: "5.29px",
                  }}
                >
                  Best
                  <br />
                  Value
                </div>
              )}
              <h3 className="text-lg font-semibold mb-2 ">
                {plan.plan_name ? plan.plan_name.toUpperCase() : ""}
              </h3>
              <p className="mb-2 text-[10px] leading-[15.76px] font-semibold font-inter w-[169px] h-[48px] text-black/50 group-hover:text-white/50  transition-colors duration-300 align-middle tracking-wide">
                {plan.plan_name
                  ? plan.plan_name
                      .toUpperCase()
                      .replace("LEARNING MANAGEMENT SYSTEM", "")
                      .trim()
                  : ""}{" "}
                <br />
                CUSTOMER RELATIONSHIP <br /> MANAGEMENT PROJECT MANAGEMENT
              </p>

              <p className="text-4xl font-bold mb-3">${plan.amount}</p>
              <p className="text-sm mb-1 text-black/50 group-hover:text-white/50 transition-colors duration-300">
                {isAnnual ? "Per User / Per Year" : "Per User / Per Month"}
              </p>
              <ul className="mt-4 mb-6 text-sm">
                <li className="mb-2 flex">
                  {/* <Image src={tick} /> */}
                  Number of Courses: {plan.num_modules}
                </li>
                <li className="mb-2">
                  • Number of Lessons: {plan.num_submodules}
                </li>
                <li className="mb-2">• Number of Students: {plan.num_users}</li>
                <li className="mb-2">
                  • Storage:{" "}
                  {plan.features?.includes("Storage") ? "200GB" : "20GB"}
                </li>
              </ul>
              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={loadingPlanId === plan.id}
                className={`${
                  loadingPlanId === plan.id
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#402BA3]"
                } text-white px-10 py-2 rounded-md text-sm font-medium shadow-md transition group-hover:bg-white group-hover:text-[#402BA3]`}
              >
                {loadingPlanId === plan.id ? "Loading..." : "Get started"}
              </button>
              <p className="text-[#4A4A4A] mt-2 text-xs cursor-pointer transition-colors duration-300 group-hover:text-white">
                Learn more
              </p>
            </div>
          ))
        ) : (
          <p className="text-[#402BA3] text-lg col-span-4 text-center">
            No plans available.
          </p>
        )}
      </div>
    </div>
  );
};

export default Step4Plan;
