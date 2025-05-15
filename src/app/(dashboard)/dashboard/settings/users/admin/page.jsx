"use client";

import { ApiClientLms, ApiClientUserAccount } from "@/service/ApiUserAccount";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function AdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [transferReason, setTransferReason] = useState('');

  const user = useSelector((state) => state.auth.user);
  const selectedEntity = user?.selectedEntity;
  console.log("user",user);
  console.log("selected ent",selectedEntity);
  
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

    // Open/Close Transfer Ownership Modal
    const openTransferModal = () => setIsTransferModalOpen(true);
    const closeTransferModal = () => setIsTransferModalOpen(false);

    
  const [admins, setAdmins] = useState([
   ]);

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   // Add new admin to the list
  //   const newAdmin = {
  //     name: adminName,
  //     email: adminEmail,
  //     invitation_for:"entity_admin",
  //     entity_id: selectedEntity
  //   };

  //   console.log("admin data",newAdmin);
    
  //   setAdmins([...admins, newAdmin]);
    
  //   // Reset form and close modal
  //   setAdminName('');
  //   setAdminEmail('');
  //   closeModal();
  // };

  const getAdmins = async()=>{
try{
  const response = await ApiClientUserAccount.get(`/roles/entity-admins`,{
    withCredentials: true,
  });
  setAdmins(response.data)
  console.log("response",response.data);

  }catch(error){
    console.log("error",error);
    
  }
  }
  useEffect(()=>{
    getAdmins();
  },[])
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const newAdmin = {
      name: adminName,
      email: adminEmail,
      invitation_for: "entity_admin",
      entity_id: selectedEntity,
    };
  
    try {
      // Send data to the API
      const response = await ApiClientUserAccount.post(
        "/auth/invitation",
        newAdmin,
        {
          headers: {
            "Content-Type": "application/json",
            "X-TENANT-ID": "TNT20250001",
          },
          withCredentials: true, // not inside headers
        }
      );
      
      if(response.status === 201){
        alert("mail send successfully");
      // If API call is successful, update local admins list

        setAdmins([...admins, newAdmin]);
  
      // Reset form and close modal
      setAdminName('');
      setAdminEmail('');
      closeModal();
      }      
      
    } catch (error) {
      console.error("Failed to send admin invitation:", error);
      // Optionally show an error message to the user here
    }
  };
  
    // Handle Transfer Ownership Form Submit
    const handleTransferSubmit = (e) => {
        e.preventDefault();
        // Here you would handle the ownership transfer logic
        console.log('Transfer ownership to:', newOwnerEmail);
        console.log('Reason:', transferReason);
        
        // Reset form and close modal
        setNewOwnerEmail('');
        setTransferReason('');
        closeTransferModal();
      };


  const deleteAdmin = () => {
    if (adminToDelete) {
      setAdmins(admins.filter(admin => admin.id !== adminToDelete.id));
      closeDeleteModal();
    }
  };
  const openDeleteModal = (admin) => {
    setAdminToDelete(admin);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setAdminToDelete(null);
  };


//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Handle form submission logic here
//     console.log("Admin to add:", { name: adminName, email: adminEmail });

//     // Reset form and close modal
//     setAdminName("");
//     setAdminEmail("");
//     closeModal();
//   };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        User's &gt; <span className="text-gray-700 font-semibold">Admin</span>
      </div>

      {/* School Owner Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          School Owner
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold">
              BC
            </div>
            <div>
              <p className="font-semibold text-gray-800">Bharat Chander</p>
              <p className="text-xs text-gray-500">Owner</p>
            </div>
          </div>

          <button className="px-4 py-2 bg-white border border-purple-700 text-purple-700 rounded-md hover:bg-purple-50 text-sm font-medium" onClick={openTransferModal}> 
            Transfer Ownership
          </button>
        </div>
      </div>

      {/* Admins Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Admin's</h2>
          <button
            className="px-4 py-2 bg-[#402BA3] text-white rounded-md hover:bg-purple-800 text-sm font-medium"
            onClick={openModal}
          >
            Add Admin
          </button>
        </div>

        {/* Admin Table */}
        <div className="w-full border rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-purple-100 text-gray-700 text-sm">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                {/* <th className="px-4 py-3">Status</th> */}
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No Admin added yet
                    <div className="mt-4">
                      <button
                        className="px-6 py-2 bg-[#402BA3] text-white rounded-md hover:bg-purple-800 text-sm font-medium"
                        onClick={openModal}
                      >
                        Add Admin
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="border-b">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold mr-2 text-xs">
                        </div>
                        {admin.name ? admin.name : "Not Specified"}
                      </div>
                    </td>
                    <td className="px-4 py-3">{admin.email}</td>
                    {/* <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {admin.status}
                      </span>
                    </td> */}
                    <td className="px-4 py-3">
                        <button 
                            onClick={() => openDeleteModal(admin)}
                            className="text-red-500 hover:text-red-700"
                        >
                            🗑️
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
        
        ">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6
          w-[879px] h-[178px]
          ">
            

            <form onSubmit={handleSubmit}>
              <div className="flex gap-4">
                <div className="mb-4 w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Admin Name"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4 w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Email ID"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)} // assuming this closes the modal
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm font-medium"
              >
                Cancel
              </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#402BA3] text-white rounded-md hover:bg-purple-800 text-sm font-medium"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

{isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-500 text-white rounded-full p-4 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium mb-2">
                Are you sure you want to delete Admin?
              </h3>
              
              <div className="flex space-x-4 mt-6 w-full">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAdmin}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            {/* Header */}
            <div className="flex items-center mb-4">
              <button 
                onClick={closeTransferModal}
                className="mr-3 text-gray-600 hover:text-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h3 className="text-lg font-medium">Ownership Transfer</h3>
                <p className="text-xs text-gray-500">Transferring ownership will give full control of your platform to another user</p>
              </div>
            </div>
            
            {/* Important Notice */}
            <div className="bg-orange-50 border border-orange-100 p-3 rounded-md mb-4">
              <h4 className="text-orange-800 font-medium text-sm">Important Notice</h4>
              <p className="text-xs text-orange-700">
                Transferring ownership gives full control of your platform to another user. This action be undone without the new owner's permission.
              </p>
            </div>
            
            {/* Transfer Settings */}
            <div className="border border-gray-200 rounded-md p-4 mb-4">
              <h4 className="font-medium text-sm mb-1">Transfer Settings</h4>
              <p className="text-xs text-gray-500 mb-3">Configure your ownership transfer request</p>
              
              <form onSubmit={handleTransferSubmit}>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:gap-4">
                    <div className="flex-1 mb-4 md:mb-0">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Owner Email
                      </label>
                      <input
                        type="email"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                        placeholder="email@example.com"
                        value={newOwnerEmail}
                        onChange={(e) => setNewOwnerEmail(e.target.value)}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">The email must be associated with an existing account</p>
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Transfer
                      </label>
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none h-20"
                        placeholder="Explain why you are transferring ownership"
                        value={transferReason}
                        onChange={(e) => setTransferReason(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#402BA3] text-white rounded-md hover:bg-purple-800 text-sm font-medium"
                  >
                    Initiate Transfer
                  </button>
                </div>
              </form>
            </div>
            
            {/* Transfer History */}
            <div className="border border-gray-200 rounded-md p-4">
              <h4 className="font-medium text-sm mb-1">Transfer History</h4>
              <p className="text-xs text-gray-500 mb-3">View past ownership transfer activity</p>
              
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="font-medium text-sm text-gray-700 mb-1">No transfer history found</p>
                <p className="text-xs text-gray-500">Completed transfer history will appear here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
