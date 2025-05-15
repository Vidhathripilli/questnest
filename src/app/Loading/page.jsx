import React from "react";
import Image from "next/image";
import Loading from "../../assets/icons/Loading/loading.gif";
 
const LoadingPage = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
    
               <Image src={Loading} alt="Loading" width={300} height={300} className="max-w-[90%] max-h-[90%] object-contain border-0 outline-none" />
             </div>
            
  
  );
};
 
export default LoadingPage;