"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Assets
import Quest from "../assets/Questnet_logo.png";
import QuestSmall from "../assets/Questnest_small.png";
import dashboard from "../assets/icons/social_media_icons/Dashboard.png";
import dashboardCol from "../assets/icons/social_media_icons/dashboardCol.png";
import myCourseCol from "../assets/icons/social_media_icons/MyCourseCol.png";
import vectorCol from "../assets/icons/social_media_icons/VectorCol.png";

import my_course from "../assets/icons/social_media_icons/my_cource.png";
import my_notes from "../assets/icons/social_media_icons/my_notes.png";
import Side_cross from "../assets/icons/social_media_icons/Side_cross.png";
import Side_threeLines from "../assets/icons/social_media_icons/Side_threeLines.png";
import settings from "../assets/icons/social_media_icons/setting.png";
import settingsCol from "../assets/icons/social_media_icons/settingCol.png";


const Sidebar = ({ isCollapsed, onToggle }) => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState(null);
  const [indicatorTop, setIndicatorTop] = useState(0);
  const itemRefs = useRef([]);

  const menuItems = [
    { icon: dashboard,  activeIcon :dashboardCol, text: "Dashboard", path: "/dashboard" },
    { icon: my_course, activeIcon :myCourseCol, text: "My Course", path: "/dashboard/Course_card" },
    { icon: my_notes, activeIcon :vectorCol, text: "My Notes", path: "/dashboard/my_notes" },
  ];

  useEffect(() => {
    const currentItem = menuItems.findIndex(item => item.path === pathname);
    if (currentItem !== -1) {
      setActiveItem(currentItem);
    } else if (pathname === "/dashboard/settings") {
      setActiveItem(menuItems.length);
    }
  }, [pathname]);

  useEffect(() => {
    if (activeItem !== null && itemRefs.current[activeItem]) {
      const offsetTop = itemRefs.current[activeItem].offsetTop;
      setIndicatorTop(offsetTop);
    }
  }, [activeItem, isCollapsed]);

  const toggleSidebar = () => {
    onToggle(!isCollapsed);
  };

  const handleItemClick = (index) => {
    setActiveItem(index);
  };

  const isActive = (index) => index === activeItem;

  return (
    <div
      className={`bg-white text-black h-screen shadow-md flex flex-col justify-between transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-[193px]"
      } relative`}
    >
      {/* Animated Indicator */}
      {activeItem !== null && (
        <div
          className="absolute left-0 w-1 rounded-r-full bg-[#6A5AE0]"
          style={{
            top: indicatorTop,
            height: 44, // matches menu item height
            transition: "top 0.4s ease-in-out",
          }}
        ></div>
      )}

      {/* Top Section */}
      <div>
        <div className="flex justify-end mt-[37px] mr-4">
          <button onClick={toggleSidebar}>
            <Image
              src={isCollapsed ? Side_threeLines : Side_cross}
              alt="Toggle Sidebar"
              width={25}
              height={25}
              className="transition-transform duration-300"
            />
          </button>
        </div>

        <div className="flex justify-start ml-[14px] mt-[37px]">
          <Image
            src={isCollapsed ? QuestSmall : Quest}
            alt="Logo"
            width={isCollapsed ? 38 : 147}
            height={46}
          />
        </div>

        <ul className="flex flex-col items-start mt-[40px] gap-6">
          {menuItems.map((item, idx) => (
            <li
              key={idx}
              className="w-full relative"
              ref={(el) => (itemRefs.current[idx] = el)}
            >
              <Link href={item.path} onClick={() => handleItemClick(idx)}>
                <div
                  className={`flex items-center p-2   `}
                >
                  <div
                    className={`flex ${
                      isCollapsed ? "justify-center w-full" : "pl-[20px]"
                    }`}
                  >
                    <Image
                      src={isActive(idx) ? item.activeIcon : item.icon}
                      alt={item.text}
                      width={22}
                      height={22}
                      className={`w-6 h-6 transition-colors duration-300 $`}
                    />
                    {!isCollapsed && (
                      <span
                        className={`ml-3 text-sm font-medium transition-colors duration-300 ${
                          isActive(idx) ? "text-[#6A5AE0] " : ""
                        }`}
                      >
                        {item.text}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Section - Settings */}
      <div className="pb-8">
        <div
          ref={(el) => (itemRefs.current[menuItems.length] = el)}
          className="w-full relative"
        >
          <Link
            href="/dashboard/settings"
            onClick={() => handleItemClick(menuItems.length)}
          >
            <div
              className={`flex items-center p-2 relative overflow-hidden `}
            >
              <div
                className={`flex ${
                  isCollapsed ? "justify-center w-full" : "pl-[20px]"
                }`}
              >
                <Image
                  src={isActive(menuItems.length)?settingsCol:settings}
                  alt="Settings"
                  width={24}
                  height={24}
                  className={`w-6 h-6 transition-colors duration-300 ${
                    isActive(menuItems.length) ? "filter-purple" : ""
                  }`}
                />
                {!isCollapsed && (
                  <span
                    className={`ml-3 text-sm font-medium transition-colors duration-300 ${
                      isActive(menuItems.length) ? "text-[#6A5AE0]" : ""
                    }`}
                  >
                    Settings
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Style for image coloring */}
      <style jsx global>{`
        .filter-purple {
          filter: invert(35%) sepia(71%) saturate(1057%) hue-rotate(225deg) brightness(86%) contrast(97%);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
