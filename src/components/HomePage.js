import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { useSpring, useTrail, animated, config } from "react-spring";
import { useUser } from "./UserContext";
import { debounce } from "lodash";
import TicketItem from "./TicketItem"; // Import the memoized component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

function HomePage() {
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { userRole, userID } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [showUnbilled, setShowUnbilled] = useState(false);

  const [buttonAnimation, setButtonAnimation] = useSpring(() => ({
    scale: 1,
    config: { tension: 300, friction: 10 },
  }));

  useEffect(() => {
    const extractSubdomain = () => {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        console.log(`sub domain ${subdomainPart}`);
        setSubdomain(subdomainPart);
      } else {
        console.log(`sub domain ${parts}`);
        setSubdomain("");
      }
    };

    extractSubdomain();

    const savedShowUnbilled = localStorage.getItem("showUnbilled");
    if (savedShowUnbilled !== null) {
      setShowUnbilled(JSON.parse(savedShowUnbilled));
    }
  }, []);

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

  const debouncedSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  const handleSearchChange = useCallback(
    (event) => {
      debouncedSearch(event.target.value);
    },
    [debouncedSearch]
  );

  const handleToggle = useCallback(() => {
    setShowUnbilled((prevState) => {
      const newState = !prevState;
      localStorage.setItem("showUnbilled", JSON.stringify(newState));
      return newState;
    });
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      console.log(userRole + "  and " + userID);

      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let baseUrl;

      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        baseUrl = `https://${subdomainPart}.ogpumper.net`;
        console.log(`Using subdomain URL: ${baseUrl}`);
      } else {
        baseUrl = "https://ogfieldticket.com";
        console.log(`Using default URL: ${baseUrl}`);
      }

      const response = await fetch(`${baseUrl}/api/tickets.php`);
      const data = await response.json();
      let filteredTickets = data;

      if (userRole === "P") {
        filteredTickets = data.filter(
          (ticket) => ticket.Billed !== "Y" && ticket.UserID === userID
        );
      }

      filteredTickets = filteredTickets.filter(
        (ticket) =>
          (userRole !== "P" || ticket.Billed !== "Y") &&
          (!showUnbilled || ticket.Billed !== "Y") &&
          (userRole !== "P" || ticket.UserID === userID)
      );

      if (searchQuery) {
        const lowercaseQuery = searchQuery.toLowerCase();
        filteredTickets = filteredTickets.filter((ticket) =>
          Object.values(ticket).some((value) =>
            String(value).toLowerCase().includes(lowercaseQuery)
          )
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
  }, [userRole, searchQuery, subdomain, userID, showUnbilled]);

  useEffect(() => {
    fetchTickets();
    window.scrollTo(0, 0);
  }, [fetchTickets, subdomain, userRole, userID, searchQuery, showUnbilled]);

  const handleViewDetailsClick = useCallback(
    (ticket) => {
      navigate("/view-field-ticket", { state: ticket });
    },
    [navigate]
  );

  const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), []);

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
                transform: pageAnimation.scale.to((s) => `scale(${s})`),
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

                  {userRole !== "P" && (
                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                      <button
                        onClick={handleToggle}
                        className={`inline-flex items-center justify-center font-bold py-2 px-4 rounded-full shadow-lg transition duration-200 ease-in-out transform hover:scale-105 ${
                          showUnbilled && theme == "dark"
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : showUnbilled && theme !== "dark"
                            ? "bg-white hover:bg-gray-100 text-blue-600"
                            : theme === "dark"
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-white hover:bg-gray-100 text-blue-600"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={showUnbilled ? faEye : faEyeSlash}
                          className="mr-2"
                        />
                        {showUnbilled ? "Unbilled" : "Billed"}
                      </button>
                    </div>
                  )}

                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder="Search by ticket fields eg. 05-06, circulate, etc"
                      onChange={handleSearchChange}
                      className={`w-full max-w-lg px-4 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                        theme === "dark"
                          ? "bg-gray-800 text-white placeholder-gray-400"
                          : "bg-white text-gray-800 placeholder-gray-500"
                      }`}
                    />
                  </div>
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
                        searchQuery={searchQuery}
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
