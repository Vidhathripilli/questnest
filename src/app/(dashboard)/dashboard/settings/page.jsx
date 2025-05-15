// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation'; // Import the router
// import { Settings, Users } from 'lucide-react'; // using icons

// const menuItems = [
//   { name: 'My Account', icon: <Settings size={20} /> },
//   { name: 'Organisation Info', icon: <Settings size={20} /> },
//   { 
//     name: "User's", 
//     icon: <Users size={20} />, 
//     subItems: ["Admin", "Couch's", "Student's"]
//   },
//   { name: "Payments & Management's", icon: <Settings size={20} /> },
// ];

// export default function SettingsSidebar() {
//   const [activeItem, setActiveItem] = useState('');
//   const [openSubMenu, setOpenSubMenu] = useState('');
//   const router = useRouter(); // Initialize the useRouter hook

//   const handleItemClick = (item) => {
//     if (item.subItems) {
//       setOpenSubMenu(openSubMenu === item.name ? '' : item.name);
//       setActiveItem(item.name);
//     } else {
//       setActiveItem(item.name);
//       setOpenSubMenu('');
//       navigateToPage(item.name); // Navigate directly to the page
//     }
//   };

//   const handleSubItemClick = (subItem, parentItem) => {
//     setActiveItem(subItem);
//     setOpenSubMenu(parentItem);
//     navigateToSubItemPage(subItem); // Navigate to the respective subitem page
//   };

//   const navigateToPage = (itemName) => {
//     switch (itemName) {
//       case 'My Account':
//         router.push('/dashboard/settings/user_account');
//         break;
//       case 'Organisation Info':
//         router.push('/dashboard/settings/create_school');
//         break;
//       case "Payments & Management's":
//         router.push('/dashboard/settings/watch');
//         break;
//       default:
//         router.push('/dashboard/settings');
//         break;
//     }
//   };

//   const navigateToSubItemPage = (subItemName) => {
//     switch (subItemName) {
//       case 'Admin':
//         router.push('/dashboard/settings/users/admin');
//         break;
//       case "Couch's":
//         router.push('/dashboard/settings/users/coaches');
//         break;
//       case "Student's":
//         router.push('/dashboard/settings/students');
//         break;
//       default:
//         router.push('/dashboard/settings');
//         break;
//     }
//   };

//   const isParentActive = (item) => {
//     if (item.subItems) {
//       return activeItem === item.name || item.subItems.includes(activeItem);
//     }
//     return activeItem === item.name;
//   };

//   return (
//     <div className="w-60 bg-white border rounded-md p-4">
//       <h2 className="text-lg font-bold text-[#402BA3] mb-4">Settings</h2>
//       <ul className="space-y-2">
//         {menuItems.map((item, index) => (
//           <li key={index}>
//             <button
//               onClick={() => handleItemClick(item)}
//               className={`flex items-center w-full px-3 py-2 text-left rounded-md
//                 ${isParentActive(item) ? 'bg-[#402BA3] text-white' : 'text-gray-700'}
//               `}
//             >
//               {item.icon && <span className="mr-3">{item.icon}</span>}
//               <span>{item.name}</span>
//             </button>
//             {item.subItems && openSubMenu === item.name && (
//               <ul className="pl-8 mt-2 space-y-1">
//                 {item.subItems.map((subItem, subIndex) => (
//                   <li key={subIndex}>
//                     <button
//                       onClick={() => handleSubItemClick(subItem, item.name)}
//                       className={`flex items-center w-full px-3 py-2 text-left rounded-md
//                         ${activeItem === subItem 
//                           ? 'bg-[#402BA3] text-white' 
//                           : 'text-gray-700 hover:bg-purple-100'}
//                       `}
//                     >
//                       {subItem}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }


import React from 'react'
import SettingsSidebar from './sidebar/page'

const page = () => {
  return (
    <div>

        <></>
    </div>
  )
}

export default page