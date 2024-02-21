import React from "react";
import Footer from "./Footer"; // Import the Footer component

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Premium Gradient Navbar */}
      <nav className="relative p-4 shadow-md bg-gradient-to-r from-blue-800 to-gray-900 overflow-hidden">
        {/* Animated Gradient Background on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 opacity-0 hover:opacity-100 transition-opacity duration-1000 ease-in-out"></div>

        <div className="container mx-auto flex justify-between items-center relative">
          {/* Company Name with Enhanced Typography */}
          <a
            href="/home"
            className="z-10 text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-blue-200 to-white hover:from-blue-300 hover:to-teal-100 transition-colors duration-300 ease-in-out"
          >
            ogPumperDemo
          </a>

          {/* Navigation Tabs with 3D Effects and Hover Animations */}
          <div className="flex space-x-3 z-10">
            <a
              href="#home"
              className="py-2 px-4 text-sm font-bold text-white rounded bg-black/30 backdrop-blur-sm hover:bg-white/20 transition-all duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110"
            >
              Home
            </a>

            <a
              href="#admin"
              className="py-2 px-4 text-sm font-bold text-white rounded bg-black/30 backdrop-blur-sm hover:bg-white/20 transition-all duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110"
            >
              Admin
            </a>

            <a
              href="#logout"
              className="py-2 px-4 text-sm font-bold text-white rounded bg-black/30 backdrop-blur-sm hover:bg-white/20 transition-all duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110"
            >
              Logout
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Layout;
