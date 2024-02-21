import React from "react";
import { Link } from "react-router-dom"; // Add this line to import Link

function HomePage() {
  return (
    <main className="flex-grow">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900 p-4 relative overflow-hidden">
        {/* Interactive Background with Subtle Animation */}
        <div className="absolute inset-0 animate-gradient-xy bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-30 mix-blend-soft-light"></div>

        <div className="absolute inset-0 animate-blob blob-1 bg-gradient-to-tr from-purple-400 via-pink-500 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-duration-200s"></div>
        <div className="absolute inset-0 animate-blob blob-2 bg-gradient-to-tl from-teal-400 via-blue-500 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-duration-300s"></div>

        {/* Content Box with Dynamic Shadow and Reflection */}
        <div className="z-20 max-w-4xl w-full space-y-8 text-center bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-3xl shadow-xl shadow-blue-500/50 p-10">
          <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-purple-600">
            Elevate Your Operations
          </h2>
          <p className="text-xl text-gray-600">
            Transform your field operations with our cutting-edge solutions.
            Choose a pathway to begin your journey.
          </p>

          {/* Enhanced Action Buttons with Gradient Borders */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-6 sm:space-y-0 justify-center">
            <button className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300">
              <Link
                to="/create-field-ticket"
                className="flex items-center justify-center px-5 py-2.5 w-full h-full transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0"
              >
                <span className="text-gray-900">Ticket Entry</span>
              </Link>
            </button>
            <button className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-500 to-green-600 group-hover:from-green-600 group-hover:to-green-700 focus:ring-4 focus:outline-none focus:ring-green-300">
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
                Field Tickets
              </span>
            </button>
            <button className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-500 to-red-600 group-hover:from-red-600 group-hover:to-red-700 focus:ring-4 focus:outline-none focus:ring-red-300">
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
                Job Types
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>
        {`
          .animate-gradient-xy {
            animation: gradient-xy 15s ease infinite;
          }
          .animate-blob {
            animation: blob 30s infinite;
          }
          .blob-1 {
            animation-duration: 30s;
          }
          .blob-2 {
            animation-duration: 45s;
            animation-delay: 5s;
          }
          @keyframes gradient-xy {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          @keyframes blob {
            0%, 100% {
              transform: translate(0%, 0%) scale(1);
            }
            33% {
              transform: translate(30%, -50%) scale(1.2);
            }
            66% {
              transform: translate(-20%, 20%) scale(0.8);
            }
          }
        `}
      </style>
    </main>
  );
}

export default HomePage;
