"use client";
 
import React, { useState,useEffect } from "react";
import { useSelector } from "react-redux";
 
const Settings = () => {

    const user = useSelector((state) => state.auth.user);
    console.log("user from my account",user);
    const authState = useSelector((state) => state.auth.user) || {};
    console.log(authState.selectedEntityRole);
    
  const [entityUser , setEntityUser] = useState(false)
  const [isUser, setUser] = useState(authState.selectedEntityRole === "entity_user");
  console.log("is User",isUser);
  
  const entity_Id = user?.selectedEntity;
  const selectedEntityRole = user?.selectedEntityRole;
  const isAdminOrOwner = ["entity_owner", "entity_admin"].includes(selectedEntityRole);
  console.log('ssssssssssssssssssssssssssssssss',selectedEntityRole)
  // Check if user is entity owner - used for conditional rendering
  const isEntityOwner = authState.selectedEntityRole === "entity_owner";
 
  // const isEntityOwner = false
 
  useEffect(() => {
    if (selectedEntityRole === 'entity_user') {
      setEntityUser(true);
    }
  }, [selectedEntityRole]); // Only re-run when selectedEntityRole changes
 
  // States for General Settings
  const [generalSettings, setGeneralSettings] = useState({
    name: "Nani",
    email: "nanihari@gmail.com",
    phone: "+91 987346321",
    secondaryEmail: "nani@gmail.com",
  });
 
  // States for Responsible Person
  const [responsiblePerson, setResponsiblePerson] = useState({
    name: "Vinodkumar",
    email: "Vinodkumar@gmail.com",
    role: "Admin",
    phone: "+91 9854957856",
  });
 
  // State for Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
 
  // General Settings Change
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
 
  // Responsible Person Change
  const handleResponsibleChange = (e) => {
    const { name, value } = e.target;
    setResponsiblePerson((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
 
  // Password Change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
 
  // Save General Settings
  const saveGeneralSettings = () => {
    console.log("General Settings Saved:", generalSettings);
    alert("General settings updated!");
  };
 
  // Save Responsible Person
  const saveResponsiblePerson = () => {
    console.log("Responsible Person Saved:", responsiblePerson);
    alert("Responsible person updated!");
  };
 
  // Save Password
  const savePasswordData = () => {
    console.log("Password Data:", passwordData);
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      alert("New passwords do not match!");
      return;
    }
    alert("Password updated successfully!");
  };
 
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 p-8">
 
        {/* General Settings */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-4">My Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input
                name="name"
                value={generalSettings.name}
                onChange={handleGeneralChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                name="email"
                value={generalSettings.email}
                onChange={handleGeneralChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
              <input
                name="phone"
                value={generalSettings.phone}
                onChange={handleGeneralChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Secondary Email</label>
            <input
              name="secondaryEmail"
              value={generalSettings.secondaryEmail}
              onChange={handleGeneralChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <button
            onClick={saveGeneralSettings}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Save Changes
          </button>
        </div>
 
        {/* Responsible Person */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-2 border-blue-300">
          <h3 className="text-lg font-semibold mb-4">Responsible Person</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input
                name="name"
                value={responsiblePerson.name}
                onChange={handleResponsibleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                name="email"
                value={responsiblePerson.email}
                onChange={handleResponsibleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Role</label>
              <input
                name="role"
                value={responsiblePerson.role}
                onChange={handleResponsibleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
              <input
                name="phone"
                value={responsiblePerson.phone}
                onChange={handleResponsibleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
          <button
            onClick={saveResponsiblePerson}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Save Changes
          </button>
        </div>
 
        {/* Change Password */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full border p-2 rounded"
                placeholder="Current Password"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full border p-2 rounded"
                placeholder="New Password"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
              <input
                type="password"
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                className="w-full border p-2 rounded"
                placeholder="Confirm New Password"
              />
            </div>
          </div>
          <button
            onClick={savePasswordData}
            className="mt-6 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Save Changes
          </button>
        </div>
 
      </div>
    </div>
  );
};
 
export default Settings;
 