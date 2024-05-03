import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { useSpring, useTrail, animated, config } from "react-spring";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUser } from "./UserContext";

import {
  faTasks,
  faMapMarkerAlt,
  faCalendarAlt,
  faBriefcase,
  faPlus,
  faEdit,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

function TicketItem({ ticket, index, theme, onClick }) {
  const [hoverAnimation, setHoverAnimation] = useSpring(() => ({
    scale: 1,
    config: { tension: 300, friction: 10 }, // Adjust for desired speed
  }));

  const [year, month, day] = ticket.TicketDate.split("-");
  const localDate = new Date(year, month - 1, day); // months are 0-indexed in JavaScript Date
  const { userRole, userID } = useUser();

  const formattedDate = localDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <animated.li
      className={`flex flex-col md:flex-row justify-between items-center p-6 ${
        index % 2 === 0
          ? theme === "dark"
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-800"
          : theme === "dark"
          ? "bg-gray-700 text-white"
          : "bg-gray-100 text-gray-800"
      } rounded-lg m-4 shadow-lg cursor-pointer`}
      style={{
        transform: hoverAnimation.scale.interpolate((s) => `scale(${s})`),
      }}
      onMouseEnter={() => setHoverAnimation({ scale: 1.05 })}
      onMouseLeave={() => setHoverAnimation({ scale: 1 })}
      onClick={onClick}
    >
      <div className="flex-grow mb-4 md:mb-0">
        <h3 className="text-2xl md:text-3xl font-bold mb-2 text-center md:text-left">
          Ticket: {ticket.Ticket}
        </h3>
        <div className="text-gray-500 mt-2 text-lg md:text-xl">
          <div className="flex items-center justify-center md:justify-start">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="mr-2"
              fixedWidth
            />
            <span> {ticket.LeaseName}</span>
          </div>
          <div className="flex items-center justify-center md:justify-start">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" fixedWidth />
            {/* Display the corrected formattedDate */}
            <span> {formattedDate}</span>
          </div>
          <div className="flex items-center justify-center md:justify-start">
            <FontAwesomeIcon icon={faBriefcase} className="mr-2" fixedWidth />
            <span> {ticket.JobDescription}</span>
          </div>

          {userRole !== "P" && (
            <div className="flex items-center justify-center md:justify-start">
              <FontAwesomeIcon icon={faUser} className="mr-2" fixedWidth />
              <span className="font-semibold">
                {" "}
                {ticket.UserID
                  ? ticket.UserID.charAt(0).toUpperCase() +
                    ticket.UserID.slice(1)
                  : "N/A"}
              </span>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="text-lg md:text-xl text-primary-500 hover:text-primary-600 font-semibold py-2 px-4 rounded-lg border border-primary-500 hover:border-primary-600 transition duration-150 ease-in-out"
      >
        View Details →
      </button>
    </animated.li>
  );
}
function HomePage() {
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { userRole, userID } = useUser();
  const [buttonAnimation, setButtonAnimation] = useSpring(() => ({
    scale: 1,
    config: { tension: 300, friction: 10 }, // Adjust for desired responsiveness
  }));

  const pageAnimation = useSpring({
    from: { opacity: 0, scale: 0.95, y: -20 },
    to: { opacity: 1, scale: 1, y: 0 },
    config: config.gentle,
  });

  const dashboardAnimation = useSpring({
    from: { opacity: 0, y: -50 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  });

  const ticketAnimation = useTrail(ticketsPerPage, {
    from: { opacity: 0, y: 50 },
    to: { opacity: 1, y: 0 },
    config: config.stiff,
  });

  const paginationAnimation = useTrail(
    Math.ceil(tickets.length / ticketsPerPage),
    {
      from: { opacity: 0, scale: 0.8 },
      to: { opacity: 1, scale: 1 },
      config: config.stiff,
    }
  );

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        console.log(userRole + "  and " + userID);

        const response = await fetch(
          "https://ogfieldticket.com/api/tickets.php"
        );
        const data = await response.json();
        let filteredTickets = data;

        if (userRole === "P") {
          filteredTickets = data.filter(
            (ticket) => ticket.Billed !== "Y" && ticket.UserID === userID
          );
        }

        setTickets(
          filteredTickets.sort(
            (a, b) => new Date(b.TicketDate) - new Date(a.TicketDate)
          )
        );
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setLoading(false);
      }
    };

    fetchTickets();
  }, [userRole]);

  const handleViewDetailsClick = (ticket) => {
    navigate("/view-field-ticket", { state: ticket });
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div
        className={`min-h-screen ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <div
          className={`fixed top-0 left-0 w-full h-full ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-900 to-gray-800"
              : "bg-gradient-to-br from-gray-100 to-gray-200"
          } opacity-50 z-0`}
        ></div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          {loading ? (
            <div className="flex justify-center items-center h-screen">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <animated.div
              className="flex flex-col justify-start items-center pt-10"
              style={{
                opacity: pageAnimation.opacity,
                transform: pageAnimation.scale.interpolate(
                  (s) => `scale(${s})`
                ),
              }}
            >
              <div
                className={`w-full max-w-4xl mx-auto rounded-xl shadow-2xl overflow-hidden ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-gray-800 to-gray-900"
                    : "bg-gradient-to-r from-white to-gray-100"
                }`}
              >
                <animated.div
                  className={`p-6 text-center relative overflow-hidden shadow-md ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-blue-900 to-indigo-900"
                      : "bg-gradient-to-r from-blue-500 to-indigo-500"
                  }`}
                  style={dashboardAnimation}
                >
                  <h2
                    className={`text-4xl md:text-3xl font-bold mb-6 ${
                      theme === "dark" ? "text-white" : "text-white"
                    }`}
                  >
                    Ticket Dashboard
                  </h2>
                  <div className="h-16"></div> {/* Added empty space */}
                  {/* <div className="text-center my-6 mx-auto w-full max-w-xl px-4">
                    <FontAwesomeIcon
                      icon={faTasks}
                      size="3x"
                      className={`inline-block mb-4 animate-bounce ${
                        theme === "dark" ? "text-blue-200" : "text-blue-100"
                      }`}
                      style={{ transform: "rotate(-10deg)" }}
                    />
                  </div> */}
                  <div className="flex justify-center space-x-4">
                    <Link
                      to="/create-field-ticket"
                      className={`inline-flex items-center justify-center font-bold py-3 px-6 rounded-full shadow-lg transition duration-200 ease-in-out pop-effect ${
                        theme === "dark"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-white hover:bg-gray-100 text-blue-600"
                      }`}
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-2" />
                      Create New Ticket
                    </Link>

                    {userRole !== "P" && (
                      <Link
                        to="/job-form"
                        className={`inline-flex items-center justify-center font-bold py-3 px-6 rounded-full shadow-lg transition duration-200 ease-in-out pop-effect ${
                          theme === "dark"
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-white hover:bg-gray-100 text-green-600"
                        }`}
                      >
                        <FontAwesomeIcon icon={faEdit} className="mr-2" />
                        Edit Jobs
                      </Link>
                    )}
                  </div>
                </animated.div>
                <ul
                  className={`divide-y ${
                    theme === "dark" ? "divide-gray-700" : "divide-gray-300"
                  }`}
                >
                  {ticketAnimation.map((props, index) => {
                    const ticket =
                      tickets[(currentPage - 1) * ticketsPerPage + index];
                    if (!ticket) return null;
                    return (
                      <TicketItem
                        key={ticket.Ticket}
                        ticket={ticket}
                        index={index}
                        theme={theme}
                        onClick={() => handleViewDetailsClick(ticket)}
                      />
                    );
                  })}
                </ul>

                <div className="py-6 flex justify-center items-center">
                  {paginationAnimation.map((props, number) => (
                    <animated.button
                      key={number}
                      onClick={() => paginate(number + 1)}
                      className={`mx-2 px-4 py-2 rounded-full focus:outline-none text-base md:text-sm shadow-md transition duration-150 ease-in-out ${
                        currentPage === number + 1
                          ? theme === "dark"
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : theme === "dark"
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      style={props}
                    >
                      {number + 1}
                    </animated.button>
                  ))}
                </div>
              </div>
            </animated.div>
          )}
        </div>
      </div>

      <style jsx>{`
        .pop-effect:hover {
          transform: scale(1.05);
          transition: transform 0.2s ease-in-out;
        }
      `}</style>
    </>
  );
}

export default HomePage;
