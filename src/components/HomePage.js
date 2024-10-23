import React, {
  useEffect,
  useState,
  useCallback,
  lazy,
  Suspense,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { useUser } from "./UserContext";
import debounce from "lodash.debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const TicketItem = lazy(() => import("./TicketItem"));

const HomePage = React.memo(() => {
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 5;
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { userRole, userID } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [showUnbilled, setShowUnbilled] = useState(true);
  const [highestTicketNumber, setHighestTicketNumber] = useState(null);

  useEffect(() => {
    const extractSubdomain = () => {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      setSubdomain(parts.length > 2 ? parts.shift() : "");
    };

    extractSubdomain();
    const savedShowUnbilled = localStorage.getItem("showUnbilled");
    if (savedShowUnbilled !== null) {
      setShowUnbilled(JSON.parse(savedShowUnbilled));
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  useEffect(() => {
    if (userRole !== "P") {
      navigate("/ticketGrid");
    }
  }, [userRole, navigate]);

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
      setCurrentPage(1);
      return newState;
    });
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      const baseUrl =
        parts.length > 2
          ? `https://${parts.shift()}.ogfieldticket.com`
          : "https://test.ogfieldticket.com";
      let fetchedTickets = [];
      let nextTicketID = null;

      if (navigator.onLine) {
        const response = await fetch(`${baseUrl}/api/tickets.php`);
        const data = await response.json();

        const tickets = data.filter((ticket) => {
          if (ticket.isNextTicketID) {
            nextTicketID = ticket.Ticket;
            return false;
          }
          return true;
        });

        tickets.sort(
          (a, b) =>
            b.Ticket - a.Ticket ||
            new Date(b.TicketDate) - new Date(a.TicketDate)
        );
        const recentTickets = tickets.slice(0, 30); // Reduced initial load
        localStorage.setItem("tickets", JSON.stringify(recentTickets));
        fetchedTickets = recentTickets;
      } else {
        const storedTickets = JSON.parse(localStorage.getItem("tickets")) || [];
        fetchedTickets = storedTickets;
        nextTicketID = (
          Math.max(...fetchedTickets.map((ticket) => Number(ticket.Ticket))) + 1
        ).toString();
      }

      let filteredTickets = fetchedTickets.filter((ticket) => {
        const isUnbilled = ticket.Billed !== "Y";
        const isCurrentUser = ticket.UserID === userID;
        const matchesUserRole = userRole !== "P" || isCurrentUser;
        const matchesBillingStatus =
          userRole === "P"
            ? isUnbilled
            : showUnbilled
            ? isUnbilled
            : !isUnbilled;
        return matchesUserRole && matchesBillingStatus;
      });

      if (searchQuery) {
        const lowercaseQuery = searchQuery.toLowerCase();
        filteredTickets = filteredTickets.filter((ticket) =>
          Object.values(ticket).some((value) =>
            String(value).toLowerCase().includes(lowercaseQuery)
          )
        );
      }

      filteredTickets.sort(
        (a, b) =>
          b.Ticket - a.Ticket || new Date(b.TicketDate) - new Date(a.TicketDate)
      );
      setHighestTicketNumber(nextTicketID.toString());
      setTickets(filteredTickets);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setLoading(false);
    }
  }, [userRole, searchQuery, userID, showUnbilled]);

  useEffect(() => {
    fetchTickets();
    window.scrollTo(0, 0);
    window.addEventListener("online", fetchTickets);
    return () => window.removeEventListener("online", fetchTickets);
  }, [fetchTickets, subdomain, userRole, userID, searchQuery, showUnbilled]);

  const handleViewDetailsClick = useCallback(
    (ticket) => {
      navigate("/view-field-ticket", {
        state: { ticket, highestTicketNumber },
      });
    },
    [navigate, highestTicketNumber]
  );

  const handleCreateNewTicket = useCallback(() => {
    navigate(`/create-field-ticket/${highestTicketNumber}`);
  }, [navigate, highestTicketNumber]);

  const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), []);

  const memoizedTickets = useMemo(() => {
    return tickets.slice(
      (currentPage - 1) * ticketsPerPage,
      currentPage * ticketsPerPage
    );
  }, [tickets, currentPage, ticketsPerPage]);

  return (
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
          <div className="flex flex-col justify-start items-center pt-10">
            <div
              className={`w-full max-w-4xl mx-auto rounded-xl shadow-2xl overflow-hidden ${
                theme === "dark"
                  ? "bg-gradient-to-r from-gray-800 to-gray-900"
                  : "bg-gradient-to-r from-white to-gray-100"
              }`}
            >
              <div
                className={`p-6 text-center relative overflow-hidden shadow-md ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-blue-900 to-indigo-900"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500"
                }`}
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
                      className={`hidden sm:inline-flex items-center justify-center font-bold py-2 px-4 rounded-full shadow-lg transition duration-200 ease-in-out transform hover:scale-105 ${
                        showUnbilled && theme === "dark"
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
                  <div
                    onClick={handleCreateNewTicket}
                    className={`inline-flex items-center justify-center font-bold py-3 px-6 rounded-full shadow-lg transition duration-200 ease-in-out pop-effect ${
                      theme === "dark"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-white hover:bg-gray-100 text-blue-600"
                    }`}
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Create New Ticket
                  </div>
                </div>
              </div>
              <Suspense fallback={<div>Loading...</div>}>
                <ul
                  className={`divide-y ${
                    theme === "dark" ? "divide-gray-700" : "divide-gray-300"
                  }`}
                >
                  {memoizedTickets.map((ticket, index) => (
                    <TicketItem
                      key={ticket.Ticket}
                      ticket={ticket}
                      index={index}
                      theme={theme}
                      onClick={() => handleViewDetailsClick(ticket)}
                      searchQuery={searchQuery}
                    />
                  ))}
                </ul>
              </Suspense>
              <div className="py-6 flex justify-center items-center flex-wrap space-y-2 md:space-y-0">
                {Array.from({
                  length: Math.ceil(tickets.length / ticketsPerPage),
                }).map((_, number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number + 1)}
                    className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center mx-1 md:mx-2 px-2 md:px-4 py-2 rounded-full focus:outline-none text-sm md:text-base shadow-md transition duration-150 ease-in-out ${
                      currentPage === number + 1
                        ? theme === "dark"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-500 text-white"
                        : theme === "dark"
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default HomePage;
