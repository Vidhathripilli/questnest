import Link from 'next/link';
import React from 'react';

export default function standar1() {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center">
                <div className="flex items-center border-2 border-blue-500 p-4 rounded-lg">
                    <span className="text-blue-500 text-lg mr-4">
                        Well done! You’ve successfully registered! Now, let us take you through the next steps.
                    </span>
                    <button className="bg-blue-500 text-white p-2 rounded-full">
                        &rarr;
                    </button>
                </div>
                <Link href='/standar2' legacyBehavior>
                   <a href="" className="mt-4 px-4 py-2 border-2 border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 block hover:text-white">
                   Next &gt;
                   </a>
                    
                </Link>
            </div>
        </div>
    );
}

// Save this file as `RegistrationSuccess.js`, and use it in a Next.js app by placing it in the `pages` directory or importing it as a component. Let me know if you’d like me to guide you through setting up the Next.js app! 🚀