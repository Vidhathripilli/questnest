import React from "react";

const MyAccount = () => {
  return (
    <div>
      <div className=" w-full h-14 mt-3  bg-white rounded-sm flex items-center justify-between">
        <h3 className=" font-bold text-xl ml-3">My Account</h3>
        <div className="flex items-center gap-2 mr-2">
          <span className="font-bold text-sm">Alert:</span>
          <div className="bg-blue-100 text-red-600 text-xs px-3 py-1 rounded border border-red-300">
            Your last invoice for Feb is unpaid.
            <br />
            Please resolve payment issue immediately.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
