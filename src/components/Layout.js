// components/Layout.js
import React from "react";
import Footer from "./Footer"; // Import the Footer component

function Layout({ children }) {
  return (
    <div>
      <nav
        className="p-4 shadow-lg"
        style={{ background: "linear-gradient(to right, #6a11cb, #2575fc)" }}
      >
        <div className="container mx-auto flex justify-between items-center">
          {/* Company Name with Enhanced Typography */}
          <div className="text-xl font-bold text-white">
            <a
              href="#home"
              className="hover:text-blue-200 transition duration-300 ease-in-out"
            >
              CompanyName
            </a>
          </div>

          {/* Navigation Tabs with Improved Text Styling */}
          <div className="flex space-x-3">
            <a
              href="#whats-new"
              className="py-2 px-4 text-sm text-white font-semibold rounded hover:bg-blue-800 transition duration-300 ease-in-out"
            >
              What's New?
            </a>
            <a
              href="#home"
              className="py-2 px-4 text-sm text-white font-semibold rounded hover:bg-blue-800 transition duration-300 ease-in-out"
            >
              Home
            </a>
            <a
              href="#current-production"
              className="py-2 px-4 text-sm text-white font-semibold rounded hover:bg-blue-800 transition duration-300 ease-in-out"
            >
              Current Production
            </a>
            <a
              href="#inventory"
              className="py-2 px-4 text-sm text-white font-semibold rounded hover:bg-blue-800 transition duration-300 ease-in-out"
            >
              Inventory
            </a>
            <a
              href="#reports"
              className="py-2 px-4 text-sm text-white font-semibold rounded hover:bg-blue-800 transition duration-300 ease-in-out"
            >
              Reports
            </a>
            <a
              href="#charts"
              className="py-2 px-4 text-sm text-white font-semibold rounded hover:bg-blue-800 transition duration-300 ease-in-out"
            >
              Charts
            </a>
            <a
              href="#current-loads"
              className="py-2 px-4 text-sm text-white font-semibold rounded hover:bg-blue-800 transition duration-300 ease-in-out"
            >
              Current Loads
            </a>
            <a
              href="#gauge-entry"
              className="py-2 px-4 text-sm text-white font-semibold rounded hover:bg-blue-800 transition duration-300 ease-in-out"
            >
              Gauge Entry
            </a>
            <a
              href="#admin"
              className="py-2 px-4 text-sm text-white font-semibold rounded hover:bg-blue-800 transition duration-300 ease-in-out"
            >
              Admin
            </a>
            <a
              href="#logout"
              className="py-2 px-4 text-sm text-white font-semibold rounded hover:bg-blue-800 transition duration-300 ease-in-out"
            >
              Logout
            </a>
          </div>
        </div>
      </nav>
      <main className="flex-grow">{children}</main>
      <Footer /> {/* Include the Footer component */}
    </div>
  );
}

export default Layout;
