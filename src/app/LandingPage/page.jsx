// app/layout.js
import Image from "next/image";
import Link from "next/link";

export default function landing_page () {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-gray-300 text-white p-4">
        <div className="mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            {/* Logo or Branding (if needed) */}
            <span className="text-xl font-bold">MyApp</span>
          </Link>

          <div>
            {/* Login Link */}
            <p className="text-center mt-4">
              Already have an account?{" "}
              <Link href="/login_page" className="text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </nav>

      {/* Main content area - grows to push footer down */}
      {/* <main className="flex-grow">{children}</main> */}

      {/* Footer Section - Sticky */}
      <footer className="bg-white text-gray-500 text-sm p-4 flex justify-between items-center w-full sticky bottom-0">
        <div className="flex space-x-4">
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact Us</Link>
          <Link href="/faqs">FAQs</Link>
        </div>

        <p>Website © 2025</p>

        {/* App Store & Google Play Buttons */}
        <div className="flex space-x-4">
          <Image
            src="/app-store.png"
            alt="Available on the App Store"
            width={120}
            height={40}
            // Available of App store
          />
          <Image
            src="/google-play.png"
            alt="Available on Google Play"
            width={120}
            height={40}
          />
        </div>
      </footer>
    </div>
  );
}