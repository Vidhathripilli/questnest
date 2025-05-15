import Profile from "../app/Profile/page";
import SchoolDropDown from "../app/SchoolDropDown/page";
import SearchBar from "../app/SearchBar/page";
import React, { useState } from "react";
import Notification from "../app/Notification/page";
import { FaBars, FaTimes } from "react-icons/fa";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="h-14 md:h-16 w-full flex items-center justify-between px-2 sm:px-4 relative  ">
      {/* Left side - Logo or Brand */}
      <div className="flex justify-start items-center">
        {/* <div className="text-lg font-bold">Logo</div> */}

        {/* Mobile menu toggle - only visible on small screens */}
        <button
          className="ml-4 p-1 rounded-md lg:hidden"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Right side components */}
      <div
        className={`
        ${
          mobileMenuOpen
            ? "absolute top-14 left-0 right-0 flex flex-col"
            : "hidden"
        } 
        lg:flex lg:static lg:flex-row
        bg-white lg:bg-transparent
        shadow-md lg:shadow-none
        py-4 lg:py-0
        w-full lg:w-auto
        z-10
        items-center gap-2 md:gap-4
      `}
      >
        {/* SearchBar */}
        

        {/* Other components */}
        <div className="flex flex-col lg:flex-row items-center w-full lg:w-auto gap-4 px-4 lg:px-0">
        {/* <div className="w-full px-4 lg:px-0 lg:w-[350px] xl:w-[450px] mb-2 lg:mb-0"> */}
          <SearchBar />
        {/* </div> */}
          <SchoolDropDown />
          <Notification />
          <Profile />
        </div>
      </div>
    </header>
  );
};

export default Header;
