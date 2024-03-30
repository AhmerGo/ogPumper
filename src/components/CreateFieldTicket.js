import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { useSpring, animated } from "react-spring";

function CreateFieldTicket() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [ticketDate, setTicketDate] = useState(new Date());
  const [lease, setLease] = useState("");
  const [well, setWell] = useState("");
  const [ticketType, setTicketType] = useState("");

  const [leases, setLeases] = useState([]);
  const [wells, setWells] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);

  const pageAnimation = useSpring({
    from: { opacity: 0, y: 50 },
    to: { opacity: 1, y: 0 },
    config: { mass: 1, tension: 280, friction: 25 },
  });

  const blobAnimation = useSpring({
    loop: true,
    from: { scale: 1 },
    to: [{ scale: 1.2 }, { scale: 1 }],
    config: { mass: 1, tension: 180, friction: 12 },
  });

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        const response = await fetch(
          "https://ogfieldticket.com/api/leases.php"
        );
        const data = await response.json();
        console.log("Fetched leases:", data);
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

  useEffect(() => {
    const fetchTicketTypes = async () => {
      try {
        const response = await fetch("https://ogfieldticket.com/api/jobs.php");
        const data = await response.json();
        setTicketTypes(data);
      } catch (error) {
        console.error("Error fetching ticket types:", error);
      }
    };

    fetchTicketTypes();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!ticketDate || !lease || !well || !ticketType) {
      alert("Please complete all fields before submitting.");
      return;
    }

    const selectedTicketType = ticketTypes.find(
      (type) => type.JobTypeID === ticketType
    );
    const ticketTypeDescription = selectedTicketType
      ? selectedTicketType.Description
      : "";

    const selectedLease = leases.find((l) => l.LeaseID === lease);
    const leaseName = selectedLease ? selectedLease.LeaseName : "";

    const ticketNumber = Math.floor(Math.random() * 10000);

    navigate("/field-ticket-entry", {
      state: {
        ticketDate,
        lease: leaseName,
        well,
        ticketType: ticketTypeDescription,
        ticketNumber,
      },
    });
  };

  return (
    <animated.main
      style={{
        opacity: pageAnimation.opacity,
        transform: pageAnimation.y.interpolate((y) => `translateY(${y}px)`),
      }}
      className="flex-grow"
    >
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-800 to-gray-900"
            : "bg-gradient-to-br from-gray-100 to-gray-200"
        } p-4 relative overflow-hidden`}
      >
        <div
          className={`absolute inset-0 animate-gradient-xy transition-colors duration-500 ${
            theme === "dark"
              ? "bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900"
              : "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400"
          } opacity-20 mix-blend-soft-light`}
        ></div>
        <animated.div
          style={{
            transform: blobAnimation.scale.interpolate(
              (scale) => `scale(${scale})`
            ),
          }}
          className={`absolute inset-0 animate-blob blob-1 transition-colors duration-500 ${
            theme === "dark"
              ? "bg-gradient-to-tr from-gray-600 via-gray-700 to-gray-800"
              : "bg-gradient-to-tr from-gray-300 via-gray-400 to-gray-500"
          } rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-duration-200s`}
        ></animated.div>
        <animated.div
          style={{
            transform: blobAnimation.scale.interpolate(
              (scale) => `scale(${scale})`
            ),
          }}
          className={`absolute inset-0 animate-blob blob-2 transition-colors duration-500 ${
            theme === "dark"
              ? "bg-gradient-to-tl from-gray-500 via-gray-600 to-gray-700"
              : "bg-gradient-to-tl from-gray-200 via-gray-300 to-gray-400"
          } rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-duration-300s`}
        ></animated.div>

        <animated.div
          style={{
            opacity: pageAnimation.opacity,
          }}
          className={`z-20 max-w-4xl w-full space-y-8 text-center transition-colors duration-500 ${
            theme === "dark" ? "bg-gray-900" : "bg-white"
          } bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-3xl shadow-xl p-10`}
        >
          <animated.h2
            style={{
              transform: pageAnimation.y.interpolate(
                (y) => `translateY(${y / 2}px)`
              ),
            }}
            className={`text-4xl font-bold text-transparent bg-clip-text transition-colors duration-500 ${
              theme === "dark"
                ? "bg-gradient-to-br from-gray-300 to-gray-400"
                : "bg-gradient-to-br from-gray-700 to-gray-800"
            }`}
          >
            Create Field Ticket
          </animated.h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col mb-4">
              <label
                htmlFor="ticketDate"
                className={`mb-2 text-lg font-medium transition-colors duration-500 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Ticket Date
              </label>
              <DatePicker
                selected={ticketDate}
                onChange={(date) => setTicketDate(date)}
                className={`form-input w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors duration-500 ${
                  theme === "dark"
                    ? "bg-gray-800 border border-gray-700 focus:ring-gray-600 text-white"
                    : "border border-gray-300 focus:ring-gray-500"
                }`}
              />
            </div>

            <div className="flex flex-col mb-4">
              <label
                htmlFor="lease"
                className={`mb-2 text-lg font-medium transition-colors duration-500 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Lease
              </label>
              <select
                value={lease}
                onChange={(e) => setLease(e.target.value)}
                className={`form-select w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors duration-500 ${
                  theme === "dark"
                    ? "bg-gray-800 border border-gray-700 focus:ring-gray-600 text-white"
                    : "border border-gray-300 focus:ring-gray-500"
                }`}
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
                className={`mb-2 text-lg font-medium transition-colors duration-500 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Well
              </label>
              <select
                value={well}
                onChange={(e) => setWell(e.target.value)}
                className={`form-select w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors duration-500 ${
                  theme === "dark"
                    ? "bg-gray-800 border border-gray-700 focus:ring-gray-600 text-white"
                    : "border border-gray-300 focus:ring-gray-500"
                }`}
                required
              >
                <option value="">Please select the well.</option>
                {wells
                  .filter((well) => well.LeaseID === lease)
                  .map((well) => (
                    <option key={well.UniqID} value={well.WellID}>
                      {well.WellID}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col mb-4">
              <label
                htmlFor="ticketType"
                className={`mb-2 text-lg font-medium transition-colors duration-500 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Ticket Type
              </label>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                className={`form-select w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors duration-500 ${
                  theme === "dark"
                    ? "bg-gray-800 border border-gray-700 focus:ring-gray-600 text-white"
                    : "border border-gray-300 focus:ring-gray-500"
                }`}
                required
              >
                <option value="">Please select the ticket type.</option>
                {ticketTypes.map((type) => (
                  <option key={type.JobTypeID} value={type.JobTypeID}>
                    {type.Description}
                  </option>
                ))}
              </select>
            </div>

            <animated.button
              type="submit"
              style={{
                opacity: pageAnimation.opacity,
                transform: pageAnimation.y.interpolate(
                  (y) => `translateY(${y / 3}px)`
                ),
              }}
              className={`inline-flex items-center justify-center w-full py-3 px-6 font-bold rounded-lg focus:outline-none transition-colors duration-500 ${
                theme === "dark"
                  ? "bg-gradient-to-br from-gray-600 to-gray-700 hover:bg-gradient-to-bl text-gray-100 focus:ring-4 focus:ring-gray-500"
                  : "bg-gradient-to-br from-gray-700 to-gray-800 hover:bg-gradient-to-bl text-white focus:ring-4 focus:ring-gray-300"
              }`}
            >
              Submit
            </animated.button>
          </form>
        </animated.div>
      </div>
    </animated.main>
  );
}

export default CreateFieldTicket;
