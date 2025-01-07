import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "ogcommon";
import { useUser } from "ogcommon";
import { AgGridReact } from "ag-grid-react";
import debounce from "lodash.debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faSearch,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const TicketGrid = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highestTicketNumber, setHighestTicketNumber] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnbilled, setShowUnbilled] = useState(true);

  const navigate = useNavigate();
  const { theme } = useTheme();
  const { userRole, userID } = useUser();

  const gridRef = useRef();

  const handleViewDetailsClick = useCallback(
    (ticket) => {
      navigate("/view-field-ticket", {
        state: { ticket, highestTicketNumber },
      });
    },
    [navigate, highestTicketNumber]
  );

  const columnDefs = useMemo(
    () => [
      {
        headerName: "Ticket",
        field: "Ticket",
        sortable: true,
        sort: "desc", // Set the default sort order to descending
        filter: true,
        width: 100,
        cellStyle: { textAlign: "center" },
      },
      {
        headerName: "Date",
        field: "TicketDate",
        sortable: true,
        filter: "agDateColumnFilter",
        width: 120,
        valueFormatter: (params) =>
          params.value
            ? new Date(params.value + "T00:00:00").toLocaleDateString()
            : "",
        filterParams: {
          comparator: function (filterLocalDateAtMidnight, cellValue) {
            const cellDate = new Date(cellValue + "T00:00:00"); // Ensure consistent time for filtering
            if (cellDate < filterLocalDateAtMidnight) {
              return -1;
            } else if (cellDate > filterLocalDateAtMidnight) {
              return 1;
            } else {
              return 0;
            }
          },
        },
      },

      {
        headerName: "Lease/Well",
        field: "LeaseWell",
        sortable: true,
        filter: true,
        width: 200,
      },
      {
        headerName: "Type",
        field: "JobDescription",
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        headerName: "User",
        field: "UserID",
        sortable: true,
        filter: true,
        width: 100,
      },
      {
        headerName: "Total $",
        field: "TotalAmount",
        sortable: true,
        filter: true,
        width: 120,
        valueFormatter: (params) =>
          params.value ? `$${parseFloat(params.value).toFixed(2)}` : "$0.00",
        cellStyle: { textAlign: "right" },
      },
      {
        headerName: "Billed",
        field: "Billed",
        sortable: true,
        filter: true,
        width: 100,
        cellRenderer: (params) => (params.value === "Y" ? "Yes" : "No"),
        cellStyle: { textAlign: "center" },
      },
      {
        headerName: "Details",
        field: "details",
        width: 80,
        cellRenderer: (params) => (
          <button
            onClick={() => handleViewDetailsClick(params.data)}
            className={`cursor-pointer ${
              theme === "dark" ? "text-blue-400" : "text-blue-600"
            }`}
          >
            <FontAwesomeIcon
              icon={faEye}
              className="text-lg"
              title="View Details"
            />
          </button>
        ),
        cellStyle: {
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
      },
    ],
    [theme, handleViewDetailsClick]
  );

  const fetchTickets = useCallback(async () => {
    try {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      const baseUrl =
        parts.length > 2
          ? `https://${parts.shift()}.ogfieldticket.ogpumper.net`
          : "https://test.ogfieldticket.ogpumper.net";
      let nextTicketID = null;

      const response = await fetch(`${baseUrl}/api/tickets.php`);
      const data = await response.json();

      const ticketsData = data.filter((ticket) => {
        if (ticket.isNextTicketID) {
          nextTicketID = ticket.Ticket;
          return false;
        }
        return true;
      });

      let processedTickets = ticketsData.map((ticket) => {
        const totalAmount = ticket.Items.reduce((sum, item) => {
          const quantity = parseFloat(item.Quantity) || 0;
          const cost = parseFloat(item.Cost) || 0;
          return sum + quantity * cost;
        }, 0);

        let leaseWell = ticket.LeaseName || "";
        if (ticket.WellID) {
          leaseWell += ` / ${ticket.WellID}`;
        }

        return {
          ...ticket,
          TotalAmount: totalAmount,
          LeaseWell: leaseWell,
        };
      });

      let filteredTickets = processedTickets.filter((ticket) => {
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

      filteredTickets.sort(
        (a, b) =>
          b.Ticket - a.Ticket || new Date(b.TicketDate) - new Date(a.TicketDate)
      );

      setHighestTicketNumber(
        nextTicketID ||
          (
            Math.max(
              ...processedTickets.map((ticket) => Number(ticket.Ticket))
            ) + 1
          ).toString()
      );

      setTickets(processedTickets);
      setFilteredTickets(filteredTickets);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setLoading(false);
    }
  }, [userRole, userID, showUnbilled]);

  useEffect(() => {
    fetchTickets();
    window.scrollTo(0, 0);
  }, [fetchTickets]);

  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        setSearchQuery(query);
      }, 300),
    []
  );

  const handleSearchChange = useCallback(
    (event) => {
      const query = event.target.value;
      debouncedSearch(query);
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

  useEffect(() => {
    let updatedTickets = tickets.filter((ticket) => {
      const isUnbilled = ticket.Billed !== "Y";
      const isCurrentUser = ticket.UserID === userID;
      const matchesUserRole = userRole !== "P" || isCurrentUser;
      const matchesBillingStatus =
        userRole === "P" ? isUnbilled : showUnbilled ? isUnbilled : !isUnbilled;
      return matchesUserRole && matchesBillingStatus;
    });

    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      updatedTickets = updatedTickets.filter((ticket) =>
        Object.values(ticket).some((value) =>
          String(value).toLowerCase().includes(lowercaseQuery)
        )
      );
    }

    setFilteredTickets(updatedTickets);
  }, [searchQuery, showUnbilled, tickets, userID, userRole]);

  const handleCreateNewTicket = useCallback(() => {
    navigate(`/create-field-ticket/${highestTicketNumber}`);
  }, [navigate, highestTicketNumber]);

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <div
                  onClick={handleCreateNewTicket}
                  className={`inline-flex items-center justify-center font-bold py-2 px-4 rounded-full shadow-lg transition duration-200 ease-in-out pop-effect ${
                    theme === "dark"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-white hover:bg-gray-100 text-blue-600"
                  }`}
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Create New Ticket
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    onChange={handleSearchChange}
                    className={`pl-10 pr-4 py-2 border rounded ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                  />
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  />
                </div>
              </div>
              {userRole !== "P" && (
                <button
                  onClick={handleToggle}
                  className={`px-4 py-2 rounded ${
                    theme === "dark"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={showUnbilled ? faEye : faEyeSlash}
                    className="mr-2"
                  />
                  {showUnbilled ? "Show Billed" : "Show Unbilled"}
                </button>
              )}
            </div>
            <div
              className={`ag-theme-alpine ${
                theme === "dark" ? "ag-theme-alpine-dark" : ""
              }`}
              style={{ height: "1000px", width: "100%" }}
            >
              <AgGridReact
                ref={gridRef}
                rowData={filteredTickets}
                columnDefs={columnDefs}
                defaultColDef={{
                  flex: 1,
                  minWidth: 100,
                  sortable: true,
                  filter: true,
                  resizable: true,
                }}
                pagination={true}
                paginationPageSize={20}
                rowSelection="single"
                domLayout="normal"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketGrid;
