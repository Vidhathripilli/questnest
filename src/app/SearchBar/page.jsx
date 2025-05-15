import React from "react";
import magnifier from '../../assets/icons/social_media_icons/Magnifer.svg'
import Image from "next/image";
const SearchBar = () => {
  return (
    <>
     <div className="relative  w-80">
        <input
            type="text"
            placeholder="Search here..."
            className="bg-white h-12  w-full pl-10 text-blue-600 pr-4 rounded-3xl focus:outline-0 my-1"
        />
        <span className="s absolute right-3 top-7 transform -translate-y-1/2 text-blue-400"><Image src={magnifier}></Image></span>
    </div>

    </>
  );
};

export default SearchBar;
