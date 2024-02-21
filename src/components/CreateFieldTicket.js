import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom"; // Import useNavigate

// Import additional styles if needed

function CreateFieldTicket() {
  const navigate = useNavigate(); // For navigation
  const [ticketDate, setTicketDate] = useState(new Date()); // Set initial date to null
  const [lease, setLease] = useState(""); // Initial value as empty string or null
  const [well, setWell] = useState(""); // Initial value as empty string or null
  const [ticketType, setTicketType] = useState(""); // Initial value as empty string or null

  // Dummy data for dropdowns
  const leases = ["Lease A", "Lease B", "Lease C"];
  const wells = ["Well A", "Well B", "Well C"];
  const ticketTypes = ["Type 1", "Type 2", "Type 3"];

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Basic form validation
    if (!ticketDate || !lease || !well || !ticketType) {
      alert("Please complete all fields before submitting.");
      return;
    }

    const ticketNumber = Math.floor(Math.random() * 10000); // Generate an arbitrary ticket number

    navigate("/field-ticket-entry", {
      state: { ticketDate, lease, well, ticketType, ticketNumber },
    });
  };

  return (
    <main className="flex-grow">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900 p-4 relative overflow-hidden">
        {/* Reuse HomePage background styles here */}
        {/* Background and Blob animations */}
        <div className="absolute inset-0 animate-gradient-xy bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-30 mix-blend-soft-light"></div>
        <div className="absolute inset-0 animate-blob blob-1 bg-gradient-to-tr from-purple-400 via-pink-500 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-duration-200s"></div>
        <div className="absolute inset-0 animate-blob blob-2 bg-gradient-to-tl from-teal-400 via-blue-500 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-duration-300s"></div>

        <div className="z-20 max-w-4xl w-full space-y-8 text-center bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-3xl shadow-xl shadow-blue-500/50 p-10">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-purple-600">
            Create Field Ticket
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col mb-4">
              <label
                htmlFor="ticketDate"
                className="mb-2 text-lg font-medium text-gray-700"
              >
                Ticket Date
              </label>

              <DatePicker
                selected={ticketDate}
                onChange={(date) => setTicketDate(date)}
                className="form-input w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col mb-4">
              <label
                htmlFor="lease"
                className="mb-2 text-lg font-medium text-gray-700"
              >
                Lease
              </label>
              <select
                value={lease}
                onChange={(e) => setLease(e.target.value)}
                className="form-select w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Please select the lease.</option>{" "}
                {/* Default option */}
                {leases.map((lease) => (
                  <option key={lease} value={lease}>
                    {lease}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col mb-4">
              <label
                htmlFor="well"
                className="mb-2 text-lg font-medium text-gray-700"
              >
                Well
              </label>
              <select
                value={well}
                onChange={(e) => setWell(e.target.value)}
                className="form-select w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Please select the well.</option>{" "}
                {/* Default option for Well */}
                {wells.map((well) => (
                  <option key={well} value={well}>
                    {well}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col mb-4">
              <label
                htmlFor="ticketType"
                className="mb-2 text-lg font-medium text-gray-700"
              >
                Ticket Type
              </label>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                className="form-select w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Please select the ticket type.</option>{" "}
                {/* Default option for Ticket Type */}
                {ticketTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center w-full py-3 px-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:bg-gradient-to-bl focus:outline-none focus:ring-4 focus:ring-blue-300 transition ease-in-out duration-150"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default CreateFieldTicket;
