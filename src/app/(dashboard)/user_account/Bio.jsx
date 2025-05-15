"use client"
import React, { useState } from "react";
import Image from "next/image";
import user from "../../../assets/user_icon.png";
import cover from "../../../assets/cover_image.jpeg";
 
const Bio = () => {
  const [activeTab, setActiveTab] = useState("bio");
 
  return (
    <div className="min-h-screen items-center">
      {/* Profile Card */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-sm text-center p-4">
        {/* Cover Image */}
        <div className="relative">
          <Image
            src={cover} // Replace with actual cover image
            alt="Cover"
            width={400}
            height={200}
            className="w-full h-32 object-cover rounded-lg"
          />
          {/* Profile Image */}
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <Image
                src={user} // Replace with actual profile image
                alt="Profile"
                width={80}
                height={80}
                className="w-30 h-30 object-cover rounded-full border-4 border-white shadow-md"
              />
              {/* Camera Icon */}
              <div className="absolute bottom-0 right-0 bg-green-500 p-2 rounded-full border-2 border-white">
                <span className="fa fa-camera fs-1"></span>
              </div>
            </div>
          </div>
        </div>
 
        {/* User Info */}
        <div className="pt-12 pb-4">
          <h2 className="text-lg font-semibold text-gray-800">Samantha Joe</h2>
          <span className="bg-orange-400 text-white px-3 py-1 text-sm rounded-full">
            Student
          </span>
 
          <div className="text-blue-500 text-sm mt-4 cursor-pointer flex justify-center items-center gap-1">
            <p>Headline</p>
            <span className="fa fa-pen"></span>
          </div>
 
          <p className="mt-2 text-sm text-gray-600 italic">
            "I am an enthusiastic UI Developer looking to learn and grow"
          </p>
 
          
        </div>
      </div>
 
      {/* Bio Section with Tabs */}
      <div className="shadow-lg rounded-lg  max-w-md mt-6 p-4 bg-white  overflow-hidden w-full  text-center text-sm">
        <div className="flex border-b ">
          {["bio", "address", "communication"].map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-2 text-center border-r-2 rounded-sm ${
                activeTab === tab ? "text-blue-500 border-b-2 border-blue-500 font-semibold" : "text-gray-600"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
 
        <div className="p-4">
          {activeTab === "bio" && (
            <div>
              <div className="text-blue-500 text-sm cursor-pointer flex justify-end items-center gap-1">
                <p>Edit</p>
                <span className="fa fa-pen"></span>
              </div>
              <p className="text-gray-700 text-sm">
                I am a passionate UI/UX designer with a keen eye for creating intuitive and user-friendly digital experiences...
              </p>
            </div>
          )}
          {activeTab === "address" && (
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
            {/* Edit Button */}
            <div className="flex justify-end">
              <button className="text-[#046A77] text-sm flex items-center gap-1 hover:underline">
                <span className="fa fa-pen" /> Edit
              </button>
            </div>
      
            {/* Email */}
            <div className="flex items-center gap-3 text-gray-700 mb-3">
              <span size={18} className="fa fa-envelope text-[#046A77]" />
              <p>samantha.joe@gmail.com</p>
            </div>
      
            {/* Address */}
            <div className="flex items-start gap-3 text-gray-700 mb-3">
              <span className="text-[#046A77] fa fa-map-marker" />
              <p>312 3rd St, Albany, New York 12206, USA</p>
            </div>
      
            {/* Mobile Number */}
            <div className="flex items-center gap-3 text-gray-700 mb-3">
              <span  className="text-[#046A77] fa fa-mobile" />
              <p>+1 123-123-123</p>
            </div>
      
            {/* Phone Number */}
            <div className="flex items-center gap-3 text-gray-700 mb-3">
            <span  className="text-[#046A77] fa fa-whatsapp" />
 
              <p>+1 123-123-123</p>
            </div>
      
            {/* Resume */}
            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-[#046A77] fa fa-file" />
              <p className="cursor-pointer hover:underline">Resume</p>
            </div>
          </div>
          )}
          {activeTab === "communication" && <p>Communication preferences go here...</p>}
        </div>
      </div>
    </div>
  );
};
 
export default Bio;
 
 