// app/registration/Step2.js
"use client";
export const dynamic = "force-dynamic"; // Disable static generation

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";

function Step2Content() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const step = parseInt(searchParams.get("step")) || 2; // Default to step 2
  const userType = searchParams.get("type") || "";
  //console.log(userType);
  

  const [selectedType, setSelectedType] = useState(userType);

  const handleNext = () => {
    if (step <= 5) {
      router.push(`/standar2/step2org?step=${step + 1}&type=${selectedType}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      {/* Step Indicators */}
      <div className="flex items-center space-x-4 mb-8">
        {[1, 2, 3, 4, 5].map((num) => (
          <div
            key={num}
            className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
              step >= num
                ? "bg-blue-500 text-white border-blue-500"
                : "border-gray-300 text-gray-300"
            }`}
          >
            {num}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-md bg-white shadow-none rounded-none p-0">
        <div className="text-center">
          {/* Question */}
          <div className="border-2 border-blue-500 p-4 rounded-lg mb-6">
            <span className="text-blue-500 text-lg font-semibold">
              Great! Let’s create an organization...
            </span>
          </div>

          {/* Notes */}
          <div className="mt-6 text-blue-500 text-sm">
            <p>Your Organization details will appear on all correspondence to your students/staff</p>
            <p className="mt-2">
              Organization enables centralized management of all schools and courses created within it.
            </p>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="px-4 py-2 border-2 border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition-colors duration-200 mt-6 inline-block"
          >
            Next &gt;
          </button>
        </div>
      </div>

      {/* Footer */}
      

      {/* Additional Link at Bottom */}
      <div className="mt-4 text-sm">
        <a href="#" className="text-red-500 hover:underline">
          Checkout the documentation related to creating an organization. Learn More...
        </a>
      </div>
    </div>
  );
}

export default function Step2() {
  return (
    <Suspense fallback={<div>Loading Step 2...</div>}>
      <Step2Content />
    </Suspense>
  );
}
