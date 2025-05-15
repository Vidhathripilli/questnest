'use client'

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPortal } from "react-dom";
import { ApiClientUserAccount } from "@/service/ApiUserAccount";

const OtpModal = ({ isOpen, onClose }) => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [timeLeft, setTimeleft] = useState(300); // 5 minutes
  const [isResend, setIsResend] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const inputRefs = useRef([]);

  // Handle mounting for client-side portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Focus on first input when modal opens
  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0].focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle countdown timer
  useEffect(() => {
    if (!isOpen) return;
    
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeleft(timeLeft - 1), 1000);
      return () => clearInterval(timer);
    } else {
      setIsResend(false);
    }
  }, [timeLeft, isOpen]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
if (error) setError('');
    // Move to next input if current is filled
    if (element.value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      // Add a toast notification here
      setError("Please enter a complete 6-digit OTP");

      return;
    }

    try {
      const response = await ApiClientUserAccount.post('auth/otp_verification', {
        otp: parseInt(otpValue),
        user_id: user.id
      }, {
        headers: { "Content-Type": "application/json" ,   "X-TENANT-ID" : "TNT20250001"},
      });

      if (response.status === 200) {
        //console.log(response);
        dispatch({ type: "auth/verifyOtp" }); // Update Redux state
        setIsResend(false);
        router.push('/create_school'); // Redirect to create_school page
      }
    } catch (error) {
      setError("opps! invalid ")
      console.log(error);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    
    try {
      const response = await ApiClientUserAccount.post('auth/resend_otp', 
        { user_id: user.id }, 
        {
          headers: { 
            "Content-Type": "application/json",
            "X-TENANT-ID": "TNT20250002"
          },
        }
      );
      
      if (response.status === 201) {
        setOtp(new Array(6).fill(''));
        setTimeleft(300);
        setIsResend(true);
        // Add a toast notification here
        console.log("New OTP sent successfully!");
        
        // Focus on first input after resending
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    } catch (error) {
      console.error(error);
      // Add a toast notification here
      console.error("Failed to resend OTP. Please try again.");
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // If modal is not open or we're not mounted, don't render anything
  if (!isOpen || !mounted) return null;

  // Use React Portal to render the modal outside the normal DOM hierarchy
  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center z-[9999]" 
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(3px)'
      }}
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm relative"
        style={{ zIndex: 10000 }}
        onClick={e => e.stopPropagation()} // Prevent clicks from bubbling up
      >
        <div className="flex items-center mb-5">
          <button 
            onClick={onClose}
            className="text-gray-500 mr-2 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-bold">Confirmation</h2>
        </div>
        
        <p className="text-gray-800 mb-4 text-sm">
          Please enter the code we sent to the<br />
          Email {user?.email ? `*******${user.email.substring(user.email.indexOf('@') - 2)}` : '********@gmail.com'}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between gap-2 mb-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text" 
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-10 h-12 text-center text-xl border border-red-400 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-600"
                style={{ borderWidth: '1px' }}
              />
            ))}
          </div>
          
          <div className="flex justify-between items-center mb-4 text-xs">
            <p className='text-gray-400'>After {formatTime(timeLeft)}</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResend}
              className="text-indigo-800 font-medium focus:outline-none"
            >
              {isResend ? '' : "Didn't receive? "}<span className="underline">Resend OTP</span>
            </button>
          </div>
          
          {error && (
            <p className="text-red-500 text-xs mb-3">
              {error}
            </p>
          )}
          
          <button
            type="submit"
            className="w-full bg-indigo-800 text-white py-3 px-4 rounded-md hover:bg-indigo-900 transition duration-300 font-medium"
          >
            Confirm
          </button>
        </form>
      </div>
    </div>,
    document.body // This ensures the modal is rendered directly as a child of body
  );
};

export default OtpModal;