import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function HomePage() {
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(5); // You can adjust the number of tickets per page as needed
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(
          "https://ogfieldticket.com/api/tickets.php"
        );
        let data = await response.json();

        // Assuming TicketDate is in a format that can be directly compared,
        // otherwise, you might need to parse it into a Date object first.
        data = data.sort(
          (a, b) => new Date(b.TicketDate) - new Date(a.TicketDate)
        );

        setTickets(data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
  }, []);

  const handleViewDetailsClick = (ticket) => {
    navigate("/view-field-ticket", { state: ticket });
  };

  // Calculate the currently displayed tickets
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-4 overflow-hidden">
        <div className="absolute inset-0 animate-gradient-xy bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 opacity-20 mix-blend-soft-light"></div>
        <div className="absolute inset-0 animate-blob blob-1 bg-gradient-to-tr from-gray-600 via-gray-700 to-gray-800 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-duration-200s"></div>
        <div className="absolute inset-0 animate-blob blob-2 bg-gradient-to-tl from-gray-500 via-gray-600 to-gray-700 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-duration-300s"></div>

        <motion.div
          className="relative min-h-screen flex flex-col justify-start items-center pt-20"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            visible: {
              opacity: 1,
              scale: 1,
              transition: { delay: 0.3, duration: 0.5 },
            },
          }}
        >
          <div className="w-full max-w-4xl mx-auto bg-opacity-90 rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-6 text-center relative overflow-hidden">
              <motion.h2
                className="text-4xl font-bold text-white"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Ticket Dashboard
              </motion.h2>
              <p className="text-gray-400 mt-2">
                Streamline your workflow with precision
              </p>
              <Link
                to="/create-field-ticket"
                className="mt-4 inline-flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition ease-in-out duration-150"
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
              {currentTickets.map((ticket) => (
                <motion.li
                  key={ticket.Ticket}
                  className="flex justify-between items-center p-4 md:p-6 bg-gray-800 text-white rounded-lg m-2 shadow-lg transform hover:scale-105 transition duration-500 ease-in-out"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold underline decoration-gray-500 decoration-4 underline-offset-8">
                      Ticket: {ticket.Ticket}
                    </h3>
                    <div className="text-gray-400 mt-2 text-lg">
                      <span>Lease ID: {ticket.LeaseID}</span>
                      <span className="ml-4">Well ID: {ticket.WellID}</span>
                    </div>
                    <p className="text-gray-400 mt-1 text-lg">
                      Ticket Date: {ticket.TicketDate}
                    </p>
                    <p className="text-gray-400 mt-1 text-lg">
                      Job Description: {ticket.JobDescription}
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewDetailsClick(ticket)}
                    className="text-lg text-gray-500 hover:text-gray-400 font-semibold py-2 px-4 rounded-lg border border-gray-600 hover:border-gray-500 transition duration-150 ease-in-out"
                    style={{ boxShadow: "0 2px 5px 0 rgba(156,163,175,0.48)" }}
                  >
                    View Details →
                  </button>
                </motion.li>
              ))}
            </ul>
            <div className="py-4 flex justify-center items-center">
              {Array.from(
                Array(Math.ceil(tickets.length / ticketsPerPage)).keys()
              ).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number + 1)}
                  className={`mx-2 px-4 py-2 ${
                    currentPage === number + 1 ? "bg-gray-700" : "bg-gray-600"
                  } text-white rounded hover:bg-gray-700 focus:outline-none`}
                >
                  {number + 1}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

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
