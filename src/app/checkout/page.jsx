"use client";
export const dynamic = "force-dynamic"; // Disable static generation
import logo from "../../assets/Questnet_logo.png";
import Image from "next/image";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { FaRupeeSign } from "react-icons/fa";
import { ApiClientUserAccount } from "@/src/service/ApiUserAccount";
import { setUserInfo } from "@/store/authSlice";
 
function CheckoutContent() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
 
  // ✅ Safe parsing using useMemo
  const recurring_invoice = useMemo(() => {
    try {
      const val = searchParams.get("recurring_invoice");
      return val ? JSON.parse(val) : {};
    } catch (err) {
      console.error("Invalid recurring_invoice param:", err);
      return {};
    }
  }, [searchParams]);
 
  const plan_data = useMemo(() => {
    try {
      const val = searchParams.get("plan_data");
      return val ? JSON.parse(val) : {};
    } catch (err) {
      console.error("Invalid plan_data param:", err);
      return {};
    }
  }, [searchParams]);
 
  // ✅ Attach recurring_invoice_id to user and update Redux
  useEffect(() => {
    if (
      user &&
      recurring_invoice?.recurring_invoice_id &&
      user.recurring_invoice_id !== recurring_invoice.recurring_invoice_id
    ) {
      dispatch(
        setUserInfo({
          ...user,
          recurring_invoice_id: recurring_invoice.recurring_invoice_id,
        })
      );
    }
  }, [dispatch, user, recurring_invoice?.recurring_invoice_id]);
 
  const quantity = 1;
  const startDate = recurring_invoice?.creation_date || "N/A";
 
  const calculateEndDate = (start, freq) => {
    const end = new Date(start);
    switch (freq) {
      case "daily":
        end.setDate(end.getDate() + 1);
        break;
      case "weekly":
        end.setDate(end.getDate() + 7);
        break;
      case "monthly":
        end.setMonth(end.getMonth() + 1);
        break;
      case "yearly":
        end.setFullYear(end.getFullYear() + 1);
        break;
    }
    return end.toISOString().split("T")[0];
  };
 
  const endDate =
    startDate !== "N/A"
      ? calculateEndDate(startDate, recurring_invoice.frequency)
      : "N/A";
 
  const totalAmount = parseFloat(plan_data?.amount || 0);
  const totalTax = parseFloat(plan_data?.tax_amount || 0);
  const grandTotal = totalAmount + totalTax;
 
  const handlePayment = async () => {
    try {
      const response = await ApiClientUserAccount.post(
        "/subscription/create-subscription",
        {
          customer_id: recurring_invoice.customer,
          total_amount: grandTotal,
          pg_plan_id: plan_data.pg_plan_id,
          recurring_invoice_id: recurring_invoice.recurring_invoice_id,
          variant_id: plan_data.varient_id,
          quantity,
          entity_id: user.entity_id,
          user_id: user.id,
        },
        {
          withCredentials: true,
        }
      );
 
      if (response.status === 201) {
        window.location.href = response.data.checkout_url;
        localStorage.clear();
        sessionStorage.clear();
        dispatch({ type: "RESET_STATE" });
      } else {
        alert(
          response.data.error ||
            "Failed to create subscription and payment link"
        );
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("An error occurred during payment. Please try again.");
    }
  };
 
  return (
    <div className="max-w-[1268px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 flex flex-col items-center min-h-screen">
      <Image
        src={logo}
        alt="questnet logo"
        className="absolute top-4 left-4 h-12 sm:h-14 lg:h-16 w-auto z-50"
      />
      <div className="w-full text-center mb-4 sm:mb-6">
        <p className="font-inter font-medium text-xl sm:text-2xl lg:text-3xl text-black">
          Boom! You're this close to done
        </p>
      </div>
 
      <div className="w-full text-center py-4">
        <h1 className="font-inter font-medium text-2xl sm:text-3xl lg:text-4xl text-black">
          Invoice Details
        </h1>
      </div>
 
      {recurring_invoice?.recurring_invoice_id ? (
        <div className="w-full bg-white mx-auto">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 -mx-2">
              {/* Left Column - Unchanged */}
              <div className="w-full md:w-1/2 border rounded-lg shadow-sm overflow-hidden">
                <div className="bg-purple-100 w-[695px] h-[122px] flex flex-col justify-center items-center">
                  <div className="flex justify-center items-center mb-1">
                    <span className="font-medium text-black text-2xl mr-2">
                      Recurring Invoice ID
                    </span>
                    <span className="text-black text-lg mr-2">:</span>
                    <span className="text-black text-lg">
                      {recurring_invoice.recurring_invoice_id}
                    </span>
                  </div>
                  <div className="text-gray-600 text-center text-xl -ml-14">
                    Plan details
                  </div>
                </div>
 
                <div>
                  <div className="flex items-center p-4 bg-white">
                    <span className="font-medium flex-1 font-inter text-[20px] leading-[100%] tracking-[0%] w-[143px] h-[29px] flex items-center">
                      Customer ID
                    </span>
                    <span className="px-2">:</span>
                    <span className="flex-1 text-right">
                      {recurring_invoice.customer}
                    </span>
                  </div>
 
                  <div className="flex items-center p-4 bg-gray-50">
                    <span className="font-medium flex-1 font-inter text-[20px] leading-[100%] tracking-[0%] w-[143px] h-[29px] flex items-center">
                      Plan Name
                    </span>
                    <span className="px-2">:</span>
                    <span className="flex-1 text-right capitalize">
                      {plan_data.plan_name || "Base Plan"}
                    </span>
                  </div>
 
                  <div className="flex items-center p-4 bg-white">
                    <span className="font-medium flex-1 font-inter text-[20px] leading-[100%] tracking-[0%] w-[143px] h-[29px] flex items-center">
                      Plan Type
                    </span>
                    <span className="px-2">:</span>
                    <span className="flex-1 text-right capitalize">
                      {plan_data.plan_type || "Regular Subscription"}
                    </span>
                  </div>
 
                  <div className="flex items-center p-4 bg-gray-50">
                    <span className="font-medium flex-1 font-inter text-[20px] leading-[100%] tracking-[0%] w-[143px] h-[29px] flex items-center">
                      Plan Duration
                    </span>
                    <span className="px-2">:</span>
                    <span className="flex-1 text-right capitalize">
                      {recurring_invoice.frequency || "Monthly"}
                    </span>
                  </div>
 
                  <div className="flex items-center p-4 bg-white">
                    <span className="font-medium flex-1 font-inter text-[20px] leading-[100%] tracking-[0%] w-[143px] h-[29px] flex items-center">
                      Quantity
                    </span>
                    <span className="px-2">:</span>
                    <span className="flex-1 text-right">{quantity}</span>
                  </div>
 
                  <div className="flex items-center p-4 bg-gray-50">
                    <span className="font-medium flex-1 font-inter text-[20px] leading-[100%] tracking-[0%] w-[143px] h-[29px] flex items-center">
                      Start date
                    </span>
                    <span className="px-2">:</span>
                    <span className="flex-1 text-right">{startDate}</span>
                  </div>
 
                  <div className="flex items-center p-4 bg-white">
                    <span className="font-medium flex-1 font-inter text-[20px] leading-[100%] tracking-[0%] w-[143px] h-[29px] flex items-center">
                      End Date
                    </span>
                    <span className="px-2">:</span>
                    <span className="flex-1 text-right">{endDate}</span>
                  </div>
                </div>
              </div>
 
              {/* Right Column - kernchanged */}
              <div
  className="w-full max-w-[500px] h-[288px] px-[26px] py-[21px] rounded-[14px] border border-gray-300 mt-1"
  style={{ backgroundColor: "#402BA30D" }}
>
 
                <h2 className="font-medium text-[30px] leading-[100%] tracking-[0%] w-[483px] h-[36px] mb-6">
                  Payment Summary
                </h2>
                <hr className="border-t border-gray-300" />
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between py-2">
                      <span>Total</span>
                      <span>{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
 
                  <div className="flex justify-between py-2">
                    <span>Tax</span>
                    <span>{totalTax.toFixed(2)}</span>
                  </div>
                  <hr className="border-t border-gray-300 w-full" />
                  <div className="flex justify-between items-center w-full max-w-lg h-6 font-inter font-medium text-xl leading-none tracking-normal">
                    <span>Amount to Pay</span>
                    <span>Rs.{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
 
          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-between p-4 sm:p-6 gap-4">
            <button className="px-6 py-2 text-[#402BA3] border border-[#402BA3] rounded-[10px] text-base sm:text-lg">
              Back
            </button>
            <button
              onClick={handlePayment}
              className="px-6 py-2 bg-[#402BA3] text-white rounded-[10px] text-base sm:text-lg"
            >
              Processed Payment
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 text-lg">No invoice available.</p>
      )}
    </div>
  );
}
 
export default function Checkout() {
  return (
    <Suspense fallback={<div>Loading Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}