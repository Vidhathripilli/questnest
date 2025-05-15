"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Users } from "lucide-react";
import { useSelector } from "react-redux";

const menuItems = [
  { name: "My Account", icon: <Settings size={20} /> },
  { name: "Organisation Info", icon: <Settings size={20} /> },
  {
    name: "User's",
    icon: <Users size={20} />,
    subItems: ["Admin", "Coaches", "Student's"],
  },
  {
    name: "Payments & Management's",
    icon: <Settings size={20} />,
    subItems: ["current_plan", "payment_method", "billing_history"],
  },
];

export default function SettingsSidebar() {
  const [activeItem, setActiveItem] = useState("");
  const [openSubMenu, setOpenSubMenu] = useState("");
  const [entityUser, setEntityUser] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const user = useSelector((state) => state.auth?.user) || {};
  const selectedEntityRole = user?.selectedEntityRole;

  useEffect(() => {
    if (selectedEntityRole === "entity_admin") {
      setIsAdmin(true);
    }
  }, [selectedEntityRole]);

  useEffect(() => {
    if (selectedEntityRole === "entity_user") {
      setEntityUser(true);
    }
  }, [selectedEntityRole]);

  const handleItemClick = (item) => {
    if (item.subItems) {
      setOpenSubMenu(openSubMenu === item.name ? "" : item.name);
      setActiveItem(item.name);
    } else {
      setActiveItem(item.name);
      setOpenSubMenu("");
      navigateToPage(item.name);
    }
  };

  const handleSubItemClick = (subItem, parentItem) => {
    setActiveItem(subItem);
    setOpenSubMenu(parentItem);
    navigateToSubItemPage(subItem);
  };

  const navigateToPage = (itemName) => {
    switch (itemName) {
      case "My Account":
        router.push("/dashboard/settings/my_account");
        break;
      case "Organisation Info":
        router.push("/dashboard/settings/organisation");
        break;
      case "Payments & Management's":
        router.push("/dashboard/settings/payments");
        break;
      default:
        router.push("/dashboard/settings");
        break;
    }
  };

  const navigateToSubItemPage = (subItemName) => {
    switch (subItemName) {
      case "Admin":
        router.push("/dashboard/settings/users/admin");
        break;
      case "Coaches":
        router.push("/dashboard/settings/users/coaches");
        break;
      case "Student's":
        router.push("/dashboard/settings/users/students");
        break;
      case "current_plan":
        router.push("/dashboard/settings/payments/current_plan");
        break;
      case "payment_method":
        router.push("/dashboard/settings/payments/payment_method");
        break;
      case "billing_history":
        router.push("/dashboard/settings/payments/billing_history");
        break;
      default:
        router.push("/dashboard/settings");
        break;
    }
  };

  const isParentActive = (item) => {
    if (item.subItems) {
      return activeItem === item.name || item.subItems.includes(activeItem);
    }
    return activeItem === item.name;
  };
  
  // Determine which items to display based on user role
  const displayMenuItems = () => {
    if (entityUser) {
      // Entity user only sees "My Account"
      return menuItems.filter((item) => item.name === "My Account");
    } else {
      // All other users see the full menu with potential modifications
      return menuItems.map(item => {
        // For the "User's" menu, we might need to filter its subItems
        if (item.name === "User's" && isAdmin) {
          // Clone the item and filter out "Admin" from subItems
          return {
            ...item,
            subItems: item.subItems.filter(subItem => subItem !== "Admin")
          };
        }
        return item;
      });
    }
  };

  return (
    <div className="w-60 bg-white border rounded-md h-screen p-4">
      <h2 className="text-lg font-bold text-[#402BA3] mb-4">Settings</h2>
      <ul className="space-y-2">
        {displayMenuItems().map((item, index) => (
          <li key={index}>
            <button
              onClick={() => handleItemClick(item)}
              className={`flex items-center w-full px-3 py-2 text-left rounded-md
                ${
                  isParentActive(item)
                    ? "bg-[#402BA3] text-white"
                    : "text-gray-700"
                }
              `}
            >
              {item.icon && <span className="mr-3">{item.icon}</span>}
              <span>{item.name}</span>
            </button>
            {item.subItems && openSubMenu === item.name && (
              <ul className="pl-8 mt-2 space-y-1">
                {item.subItems.map((subItem, subIndex) => (
                  <li key={subIndex}>
                    <button
                      onClick={() => handleSubItemClick(subItem, item.name)}
                      className={`flex items-center w-full px-3 py-2 text-left rounded-md
                        ${
                          activeItem === subItem
                            ? "bg-[#402BA3] text-white"
                            : "text-gray-700 hover:bg-purple-100"
                        }
                      `}
                    >
                      {subItem}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}