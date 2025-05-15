// pages/dashboard/layout.jsx
import SettingsSidebar from "./sidebar/page";
export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      {/* Sidebar */}
        <SettingsSidebar/>
      {/* Main Content Area */}
      <div className="flex-1 p-4">
        {children} {/* Render dynamic page content here */}
      </div>
    </div>
  );
}
