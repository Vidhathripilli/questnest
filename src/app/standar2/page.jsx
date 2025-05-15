// app/standar2/page.js
"use client"; // Mark this component as a Client Component
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import Step2 from "./step2/page";
import Step4 from "./step4/page";
// import Step5 from "./step5/page";
import Step2Ind from "./Individual/step2Ind/page";
import Step4Ind from "./Individual/step4Ind/page";
// import Step5Ind from "./Individual/step5Ind/page";
import logo from "../../assets/Questnet_logo.png";
import Image from "next/image";
import { useSelector } from "react-redux";
import LoadingPage from "../Loading/page";
 
 
function Standar2Content() {
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams(); // Requires Suspense boundary
  const router = useRouter();
  const step = parseInt(searchParams.get("step")) || 1;
 
  // Get the user type from URL query or default to null
  const user = useSelector((state) => state.auth.user);
  //console.log(user)
  const userType = searchParams.get("type") || null;
  const [selectedType, setSelectedType] = useState(userType); // Track user selection
 
  // Conditionally render based on step and user type
  if (step === 2) {
    if (selectedType === "individual") return <Step2Ind />;
    return <Step2 />;
  }
  if (step === 4) {
    if (selectedType === "individual") return <Step4Ind />;
    return <Step4 />;
  }
  // if (step === 5) {
  //   if (selectedType === "individual") return <Step5Ind />;
  //   return <Step5 />;
  // }
 
  const handleNext = () => {
    if (!selectedType) {
      alert("Please select Individual/Freelancer or Organization before proceeding.");
      return;
    }
  
    const nextStep = step + 1;
  
    const nextPage =
      selectedType === "individual"
        ? `/standar2/step2Indprofile?step=${nextStep}&type=individual`
        : `/standar2/step2org?step=${nextStep}&type=organization`;
  
    router.push(nextPage);
  };
  
 
  const handleRadioChange = (value) => {
    setSelectedType(value);
  };
  const currentStep = 2;


  if (loading) {
    return <LoadingPage />;
  }
  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-12 lg:px-[120px]">
      {/* <Toaster position="top-center" /> */}
   {/* Logo and Step Indicator */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-11 mb-3 items-center px-4">
  {/* Step Indicators */}
  <div className="relative mx-auto md:mx-0 w-full">
    {/* Background line */}
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[216px] h-0.5 bg-[#A999FA] z-0" />
 
 
    {/* Step Indicator Circles */}
 
    <div className="flex items-center justify-center sm:justify-start space-x-6 sm:space-x-10 relative z-10 mx-4 md:mx-6">
  {[1, 2, 3, 4].map((step) => (
    <div
      key={step}
      className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-sm font-semibold ${
        step < currentStep
          ? "bg-[#402BA3] text-white border-[#402BA3]" // Completed step
          : step === currentStep
          ? "bg-[#402BA3] text-white border-[#402BA3]" // Current step
          : "border-[#402BA3] text-[#402BA3] bg-white" // Future step
      }`}
    >
      {step < currentStep ? "✓" : step}
    </div>
  ))}
</div>
</div>
 
  {/* Logo */}
  <div className="w-full flex justify-center items-center">
    <Image src={logo} alt="questnest logo" className="h-16 w-auto" />
  </div>
</div>
 

    <div className="w-full max-w-[1215px] mx-auto h-auto mt-10 px-4 sm:px-6 md:px-10 py-10 rounded-[36px] bg-gradient-to-b from-[#AF9FFF] to-[#402BA3] text-white shadow-lg">
      <div className="text-center">
        <div className="p-4 rounded-lg mb-6 mt-[60px]">
          <span className="text-white text-[24px] sm:text-[28px] md:text-[30px] font-semibold block text-center mx-auto">
            Are you an Individual or part of an Organization?
          </span>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-[60px]   md:gap-[121px] mt-8">
            <label className="flex items-center text-white cursor-pointer">
              <input
                type="radio"
                name="type"
                className="appearance-none w-[20px] h-[20px] border-2 border-white rounded-full mr-3 bg-transparent checked:bg-white checked:border-white"
                value="individual"
                checked={selectedType === "individual"}
                onChange={() => handleRadioChange("individual")}
              />
              Individual/Freelancer
            </label>

            <label className="flex items-center text-white cursor-pointer">
              <input
                type="radio"
                name="type"
                className="appearance-none w-[20px] h-[20px] border-2 border-white rounded-full mr-3 bg-transparent checked:bg-white checked:border-white"
                value="organization"
                checked={selectedType === "organization"}
                onChange={() => handleRadioChange("organization")}
              />
              Organization
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center mt-6 gap-6 sm:gap-[60px] md:gap-[121px]">
            <button className="w-[150px] h-[50px] border-2 border-white text-white rounded-[10px] px-6 py-3 transition-colors duration-300">
              Back
            </button>
            <button
              className={`w-[150px] h-[50px] bg-white border-2 border-white text-[#7261BF] rounded-[10px] px-6 py-3 transition-colors duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Next'}
            </button>
          </div>

        <div className="mt-12 mb-4 px-4">
          <p className="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed flex gap-3 text-center sm:text-left items-start">
            <span className="inline-flex items-center justify-center w-[30px] h-[30px] sm:w-[50px] sm:h-[20px] text-sm font-semibold text-white border-white rounded-full border-2 mt-[5px]">
              i
            </span>
            Your Organization details will appear on all correspondence to your students/staff. If you have selected individual, your personal details will be displayed on the outgoing correspondence.
          </p>
        </div>
      </div>
    </div>
  </div>
);
}

export default function Standar2() {
return (
  <Suspense fallback={<div>Loading...</div>}>
    <Standar2Content />
  </Suspense>
);
}