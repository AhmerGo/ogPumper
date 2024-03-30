import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";

function FieldTicketEntry() {
  const { state } = useLocation();
  const { ticketType } = state;
  const { theme } = useTheme();

  const navigate = useNavigate();

  const [formFields, setFormFields] = useState({
    ticketDate: state?.ticketDate || "",
    lease: state?.lease || "",
    well: state?.well || "",
    ticketType: state?.ticketType || "",
    ticketNumber: "",
  });

  const [items, setItems] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [leases, setLeases] = useState([]);

  useEffect(() => {
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
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.JobItemID === itemId ? { ...item, [name]: value } : item
      )
    );
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    try {
      // Find the selected ticket type object based on the ticket type description
      const selectedTicketType = ticketTypes.find(
        (type) => type.Description === formFields.ticketType
      );

      // Get the job type ID from the selected ticket type object
      const jobTypeID = selectedTicketType ? selectedTicketType.JobTypeID : "";

      // Find the selected lease object based on the lease name
      const selectedLease = leases.find(
        (lease) => lease.LeaseName === formFields.lease
      );

      // Get the lease ID from the selected lease object
      const leaseID = selectedLease ? selectedLease.LeaseID : "";

      const response = await fetch(
        "https://ogfieldticket.com/api/tickets.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formFields,
            lease: leaseID, // Replace the lease name with the lease ID
            JobTypeID: jobTypeID,
            items,
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
    <main
      className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-900"
          : "bg-gradient-to-br from-gray-100 to-gray-200"
      } p-6 relative overflow-hidden`}
    >
      <div
        className={`absolute inset-0 animate-gradient-xy transition-colors duration-500 ${
          theme === "dark"
            ? "bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900"
            : "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400"
        } opacity-20 mix-blend-soft-light`}
      ></div>
      <div
        className={`absolute inset-0 animate-blob blob-1 transition-colors duration-500 ${
          theme === "dark"
            ? "bg-gradient-to-tr from-gray-600 via-gray-700 to-gray-800"
            : "bg-gradient-to-tr from-gray-300 via-gray-400 to-gray-500"
        } rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-duration-200s`}
      ></div>
      <div
        className={`absolute inset-0 animate-blob blob-2 transition-colors duration-500 ${
          theme === "dark"
            ? "bg-gradient-to-tl from-gray-500 via-gray-600 to-gray-700"
            : "bg-gradient-to-tl from-gray-200 via-gray-300 to-gray-400"
        } rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-duration-300s`}
      ></div>

      <div
        className={`w-full max-w-6xl mx-auto transition-colors duration-500 ${
          theme === "dark"
            ? "bg-gray-800/90 text-gray-100"
            : "bg-white/90 text-gray-800"
        } backdrop-blur-md rounded-xl shadow-2xl overflow-hidden z-10`}
      >
        <div className="px-10 py-8">
          <h2 className="text-4xl font-extrabold mb-10 text-center transition-colors duration-500">
            Field Ticket
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-lg mb-8 transition-colors duration-500">
            <p>
              Date: <span className="font-semibold">{formattedDate}</span>
            </p>
            <p>
              Lease:{" "}
              <span className="font-semibold">{formFields.lease || "N/A"}</span>
            </p>
            <p>
              Well:{" "}
              <span className="font-semibold">{formFields.well || "N/A"}</span>
            </p>
            <p>
              Ticket Type:{" "}
              <span className="font-semibold">
                {formFields.ticketType || "N/A"}
              </span>
            </p>
            <p>
              Ticket Number:{" "}
              <span className="font-semibold">
                {formFields.ticketNumber || "N/A"}
              </span>
            </p>
          </div>

          {items.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row gap-6 items-center transition-colors duration-500 ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
              } p-4 rounded-lg mb-4`}
            >
              <div className="flex-1">
                <h4 className="text-lg font-semibold transition-colors duration-500">
                  {item.ItemDescription}{" "}
                  {item.UOM && (
                    <span
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      ({item.UOM})
                    </span>
                  )}
                </h4>
              </div>
              <div className="w-full md:w-auto flex gap-4 items-center">
                <label className="block font-medium transition-colors duration-500">
                  Qty:
                </label>
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
                <label className="block font-medium transition-colors duration-500">
                  Notes:
                </label>
                <input
                  type="text"
                  name="notes"
                  value={item.notes || ""}
                  onChange={(e) => handleChange(e, item.JobItemID)}
                  className={`form-input w-full md:w-96 px-4 py-2 rounded-md transition-colors duration-500 ${
                    theme === "dark"
                      ? "bg-gray-800 border border-gray-700 focus:ring-gray-600 text-white"
                      : "border border-gray-300 focus:ring-gray-500"
                  }`}
                  placeholder="Add notes"
                />
              </div>
            </div>
          ))}

          <div className="text-center mt-12">
            <button
              onClick={handleFinalSubmit}
              className={`text-lg px-10 py-3 focus:outline-none focus:ring-4 shadow-lg shadow-gray-500/50 hover:shadow-gray-600/50 font-semibold rounded-full transition-all ease-in-out duration-300 ${
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
    </main>
  );
}

export default FieldTicketEntry;
