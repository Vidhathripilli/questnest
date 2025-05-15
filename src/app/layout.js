// app/layout.js
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import ClientProvider from "../components/ClientProvider";
import { AuthProvider } from "@/components/AuthProvider";
// import AuthProvider from "../context/AuthContext"; // Import your AuthProvider

export const metadata = {
  title: "MyApp - Welcome",
  description: "Welcome to MyApp, the best place to explore our features and services.",
};

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });
const robotoMono = Roboto_Mono({ variable: "--font-mono", subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoMono.variable} antialiased`}>
        <ClientProvider>
          <AuthProvider> {/* Wrap with AuthProvider */}
            <ClientLayout>{children}</ClientLayout>
          </AuthProvider>
        </ClientProvider>
      </body>
    </html>
  );
}