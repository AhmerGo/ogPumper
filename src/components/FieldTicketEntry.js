import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { useSpring, animated } from "react-spring";
import { useUser } from "./UserContext";

function FieldTicketEntry() {
  const { state } = useLocation();
  const { ticketType } = state;
  const { theme } = useTheme();
  const { userRole, userID } = useUser();

  const navigate = useNavigate();

  const [formFields, setFormFields] = useState({
    ticketDate: state?.ticketDate || "",
    lease: state?.lease || "",
    well: state?.well || "",
    ticketType: state?.ticketType || "",
    ticketNumber: "",
    note: state?.noteDefault || "",
  });

  const [items, setItems] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [leases, setLeases] = useState([]);

  useEffect(() => {
    console.log(state);
    const fetchHighestTicketNumber = async () => {
      try {
        const response = await fetch(
          "https://ogfieldticket.com/api/tickets.php"
        );
        const data = await response.json();
        const highestTicketNumber = Math.max(
          ...data.map((ticket) => parseInt(ticket.Ticket))
        );
        setFormFields((prevFields) => ({
          ...prevFields,
          ticketNumber: (highestTicketNumber + 1).toString(),
        }));
      } catch (error) {
        console.error("Error fetching highest ticket number:", error);
      }
    };

    fetchHighestTicketNumber();
  }, []);

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        const response = await fetch(
          "https://ogfieldticket.com/api/leases.php"
        );
        const data = await response.json();
        setLeases(data);
      } catch (error) {
        console.error("Error fetching leases:", error);
      }
    };

    fetchLeases();
  }, []);

  useEffect(() => {
    const fetchTicketTypes = async () => {
      try {
        const response = await fetch("https://ogfieldticket.com/api/jobs.php");
        const data = await response.json();
        setTicketTypes(data);
        setItems(
          data.find((type) => type.Description === ticketType)?.Items || []
        );
      } catch (error) {
        console.error("Error fetching ticket types:", error);
      }
    };

    fetchTicketTypes();
  }, [ticketType]);

  const handleChange = (e, itemId) => {
    const { name, value } = e.target;
    if (name === "note") {
      setFormFields((prevFields) => ({
        ...prevFields,
        [name]: value,
      }));
    } else {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.JobItemID === itemId ? { ...item, [name]: value } : item
        )
      );
    }
  };

  const pageAnimation = useSpring({
    from: { opacity: 0, y: 50 },
    to: { opacity: 1, y: 0 },
    config: { mass: 1, tension: 280, friction: 25 },
  });

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    try {
      const selectedTicketType = ticketTypes.find(
        (type) => type.Description === formFields.ticketType
      );

      const jobTypeID = selectedTicketType ? selectedTicketType.JobTypeID : "";

      const selectedLease = leases.find(
        (lease) => lease.LeaseName === formFields.lease
      );

      const leaseID = selectedLease ? selectedLease.LeaseID : "";

      const updatedItems = items.map((item) => ({
        ...item,
        quantity: item.quantity || item.ItemQuantity || 0,
      }));

      const response = await fetch(
        "https://ogfieldticket.com/api/tickets.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formFields,
            lease: leaseID,
            JobTypeID: jobTypeID,
            userID: userID,
            items: updatedItems,
            note: formFields.note,
          }),
        }
      );

      if (response.ok) {
        navigate("/home");
      } else {
        console.error("Error submitting ticket:", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
    }
  };
  const formattedDate = formFields.ticketDate
    ? new Date(formFields.ticketDate).toLocaleDateString()
    : "N/A";

  return (
    <animated.main
      style={pageAnimation}
      className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-900"
          : "bg-gradient-to-br from-white to-gray-100"
      } p-6 relative overflow-hidden`}
    >
      <div
        className={`absolute inset-0 animate-gradient-xy transition-colors duration-500 ${
          theme === "dark"
            ? "bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900"
            : "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300"
        } opacity-20 mix-blend-soft-light`}
      ></div>
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          theme === "dark"
            ? "bg-gradient-to-tr from-gray-600 via-gray-700 to-gray-800"
            : "bg-gradient-to-tr from-white via-gray-50 to-gray-100"
        } rounded-full mix-blend-multiply filter blur-3xl opacity-50`}
      ></div>
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          theme === "dark"
            ? "bg-gradient-to-tl from-gray-500 via-gray-600 to-gray-700"
            : "bg-gradient-to-tl from-white via-gray-50 to-gray-100"
        } rounded-full mix-blend-multiply filter blur-3xl opacity-50`}
      ></div>

      <div
        className={`w-full max-w-6xl mx-auto transition-colors duration-500 ${
          theme === "dark"
            ? "bg-gray-800/90 text-gray-100"
            : "bg-white/90 text-gray-800"
        } backdrop-blur-md rounded-xl shadow-2xl overflow-hidden z-10`}
      >
        <button
          onClick={() => navigate("/home")}
          className={`absolute top-5 right-5 p-2 rounded-full hover:bg-opacity-30 transition-all ${
            theme === "dark" ? "hover:bg-white" : "hover:bg-gray-400"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className={`w-6 h-6 ${
              theme === "dark" ? "text-white" : "text-gray-800"
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9.5V21h7V14h4v7h7V9.5M9 3l3-3 3 3M2 9h20"
            />
          </svg>
        </button>

        <div className="px-6 py-8 md:px-12 md:py-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-8 md:mb-10 text-center transition-colors duration-500">
            Field Ticket
          </h2>
          {/* Desktop layout */}
          <div className="hidden sm:grid grid-cols-3 gap-8 mb-8 items-center text-center">
            <div>
              <p
                className={`text-lg ${
                  theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                }`}
              >
                Date:{" "}
                <span
                  className={
                    theme === "dark"
                      ? "font-semibold text-gray-300"
                      : "font-semibold text-gray-700"
                  }
                >
                  {formattedDate}
                </span>
              </p>
            </div>
            <div>
              <p
                className={`text-lg ${
                  theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                }`}
              >
                Lease:{" "}
                <span
                  className={
                    theme === "dark"
                      ? "font-semibold text-gray-300"
                      : "font-semibold text-gray-700"
                  }
                >
                  {formFields.lease || "N/A"}
                </span>
              </p>
            </div>
            <div>
              <p
                className={`text-lg ${
                  theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                }`}
              >
                Well:{" "}
                <span
                  className={
                    theme === "dark"
                      ? "font-semibold text-gray-300"
                      : "font-semibold text-gray-700"
                  }
                >
                  {formFields.well || "N/A"}
                </span>
              </p>
            </div>
            <div>
              <p
                className={`text-lg ${
                  theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                }`}
              >
                Ticket Type:{" "}
                <span
                  className={
                    theme === "dark"
                      ? "font-semibold text-gray-300"
                      : "font-semibold text-gray-700"
                  }
                >
                  {formFields.ticketType || "N/A"}
                </span>
              </p>
            </div>
            <div>
              <p
                className={`text-lg ${
                  theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                }`}
              >
                Ticket Number:{" "}
                <span
                  className={
                    theme === "dark"
                      ? "font-semibold text-gray-300"
                      : "font-semibold text-gray-700"
                  }
                >
                  {formFields.ticketNumber || "N/A"}
                </span>
              </p>
            </div>
          </div>
          {/* Mobile layout */}
          <div className="sm:hidden">
            <div className="grid grid-cols-2 gap-4">
              {/* Date Section */}
              <div className="flex flex-col items-center">
                <p
                  className={`font-bold ${
                    theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                  } text-center`}
                >
                  Date
                </p>
                <span
                  className={`block text-center ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {formattedDate}
                </span>
              </div>
              {/* Lease Section */}
              <div className="flex flex-col items-center">
                <p
                  className={`font-bold ${
                    theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                  } text-center`}
                >
                  Lease
                </p>
                <span
                  className={`block text-center ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {formFields.lease || "N/A"}
                </span>
              </div>
              {/* Well Section */}
              <div className="flex flex-col items-center">
                <p
                  className={`font-bold ${
                    theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                  } text-center`}
                >
                  Well
                </p>
                <span
                  className={`block text-center ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {formFields.well || "N/A"}
                </span>
              </div>
              {/* Ticket Type Section */}
              <div className="flex flex-col items-center">
                <p
                  className={`font-bold ${
                    theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                  } text-center`}
                >
                  Ticket Type
                </p>
                <span
                  className={`block text-center ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {formFields.ticketType || "N/A"}
                </span>
              </div>
              {/* Ticket Number Section */}
              <div className="flex flex-col items-center">
                <p
                  className={`font-bold ${
                    theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                  } text-center`}
                >
                  Ticket Number
                </p>
                <span
                  className={`block text-center ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {formFields.ticketNumber || "N/A"}
                </span>
              </div>
            </div>
          </div>
          {items.map((item, index) => (
            <div
              key={index}
              className={`md:flex md:items-center md:justify-between ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
              } p-4 md:p-6 rounded-lg mb-4 md:mb-8`}
            >
              <div className="mb-4 md:mb-0 text-center md:text-left">
                <h4 className="text-xl md:text-2xl font-semibold transition-colors duration-500">
                  {item.ItemDescription}{" "}
                  {item.UOM && (
                    <span
                      className={`text-sm md:text-base ${
                        theme === "dark" ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      ({item.UOM})
                    </span>
                  )}
                </h4>
              </div>
              <div className="flex items-center justify-center md:justify-end">
                <label className="block font-medium transition-colors duration-500 mr-4">
                  Qty:
                </label>
                {item.ItemQuantity !== null ? (
                  <span
                    className={`inline-block w-24 px-4 py-2 rounded-md transition-colors duration-500 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {item.ItemQuantity}
                  </span>
                ) : (
                  <input
                    type="number"
                    name="quantity"
                    value={item.quantity || 0}
                    onChange={(e) => handleChange(e, item.JobItemID)}
                    className={`form-input w-24 px-4 py-2 rounded-md transition-colors duration-500 ${
                      theme === "dark"
                        ? "bg-gray-800 border border-gray-700 focus:ring-gray-600 text-white"
                        : "border border-gray-300 focus:ring-gray-500"
                    }`}
                    placeholder="0"
                  />
                )}
              </div>{" "}
            </div>
          ))}

          <div className="mb-8 md:mb-16">
            <label className="block font-medium transition-colors duration-500 mb-2">
              Note:
            </label>
            <textarea
              name="note"
              value={formFields.note || ""}
              onChange={(e) => handleChange(e)}
              className={`form-textarea w-full px-4 py-2 rounded-md transition-colors duration-500 ${
                theme === "dark"
                  ? "bg-gray-800 border border-gray-700 focus:ring-gray-600 text-white"
                  : "border border-gray-300 focus:ring-gray-500"
              }`}
              rows={4}
            ></textarea>
          </div>
          <div className="text-center">
            <button
              onClick={handleFinalSubmit}
              className={`text-xl md:text-2xl px-12 py-4 focus:outline-none focus:ring-4 shadow-lg shadow-gray-500/50 hover:shadow-gray-600/50 font-semibold rounded-full transition-all ease-in-out duration-300 ${
                theme === "dark"
                  ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:bg-gradient-to-l focus:ring-gray-500 text-gray-100"
                  : "bg-gradient-to-r from-gray-200 to-gray-300 hover:bg-gradient-to-l focus:ring-gray-300 text-gray-800"
              }`}
            >
              Submit Ticket
            </button>
          </div>
        </div>
      </div>
    </animated.main>
  );
}
export default FieldTicketEntry;
