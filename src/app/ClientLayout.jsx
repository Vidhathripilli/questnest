// app/ClientLayout.js
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "../assets/logo.png";
import DashboardLayout from "./(dashboard)/layout";
import { SearchProvider } from "@/context/SearchContext";
// import DashboardLayout from "./dashboard/layout";
 
export default function ClientLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
 
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);
 
  return (
    <>
    
    <SearchProvider>
      {isLoggedIn ? (
        <Dashboard>
              {children}
          </Dashboard>
      ) : (
        <div className="min-h-screen flex flex-col">
          {/* <nav className="bg-gray-300 text-white p-4">
            <div className="mx-auto flex justify-between items-center">
              <Link href="/" className="flex items-center">
                <Image src={logo} alt="logo" />
              </Link>
              <div>
                <p className="text-center mt-4">
                  Already have an account?{" "}
                  <Link href="/login_page" className="text-blue-500">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </nav> */}
 
          {children}
 
          {/* <footer className="bg-white text-gray-500 text-sm p-4 flex justify-between items-center w-full sticky bottom-0">
            <div className="flex space-x-4">
              <Link href="/about">About Us</Link>
              <Link href="/contact">Contact Us</Link>
              <Link href="/faqs">FAQs</Link>
            </div>
            <p>Website © 2025</p>
          </footer> */}
        </div>
      )}
      </SearchProvider>
 
    </>
  );
}