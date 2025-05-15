// src/pages/school-settings.js
"use client";
import { useState,useEffect } from 'react';
import Head from 'next/head';
import { useSelector } from "react-redux";
import { ApiClientLms } from '@/service/ApiUserAccount';

// Dummy data to populate the UI
const initialSchoolData = {
  schoolStatus: true,
  schoolName: 'ABV School',
  headline: 'Empowering minds, shaping futures',
  description: 'Cambridge Academy is dedicated to providing exceptional education through innovative teaching methods and a supportive learning environment. Our mission is to inspire students to reach their full potential and become lifelong learners.',
  videoIntroduction: 'introduction-video.MP4',
  schoolWebsite: 'ABV-School.com',
  socialMedia: {
    facebook: 'ABV.School.com',
    instagram: 'ABV.School.com',
    twitter: 'Twitter',
    linkedin: 'ABV.School/LinkedIn.url'
  },
  schoolIcon: null
};

export default function SchoolSettings() {

  const [schoolData, setSchoolData] = useState(initialSchoolData);
  const [showSection1SaveButton, setShowSection1SaveButton] = useState(false);
  const [showSection2SaveButton, setShowSection2SaveButton] = useState(false);

  const user = useSelector((state) => state.auth.user);
  console.log("user from my account",user);
  const authState = useSelector((state) => state.auth.user) || {};
  // console.log(authState.selectedEntityRole);
  
const [entityUser , setEntityUser] = useState(false)
const [isUser, setUser] = useState(authState.selectedEntityRole === "entity_user");
// console.log("is User",isUser);

const entity_Id = user?.selectedEntity;
console.log("entity id from edit school",entity_Id);

const selectedEntityRole = user?.selectedEntityRole;
// console.log("selected ent role edit school",selectedEntityRole);

const isAdminOrOwner = ["entity_owner", "entity_admin"].includes(selectedEntityRole);
// console.log('entity role',selectedEntityRole)
// Check if user is entity owner - used for conditional rendering
const isEntityOwner = authState.selectedEntityRole === "entity_owner";


// const isEntityOwner = false

useEffect(() => {
  if (selectedEntityRole === 'entity_user') {
    setEntityUser(true);
  }
}, [selectedEntityRole]); // Only re-run when selectedEntityRole changes

const getSchoolData = async()=>{
  try{  
    const response = await ApiClientLms.get(`schools/school-details-by-entity-id/${entity_Id}`,

      {
        withCredentials: true,
      }
    );
    setSchoolData(response.data.data)
    console.log("response school data from edit school",response);
    

  }catch(error){
    console.log("error",error);
    
  }
}

useEffect(()=>{
  getSchoolData();
},[entity_Id])
  // Handler functions for form inputs
  const handleToggleStatus = () => {
    setSchoolData({...schoolData, schoolStatus: !schoolData.schoolStatus});
    setShowSection1SaveButton(true);
  };

  const handleInputChange = (field, value) => {
    setSchoolData({...schoolData, [field]: value});
    setShowSection1SaveButton(true);
  };

  const handleSocialMediaChange = (platform, value) => {
    setSchoolData({
      ...schoolData,
      socialMedia: {
        ...schoolData.socialMedia,
        [platform]: value
      }
    });
    setShowSection2SaveButton(true);
  };

  const handleDescriptionChange = (e) => {
    setSchoolData({...schoolData, description: e.target.value});
    setShowSection1SaveButton(true);
  };

  // Mock save functions
  const handleSaveSection1 = () => {
    console.log('Saving Section 1 data:', schoolData);
    setShowSection1SaveButton(false);
    // Here you would make an API call to save the data
  };

  const handleSaveSection2 = () => {
    console.log('Saving Section 2 data:', schoolData);
    setShowSection2SaveButton(false);
    // Here you would make an API call to save the data
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Head>
        <title>School Settings</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </Head>

      {/* Breadcrumb Navigation */}
      <div className="px-4 py-3 text-sm bg-white border-b border-gray-200">
        <div className="container mx-auto flex items-center text-gray-500">
          <span>My School</span>
          <span className="mx-2">›</span>
          <span className="font-medium">Edit School</span>
          <span className="text-xs text-gray-400 ml-1">(School Settings Page)</span>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {/* Status Section */}
        {/* <section className="mb-4">
          <h2 className="text-lg font-medium mb-3">Status</h2>
          <div className="bg-white rounded shadow p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">School Status</h3>
                <p className="text-sm text-gray-500">When inactive, your school will not be visible to students</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={schoolData.schoolStatus}
                  onChange={handleToggleStatus}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>
        </section> */}

        {/* School Identity Section */}
        <section className="mb-4">
          <h2 className="text-lg font-medium mb-3">School Identity</h2>
          <div className="bg-white rounded shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">School Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={schoolData.name}
                  onChange={(e) => handleInputChange('schoolName', e.target.value)}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Headline</label>
                <div className="relative">
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 pr-10"
                    value={schoolData.headline}
                    onChange={(e) => handleInputChange('headline', e.target.value)}
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <div className="relative">
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 h-24"
                  value={schoolData.description}
                  onChange={handleDescriptionChange}
                ></textarea>
                <button className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            {showSection1SaveButton && (
              <div className="flex justify-end">
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={handleSaveSection1}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </section>

        {/* School Branding Info Section */}
        <section className="mb-4">
          <h2 className="text-lg font-medium mb-3">School Branding Info</h2>
          <div className="bg-white rounded shadow p-4">
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">School Icon</label>
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <i className="fas fa-user text-gray-500 text-2xl"></i>
                  </div>
                  <button className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100">
                    Upload Icon
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Recommended: 250 x 250 px</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Video Introduction</label>
                <div className="relative">
                  <div className="flex items-center">
                    <div className="bg-gray-100 rounded p-2 flex items-center justify-between w-full mr-2">
                      <span className="flex items-center">
                        <i className="fas fa-play-circle mr-2 text-gray-600"></i>
                        <span className="text-sm">{schoolData.videoIntroduction}</span>
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    <button className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 whitespace-nowrap">
                      Upload Icon
                    </button>
                  </div>
                </div>
              </div>
            </div> */}
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">School Website</label>
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 pr-10"
                  value={schoolData.schoolWebsite}
                  onChange={(e) => handleInputChange('schoolWebsite', e.target.value)}
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            {/* <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Social Media URL</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1">Facebook</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 pr-10"
                      value={schoolData.socialMedia.facebook}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                    />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1">Instagram</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 pr-10"
                      value={schoolData.socialMedia.instagram}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                    />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1">Twitter</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 pr-10"
                      value={schoolData.socialMedia.twitter}
                      onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                    />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1">LinkedIn</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 pr-10"
                      value={schoolData.socialMedia.linkedin}
                      onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                    />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div> */}

            {showSection2SaveButton && (
              <div className="flex justify-end">
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={handleSaveSection2}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Danger Zone Section */}
        
        <section
  className={selectedEntityRole === "entity_owner" ? "" : "invisible"}
>
  <h2 className="text-lg font-medium text-red-500 mb-3">Danger Zone</h2>
  <div className="bg-white rounded shadow p-4 border border-red-200">
    <div className="flex flex-col md:flex-row items-center md:justify-between p-2 bg-red-50 rounded">
      <div>
        <h3 className="font-medium text-red-500">Delete School</h3>
        <p className="text-sm text-gray-500">
          Delete all your school information and data
        </p>
      </div>
      <div className="flex items-center space-x-3 mt-3 md:mt-0">
        <button className="border border-red-600 text-red-600 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition">
          Delete
        </button>
      </div>
    </div>
  </div>
</section>

      </div>
    </div>
  );
}