"use client";
  
import React, { useState, useEffect } from "react";
import { useSelector,useDispatch } from "react-redux"; // Import Redux state selector
// import { ApiClientUserAccount } from "@/service/ApiUserAccount";
import Link from "next/link";
import { useRouter } from "next/navigation";
// import { setSelectedPlan } from "@/store/authSlice"; // Import Redux action
import { ApiClientUserAccount } from "@/src/service/ApiUserAccount";
// import { ApiClientUserAccount } from "@/src/service/ApiUserAccount";
const Step4Plan = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [plans, setPlans] = useState([]);
  // const [selectedPlan, setSelectedPlan] = useState(null);
  // Get user from Redux store
  const user = useSelector((state) => state.auth.user);
  
  const userId = user?.id; // Ensure user ID is available
  const dispatch = useDispatch();
  const route = useRouter();
  useEffect(() => {
    if (userId) fetchPricingPlans(isAnnual, userId);
  }, [isAnnual, userId]);
 
  const fetchPricingPlans = async (isAnnual, userId) => {
    try {
      const response = await ApiClientUserAccount.get("/subscription/plans",
        {
          headers: {
            "X-TENANT-ID" : "TNT20250001"
            
          }
        }, {
        annual: isAnnual,
        type_of_plan: "from_tenant", // Send type_of_plan
        user_id: userId, // Send user_id
      });
      //console.log("plan response",response.data)
      if (response.status === 200) {
        setPlans(response.data);
      //console.log(response);
      
      }else {
        setPlans([]); // Default to empty array if response is invalid
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };
 
  const handleSelectPlan = async (plan) => {
    //console.log({ plan_id: plan.id, customer_id: user.customer_id });
  
    try {
      const response = await ApiClientUserAccount.post("/subscription/select-plan", {
        plan_id: plan.id,
        customer_id: user.customer_id,
      });
  
      if (response.status === 201) {
        //console.log("Posted successfully");
  
        // Convert the invoice data into a URL-friendly format
        const queryParams = new URLSearchParams({
          recurring_invoice: JSON.stringify(response.data.recurring_invoice),
          plan_data: JSON.stringify(response.data.plan_data),
        }).toString();
  
        // Navigate with query parameters
        route.push(`/checkout?${queryParams}`);
      }
    } catch (error) {
      console.error("Error selecting plan", error);
    }
  };
 
  return (
    <div className="flex flex-col items-center p-8">
      <h2 className="text-2xl font-semibold mb-6">Choose a Plan</h2>
 
      {/* Toggle Pricing */}
      <div className="flex items-center mb-6">
        <span className="text-gray-500">Monthly</span>
        <label className="relative mx-2 inline-block w-12 h-6">
          <input
            type="checkbox"
            className="sr-only"
            checked={isAnnual}
            onChange={() => setIsAnnual(!isAnnual)}
          />
          <span className="absolute cursor-pointer top-0 left-0 w-full h-full bg-gray-300 rounded-full transition duration-300
                before:absolute before:h-5 before:w-5 before:bg-white before:rounded-full before:top-0.5 before:left-1 before:transition-transform before:duration-300"
                style={{ transform: isAnnual ? "translateX(24px)" : "translateX(0)" }}>
          </span>
        </label>
        <span className="text-gray-500">Annual</span>
      </div>
 
      {/* Pricing Cards */}
      <div className="grid md:grid-cols-4 gap-6">
      {Array.isArray(plans) && plans.length > 0 ? (
  plans.map((plan, index) => (
    <div
      key={index}
      className={`relative border p-6 rounded-lg shadow-md text-center ${plan.bestValue ? "border-[#046A77] shadow-lg" : ""}`}
    >
      {plan.bestValue && (
        <span className="absolute bg-[#046A77] text-white text-xs px-3 py-1 rounded-tl-lg">
          Best Value
        </span>
      )}
      <h3 className="text-xl font-semibold mb-2">{plan.plan_name ? plan.plan_name.toUpperCase() : ""}</h3>
      <p className="text-gray-500 mb-2">{isAnnual ? "Per Year" : "Per Month"}</p>
      <p className="text-2xl font-bold mb-3">{plan.amount} </p>
      <p className="text-gray-500">{`${plan.num_modules} Modules`}</p>
      <p className="text-gray-500">{`${plan.num_users} User `}</p>
      <p className="text-gray-500">{`${plan.num_submodules} Sub Modules` }</p>
 
      
      <ul className="mt-4 mb-4 text-sm text-gray-600">
        {Array.isArray(plan.features) && plan.features.map((feature, i) => (
          <li key={i} className="mb-1">✔ {feature}</li>
        ))}
      </ul>
      <button
        className="bg-[#046A77] text-white px-4 py-2 rounded-md hover:bg-[#035964] transition hover:cursor-pointer"
        // onClick={() => {
        //   //dispatch(setSelectedPlan(plan)); // ✅ Directly dispatch the selected plan
        //   onClick={() => handleSelectPlan(plan)}
 
        //   route.push("/checkout"); // Redirect to checkout page
        //   alert(`Plan Selected: ${JSON.stringify(plan, null, 2)}`);
        // }}
        onClick={() => handleSelectPlan(plan)}
 
      >
        Select Plan
      </button>
    </div>
  ))
) : (
  <p className="text-gray-500">No plans available.</p>
)}
 
      </div>
 
      {/* Next Step Button */}
      <Link
        href="/standar2?step=5"
        className="px-4 py-2 border-2 border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition-colors duration-200 mt-6 inline-block"
      >
        Next &gt;
      </Link>
    </div>
  );
};
 
export default Step4Plan;
 