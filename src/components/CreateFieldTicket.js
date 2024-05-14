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
  const [subdomain, setSubdomain] = useState("");

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
  }, []);

  const pageAnimation = useSpring({
    from: { opacity: 0, y: 50 },
    to: { opacity: 1, y: 0 },
    config: { mass: 1, tension: 280, friction: 25 },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Adjust this if you want the end of today as the limit

  useEffect(() => {
    const fetchLeases = async () => {
      try {
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
        const response = await fetch(`${baseUrl}/api/leases.php`);
        const data = await response.json();
        console.log("Fetched leases:", data);
        setLeases(data);
      } catch (error) {
        console.error("Error fetching leases:", error);
      }
    };
    fetchLeases(); // Ensure fetchLeases is called regardless of the subdomain
  }, [subdomain]);

  useEffect(() => {
    const fetchWells = async () => {
      if (lease) {
        try {
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

          const response = await fetch(
            `${baseUrl}/api/leases.php?lease=${lease}`
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
    fetchWells(); // Ensure fetchWells is called regardless of the subdomain
  }, [lease, subdomain]);

  useEffect(() => {
    const fetchTicketTypes = async () => {
      try {
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

        const response = await fetch(`${baseUrl}/api/jobs.php`);
        const data = await response.json();
        console.log(data);
        setTicketTypes(data);
      } catch (error) {
        console.error("Error fetching ticket types:", error);
      }
    };
    fetchTicketTypes(); // Ensure fetchTicketTypes is called regardless of the subdomain
  }, [subdomain]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!ticketDate || !lease || !ticketType) {
      alert("Please complete all fields before submitting.");
      return;
    }

    const selectedTicketType = ticketTypes.find(
      (type) => type.JobTypeID === ticketType
    );
    const ticketTypeDescription = selectedTicketType
      ? selectedTicketType.Description
      : "";
    const noteDefault = selectedTicketType
      ? selectedTicketType.NoteDefault
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
        noteDefault,
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
            : "bg-gradient-to-br from-white to-gray-100"
        } p-4 relative overflow-hidden`}
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
                maxDate={today} // This restricts users from selecting a date beyond today
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
              >
                <option value="">Please select the well (optional).</option>
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
            <animated.button
              type="button" // Changed from 'submit' to 'button'
              onClick={() => navigate("/home")} // Redirect to home page
              style={{
                opacity: pageAnimation.opacity,
                transform: pageAnimation.y.interpolate(
                  (y) => `translateY(${y / 3}px)`
                ),
              }}
              className={`inline-flex items-center justify-center w-full py-3 px-6 font-bold rounded-lg focus:outline-none transition-colors duration-500 ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300 focus:ring-4 focus:ring-gray-500"
                  : "bg-gray-300 hover:bg-gray-200 text-gray-700 focus:ring-4 focus:ring-gray-100"
              }`}
            >
              Cancel
            </animated.button>
          </form>
        </div>
      </div>
    </animated.main>
  );
}

export default CreateFieldTicket;
