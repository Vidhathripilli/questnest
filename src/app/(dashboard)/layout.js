"use client";
import Header from "@/src/components/Header";
import Sidebar from "@/src/components/Sidebar";
import { useState } from "react";

export default function DashboardLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleToggleSidebar = (newState) => {
    setIsCollapsed(newState);
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <div className="flex-1 flex relative">

        {/* Sidebar Modal */}
        {isCollapsed ? (
          <div className="w-16 transition-all duration-300 z-50">
            <Sidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />
          </div>
        ) : (
          <>
            <div className="fixed inset-0 z-50 flex">
              {/* Sidebar */}
              <div className="w-[193px] shadow-lg bg-white h-full">
                <Sidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />
              </div>
            </div>

            {/* Overlay on rest of the app to disable interaction */}
            <div
              className="fixed inset-0 bg-gray-200 bg-opacity-10 z-10"
              onClick={() => setIsCollapsed(true)}
            />
          </>
        )}

        {/* Main Content */}
        <div
          className={`flex-1 bg-gray-200 p-8 transition-all duration-300 ${
            isCollapsed ? "z-10" : "pointer-events-none select-none blur-sm brightness-75 z-0"
          }`}
        >
          <main>
            <Header />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
