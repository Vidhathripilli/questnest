// app/registration/Step4.js
import Link from "next/link";

export default function Step4() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      {/* Step Indicators */}
      <div className="flex items-center space-x-4 mb-8">
        {[1, 2, 3, 4, 5].map((num) => (
          <div
            key={num}
            className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
              num <= 4
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
          <Link
            href="/standar2/step4plan"
            className="px-4 py-2 border-2 border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition-colors duration-200 mt-6 inline-block"
          >
            Next &gt;
          </Link>
        </div>
      </div>


      {/* Footer */}
      
    </div>
  );
}