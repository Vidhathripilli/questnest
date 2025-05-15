// app/standar2/Individual/step4Ind/page.js
"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

function Step4IndContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const step = parseInt(searchParams.get("step")) || 2; // Default to step 2
  const userType = searchParams.get("type") || "";
  ////console.log(userType);

  const [selectedType, setSelectedType] = useState(userType);

  const handleNext = () => {
    if (step <= 5) {
      router.push(`/standar2/step4IndPlan?step=${step + 1}&type=${selectedType}`);
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
              num <= step
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
          {/* Heading */}
          <h1 className="text-blue-500 text-lg font-semibold mb-6">
            Wonderful! Let’s choose a plan.
          </h1>

          {/* Note */}
          <div className="mt-6 text-blue-500 text-sm">
            <p>
              <span className="inline-block mr-2">ℹ️</span>
              Not sure which plan to select? Checkout the documentation for plans.
            </p>
            <Link
              href="#"
              className="text-red-500 hover:underline mt-2 inline-block"
            >
              Learn More...
            </Link>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="px-4 py-2 border-2 border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition-colors duration-200 mt-6 inline-block"
          >
            Next 
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Step4Ind() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Step4IndContent />
    </Suspense>
  );
}