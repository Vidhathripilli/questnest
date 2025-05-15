import React from 'react';
import { ArrowRight, CreditCard } from 'lucide-react';

const page = () => {
  // Dummy data object based on the screenshot
  const paymentData = {
    breadcrumb: {
      parent: "Payments",
      current: "Payments Method",
      description: "Management Payments Method"
    },
    paymentMethod: {
      title: "Payment Method",
      subtitle: "Update your payment information",
      cardInfo: {
        type: "Visa",
        lastFour: "2423",
        expiryDate: "12/2025",
        nameOnCard: "Alex",
        billingEmail: "Alex@gmail.com"
      }
    }
  };

  return (
    <div className=" min-h-screen p-6">
      {/* Breadcrumb */}
      <div className="mb-4">
        <div className="flex items-center text-sm">
          <span className="text-gray-700">{paymentData.breadcrumb.parent}</span>
          <ArrowRight className="h-3 w-3 mx-2 text-gray-500" />
          <span className="font-medium">{paymentData.breadcrumb.current}</span>
        </div>
        <div className="text-xs text-gray-500">{paymentData.breadcrumb.description}</div>
      </div>

      {/* Payment Method Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold">{paymentData.paymentMethod.title}</h2>
          <p className="text-sm text-gray-500">{paymentData.paymentMethod.subtitle}</p>
        </div>

        {/* Credit Card Information */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="font-medium">
                {paymentData.paymentMethod.cardInfo.type} ending in {paymentData.paymentMethod.cardInfo.lastFour}
              </div>
              <div className="text-sm text-gray-500">
                Expires in {paymentData.paymentMethod.cardInfo.expiryDate}
              </div>
            </div>
          </div>
          <button className="px-4 py-1 border border-gray-300 rounded-md text-sm">
            Edit
          </button>
        </div>

        {/* Name and Email Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Name on card</label>
            <input 
              type="text" 
              value={paymentData.paymentMethod.cardInfo.nameOnCard}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Billing Email</label>
            <input 
              type="email" 
              value={paymentData.paymentMethod.cardInfo.billingEmail}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
        </div>

        {/* Update Button */}
        <div className="flex justify-end">
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm">
            Update payment Deatils
          </button>
        </div>
      </div>
    </div>
  );
};

export default page;