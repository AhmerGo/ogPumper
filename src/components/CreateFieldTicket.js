import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

function CreateFieldTicket() {
  const navigate = useNavigate();
  const [ticketDate, setTicketDate] = useState(new Date());
  const [lease, setLease] = useState("");
  const [well, setWell] = useState("");
  const [ticketType, setTicketType] = useState("");

  const [leases, setLeases] = useState([]);
  const [wells, setWells] = useState([]);
  const ticketTypes = ["Type 1", "Type 2", "Type 3"];

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        const response = await fetch(
          "https://ogfieldticket.com/api/leases.php"
        );
        const data = await response.json();
        console.log("Fetched leases:", data); // Add this line to check the fetched data
        setLeases(data);
      } catch (error) {
        console.error("Error fetching leases:", error);
      }
    };
    fetchLeases();
  }, []);

  useEffect(() => {
    const fetchWells = async () => {
      if (lease) {
        try {
          const response = await fetch(
            `https://ogfieldticket.com/api/leases.php?lease=${lease}`
          );
          const data = await response.json();
          setWells(data[0].Wells);
        } catch (error) {
          console.error("Error fetching wells:", error);
        }
      } else {
        setWells([]);
      }
    };

    fetchWells();
  }, [lease]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!ticketDate || !lease || !well || !ticketType) {
      alert("Please complete all fields before submitting.");
      return;
    }

    const ticketNumber = Math.floor(Math.random() * 10000);

    navigate("/field-ticket-entry", {
      state: { ticketDate, lease, well, ticketType, ticketNumber },
    });
  };

  return (
    <main className="flex-grow">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900 p-4 relative overflow-hidden">
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
                <option value="">Please select the lease.</option>
                {leases.map((lease) => (
                  <option key={lease.LeaseID} value={lease.LeaseID}>
                    {lease.LeaseName}
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
                <option value="">Please select the well.</option>
                {wells.map((well) => (
                  <option key={well.UniqID} value={well.WellID}>
                    {well.WellID}
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
                <option value="">Please select the ticket type.</option>
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
