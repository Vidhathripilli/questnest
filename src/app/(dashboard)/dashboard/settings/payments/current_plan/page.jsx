'use client'
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const page = () => {
  // State to track if user has an active plan
  const [hasActivePlan, setHasActivePlan] = useState(true);
  // State to control the cancel confirmation modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  // State to track the selected plan
  const [selectedPlan, setSelectedPlan] = useState({
    name: "Basic",
    price: 10,
    billingCycle: "per month",
    nextPayment: "Apr 24, 2025",
    description: "Learning Management System",
    features: [
      { name: "Number of Courses", value: "1" },
      { name: "Number of Lessons", value: "10" },
      { name: "Number of Students", value: "25" },
      { name: "Storage", value: "5GB" }
    ],
    startDate: "Apr 24, 2025",
    endDate: "Apr 24, 2026"
  });

  // Full plan data including Basic plan
  const allPlans = {
    basicPlan: {
      name: "Basic",
      price: 10,
      billingCycle: "per month",
      description: "Learning Management System",
      features: [
        { name: "Number of Courses", value: "1" },
        { name: "Number of Lessons", value: "10" },
        { name: "Number of Students", value: "25" },
        { name: "Storage", value: "5GB" }
      ]
    },
    otherPlans: [
      {
        name: "Standard",
        price: 20,
        billingCycle: "per month",
        description: "Learning Management System",
        features: [
          { name: "Number of Courses", value: "10" },
          { name: "Number of Lessons", value: "Unlimited" },
          { name: "Number of Students", value: "250" },
          { name: "Storage", value: "200GB" }
        ],
        bestValue: true
      },
      {
        name: "Professional",
        price: 100,
        billingCycle: "per month",
        description: "Learning Management System ",
        features: [
          { name: "Number of Courses", value: "10" },
          { name: "Number of Organizations", value: "10" },
          { name: "Number of Lessons", value: "Unlimited" },
          { name: "Number of Students", value: "250" },
          { name: "Storage", value: "200GB" }
        ]
      },
      {
        name: "Partner",
        price: 250,
        billingCycle: "per month",
        description: "Learning Management System Customer Relationship Management Project Management",
        features: [
          { name: "Number of Courses", value: "10" },
          { name: "Number of Organizations", value: "10" },
          { name: "Number of Lessons", value: "Unlimited" },
          { name: "Number of Students", value: "250" },
          { name: "Storage", value: "200GB" }
        ]
      }
    ]
  };

  // Function to handle subscription cancellation
  const handleCancelSubscription = () => {
    setShowCancelModal(true);
  };

  // Function to proceed with cancellation
  const handleProceedCancellation = () => {
    setShowCancelModal(false);
    setHasActivePlan(false);
    // Show toast message
    showToast("Your plan cancelled", "You can add a new plan");
  };

  // Function to close the modal without cancelling
  const handleCloseModal = () => {
    setShowCancelModal(false);
  };

  // Function to select and activate a plan
  const handleSelectPlan = (plan) => {
    // Set the current date plus one year for the new plan
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);
    
    // Format dates
    const startDateFormatted = formatDate(today);
    const endDateFormatted = formatDate(nextYear);
    const nextPaymentFormatted = startDateFormatted;

    // Create the selected plan with dates
    const newSelectedPlan = {
      ...plan,
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      nextPayment: nextPaymentFormatted
    };
    
    setSelectedPlan(newSelectedPlan);
    setHasActivePlan(true);
    
    // Show toast message
    showToast("Plan selected", `You have selected the ${plan.name} plan`);
  };

  // Helper function to format dates
  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Toast notification state and functions
  const [toast, setToast] = useState({ show: false, title: "", message: "" });
  
  const showToast = (title, message) => {
    setToast({ show: true, title, message });
    setTimeout(() => {
      setToast({ show: false, title: "", message: "" });
    }, 5000);
  };

  // Get all available plans based on subscription status
  const getAvailablePlans = () => {
    if (hasActivePlan) {
      // When user has an active plan, show other plans except the selected one
      // Combine all plans first
      const allAvailablePlans = [allPlans.basicPlan, ...allPlans.otherPlans];
      // Then filter out the selected plan
      return allAvailablePlans.filter(plan => plan.name !== selectedPlan.name);
    } else {
      // When user has no active plan, show all plans
      return [allPlans.basicPlan, ...allPlans.otherPlans];
    }
  };

  return (
    <div className="min-h-screen p-6 mx-0">
      {/* Breadcrumb */}
      <div className="mb-4">
        <div className="flex items-center text-sm">
          <span className="text-gray-700">Payments</span>
          <ArrowRight className="h-3 w-3 mx-2 text-gray-500" />
          <span className="font-medium">Current Plan</span>
        </div>
        <div className="text-xs text-gray-500">Management Current plan and upgrade</div>
      </div>

      {/* Current Plan Section */}
      <div className="bg-white rounded-lg p-6 mb-6 mx-0 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Current Plan</h2>
            <p className="text-sm text-gray-500">You are currently</p>
          </div>
          {hasActivePlan && (
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-500">Next Payment</span>
                <span className="ml-2 font-medium">{selectedPlan.nextPayment}</span>
              </div>
              <button 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm"
                onClick={handleCancelSubscription}
              >
                Cancel Subscription
              </button>
            </div>
          )}
        </div>

        {hasActivePlan ? (
          /* Current Plan Card */
          <div className="bg-[#4328B0] rounded-2xl p-6 text-white flex justify-between items-center">
            <div className="flex justify-between h-full">
              {/* Plan Name and Description */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-4 w-4 rounded-full bg-white flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-[#4328B0]"></div>
                  </div>
                  <span className="font-semibold text-lg">{selectedPlan.name}</span>
                </div>
                <div className="text-xs text-gray-400">{selectedPlan.description}</div>
                <button className="mt-4 px-6 py-2 border border-gray-300 rounded-md text-sm font-semibold">
                  Current Plan
                </button>
                <div className="mt-2 text-xs text-gray-400 underline cursor-pointer">
                  Learn more
                </div>
              </div>

              {/* Plan Features */}
              <div className="space-y-4 my-auto">
                {selectedPlan.features.map((feature, index) => (
                  <div key={index} className="flex mx-2 items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-white"></div>
                    <span className="text-sm text-gray-300">{feature.name}: {feature.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-end">
                <span className="text-4xl font-bold">${selectedPlan.price}</span>
              </div>
              <div className="text-xs text-indigo-100 mt-1">
                {selectedPlan.billingCycle}
              </div>
            </div>

            {/* Price and Dates */}
            <div className="flex flex-col items-end gap-4 ml-8">
              {/* Start and End Dates */}
              <div className="flex gap-4">
                <div className="border border-indigo-300 rounded-md p-2 text-center text-xs">
                  <div className="text-indigo-100 mb-1">Start Date</div>
                  <div className="text-sm font-semibold">{selectedPlan.startDate}</div>
                </div>
                <div className="border border-indigo-300 rounded-md p-2 text-center text-xs">
                  <div className="text-indigo-100 mb-1">Expiry date</div>
                  <div className="text-sm font-semibold">{selectedPlan.endDate}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* No Active Plan View */
          <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
            <p className="font-medium mb-2">Currently You don't have any plan</p>
            <p className="text-indigo-600 text-sm mb-4">Purchase Any Plan</p>
          </div>
        )}
      </div>

      {/* Other Plans Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-1">
          {hasActivePlan ? "Other plans" : "Available plans"}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {hasActivePlan ? "You can Upgrade the plan" : "Select a plan to subscribe"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getAvailablePlans().map((plan, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 relative">
              {plan.bestValue && (
                <div className="absolute top-0 right-0 bg-indigo-700 text-white px-2 py-1 text-xs rounded-tr-lg rounded-bl-lg">
                  Best Value
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-1">
                <div className="h-4 w-4 rounded-full border border-gray-300 flex items-center justify-center">
                  {hasActivePlan && selectedPlan.name === plan.name && (
                    <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
                  )}
                </div>
                <span className="font-medium">{plan.name}</span>
              </div>
              
              <div className="text-xs text-gray-500 h-16">
                {plan.description}
              </div>
              
              <div className="my-4">
                <span className="text-3xl font-bold text-indigo-800">${plan.price}</span>
                <span className="text-xs text-gray-500 ml-1">{plan.billingCycle}</span>
              </div>
              
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-indigo-600"></div>
                    <span className="text-sm text-gray-700">{feature.name}: {feature.value}</span>
                  </div>
                ))}
              </div>
              
              <button 
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md text-sm"
                onClick={() => handleSelectPlan(plan)}
                disabled={hasActivePlan && selectedPlan.name === plan.name}
              >
                {hasActivePlan 
                  ? (selectedPlan.name === plan.name ? "Current Plan" : "Upgrade Plan") 
                  : "Select Plan"
                }
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="bg-red-100 p-4 rounded-full">
                  <div className="text-red-500 font-bold text-xl">CANCELLED</div>
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">Are you sure you want to Cancel Membership?</h3>
              
              <div className="flex gap-4 w-full mt-6">
                <button 
                  className="flex-1 border border-gray-300 px-4 py-2 rounded-md text-gray-700"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button 
                  className="flex-1 bg-red-600 px-4 py-2 rounded-md text-white"
                  onClick={handleProceedCancellation}
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-start gap-3 z-50 border-l-4 border-yellow-500">
          <div className="bg-yellow-100 p-2 rounded-full">
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-medium">{toast.title}</h4>
            <p className="text-sm text-gray-500">{toast.message}</p>
          </div>
          <button 
            className="text-gray-400 hover:text-gray-500" 
            onClick={() => setToast({ show: false, title: "", message: "" })}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default page;