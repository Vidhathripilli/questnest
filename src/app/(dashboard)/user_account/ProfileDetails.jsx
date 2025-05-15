export default function ProfileDetails() {
    return (
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        {/* Title */}
        <h2 className="text-xl font-bold mb-4">My Profile Details</h2>
  
        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label className="text-sm text-gray-600">First Name</label>
            <input type="text" placeholder="First Name"  className="w-full border border-gray-500  focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none rounded px-3 py-2" />
          </div>
  
          {/* Country */}
          <div>
            <label className="text-sm text-gray-600">Country</label>
            <input type="text" placeholder="Country" className="w-full border  border-gray-500  focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none rounded px-3 py-2" />
          </div>
  
          {/* Last Name */}
          <div>
            <label className="text-sm text-gray-600">Last Name</label>
            <input type="text" placeholder="Last Name" className="w-full border border-gray-500  focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none rounded px-3 py-2" />
          </div>
  
          {/* City */}
          <div>
            <label className="text-sm text-gray-600">City</label>
            <input type="text" placeholder="City" className="w-full border border-gray-500  focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none rounded px-3 py-2" />
          </div>
  
          {/* Email */}
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input type="email" placeholder="Email" className="w-full border border-gray-500  focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none rounded px-3 py-2" />
          </div>
  
          {/* State */}
          <div>
            <label className="text-sm text-gray-600">State</label>
            <input type="text" placeholder="State"  className="w-full border border-gray-500  focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none rounded px-3 py-2" />
          </div>
  
          {/* Phone Number */}
          <div>
            <label className="text-sm text-gray-600">Phone Number</label>
            <input type="text" placeholder="Phone Number" className="w-full border border-gray-500  focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none rounded px-3 py-2" />
          </div>
  
          {/* Zipcode */}
          <div>
            <label className="text-sm text-gray-600">Zipcode</label>
            <input type="text" placeholder="Zipcode" className="w-full border border-gray-500  focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none rounded px-3 py-2" />
          </div>
  
          {/* Address */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Address</label>
            <input type="text" placeholder="Address" className="w-full border border-gray-500  focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none rounded px-3 py-2" />
          </div>
        </div>
  
        {/* Change Password */}
        <p className="text-blue-500 text-sm mt-3 cursor-pointer">Change Password</p>
  
        {/* Update Button */}
        {/* <button className="mt-4 bg-green-500 text-white px-6 py-2 rounded-md">
          Update Information
        </button> */}
  
        {/* Admin Panel Tools */}
        {/* <h3 className="text-lg font-bold mt-6">Admin Panel Tools</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <input type="checkbox" checked className="accent-blue-500" />
            <span>Connected Apps (12)</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" className="accent-blue-500" />
            <span>Payment Methods</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" className="accent-blue-500" />
            <span>Appearance</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" className="accent-blue-500" />
            <span>Security Accets</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" className="accent-blue-500" />
            <span>Configuration Settings</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" className="accent-blue-500" />
            <span>View Mode</span>
          </div>
        </div> */}
      </div>
    );
  }
  