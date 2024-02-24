import React from "react";
import { Link } from "react-router-dom"; // Add this line to import Link
import { motion } from "framer-motion";
import { useTickets } from "./TicketsContext"; // Adjust the path as needed

function HomePage() {
  const { tickets } = useTickets();

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.3, duration: 0.5 },
    },
  };

  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 p-4 overflow-hidden">
        {/* Interactive Background with Subtle Animation */}
        <div className="absolute inset-0 animate-gradient-xy bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-30 mix-blend-soft-light"></div>
        <div className="absolute inset-0 animate-blob blob-1 bg-gradient-to-tr from-purple-400 via-pink-500 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-duration-200s"></div>
        <div className="absolute inset-0 animate-blob blob-2 bg-gradient-to-tl from-teal-400 via-blue-500 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-duration-300s"></div>

        <motion.div
          className="relative min-h-screen flex flex-col justify-start items-center pt-20"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="w-full max-w-4xl mx-auto bg-opacity-90 rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-purple-800 p-6 text-center relative overflow-hidden">
              <motion.h2
                className="text-4xl font-bold text-white"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Ticket Dashboard
              </motion.h2>
              <p className="text-blue-300 mt-2">
                Streamline your workflow with precision
              </p>
              <Link
                to="/create-field-ticket"
                className="mt-4 inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition ease-in-out duration-150"
              >
                <svg
                  className="w-6 h-6 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create Ticket
              </Link>
            </div>
            <ul className="divide-y divide-gray-300">
              {tickets.map((ticket, index) => (
                <motion.li
                  key={ticket.id}
                  className={`flex justify-between items-center p-4 md:p-6 ${
                    index % 2 === 0 ? "bg-gray-800" : "bg-gray-700"
                  } text-white rounded-lg m-2 shadow-lg transform hover:scale-105 transition duration-500 ease-in-out`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold underline decoration-pink-500 decoration-4 underline-offset-8">
                      Ticket ID: {ticket.id}
                    </h3>
                    {/* Uncomment below for a brief description if needed */}
                    {/* <p className="text-gray-400 mt-2 text-lg">Description or summary here</p> */}
                  </div>
                  <Link
                    to={{
                      pathname: "/field-ticket-entry",
                      state: { ...ticket }, // Passing the entire ticket object as navigation state
                    }}
                    className="text-lg text-pink-400 hover:text-pink-300 font-semibold py-2 px-4 rounded-lg border border-pink-500 hover:border-pink-400 transition duration-150 ease-in-out"
                    style={{ boxShadow: "0 2px 5px 0 rgba(233,30,99,0.48)" }}
                  >
                    View Details →
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
        }
        .animate-blob {
          animation: blob 30s infinite;
        }
        .blob-1,
        .blob-2 {
          animation-name: blob;
        }
        .blob-1 {
          animation-duration: 30s;
        }
        .blob-2 {
          animation-duration: 45s;
          animation-delay: 5s;
        }
        @keyframes gradient-xy {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes blob {
          0%,
          100% {
            transform: translate(0%, 0%) scale(1);
          }
          33% {
            transform: translate(30%, -50%) scale(1.2);
          }
          66% {
            transform: translate(-20%, 20%) scale(0.8);
          }
        }
      `}</style>
    </>
  );
}

export default HomePage;
