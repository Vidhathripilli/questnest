'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
// import LoginPage from '@/app/(auth)/login/page';
// import SignUpForm from '@/app/(auth)/signup/page';
import registration from '../assets/icons/social_media_icons/registration.png'
import Image from 'next/image';
import SignUpForm from './(auth)/signup/page';
import LoginPage from './(auth)/login/page';
const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="flex items-center justify-center p-2 sm:p-4 min-h-screen">
      <div className="w-full max-w-6xl mx-auto 
        bg-gradient-to-b from-[#A898F9] to-[#4631A7] 
        shadow-lg mt-2 sm:mt-4 
        rounded-xl sm:rounded-3xl 
        relative 
        min-h-[90vh] sm:min-h-[600px] md:h-[90vh] h600:h-[90vh] 
        lg:min-h-[85vh] 
        grid grid-cols-1 md:grid-cols-2 
        overflow-hidden">

        {/* Animated Image Panel */}
        <motion.div
          animate={{ 
            x: isSignUp 
              ? '100%' 
              : '0%',
            y: isSignUp && window.innerWidth < 768 
              ? '0%' 
              : '0%'
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute top-0 left-0 w-full md:w-1/2 h-1/2 md:h-full text-white flex items-center justify-center z-10 p-4 sm:p-6 md:p-8 overflow-hidden"
        >
          <div className="relative w-full h-full rounded-xl sm:rounded-3xl">
            <Image
              src={registration}
              alt="Registration Background"
              layout="fill"
              objectFit="cover"
              className="absolute top-0 h600:h-[100vh] left-0 rounded-xl sm:rounded-3xl"
              onError={(e) => console.log("Image failed to load:", e)}
            />
          </div>
        </motion.div>

        {/* SignUp Form */}
        <motion.div
          animate={{ x: isSignUp ? '-0%' : '0%' }}
          transition={{ duration: 0.5 }}
          className="w-full h-full z-0 mt-[50%] md:mt-0"
        >
          <SignUpForm setIsSignUp={setIsSignUp} />
        </motion.div>

        {/* Login Form */}
        <motion.div
          animate={{ x: isSignUp ? '-0%' : '0%' }}
          transition={{ duration: 0.5 }}
          className="w-full h-full z-0"
        >
          <LoginPage setIsSignUp={setIsSignUp} />
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;