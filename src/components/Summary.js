import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import { useTheme } from "./ThemeContext";

const ConfirmationModal = ({ isOpen, onConfirm, onCancel }) => {
  const { theme } = useTheme();
  const modalAnimation = useSpring({
    transform: isOpen ? "scale(1)" : "scale(0.5)",
    opacity: isOpen ? 1 : 0,
    config: { mass: 1, tension: 280, friction: 25 },
  });

  if (!isOpen) return null;

  return (
    <animated.div
      style={modalAnimation}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        theme === "dark"
          ? "bg-black bg-opacity-50"
          : "bg-gray-500 bg-opacity-50"
      }`}
    >
      <div
        className={`${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow-lg p-6 w-96`}
      >
        <h2
          className={`text-2xl font-bold mb-4 ${
            theme === "dark" ? "text-gray-200" : "text-gray-800"
          }`}
        >
          Confirmation
        </h2>
        <p
          className={`mb-6 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Are you sure you want to delete this ticket?
        </p>
        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className={`px-4 py-2 mr-2 text-sm font-medium ${
              theme === "dark"
                ? "text-gray-400 bg-gray-700 border border-gray-600 hover:bg-gray-600"
                : "text-gray-700 bg-gray-200 border border-gray-300 hover:bg-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 rounded-md hover:bg-gradient-to-l focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </animated.div>
  );
};

const ViewFieldTicket = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [formattedDate, setFormattedDate] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const fadeAnimation = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { mass: 1, tension: 280, friction: 25 },
    delay: 200,
  });

  const backgroundAnimation = useSpring({
    backgroundColor: theme === "dark" ? "#1E3A8A" : "#BFDBFE",
    config: { mass: 1, tension: 200, friction: 20 },
  });

  const ticketSummaryAnimation = useSpring({
    backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
    color: theme === "dark" ? "#d1d5db" : "#1f2937",
    config: { mass: 1, tension: 200, friction: 20 },
  });

  const itemAnimation = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { mass: 1, tension: 200, friction: 20 },
    delay: 300,
  });

  const buttonAnimation = useSpring({
    from: { opacity: 0, transform: "scale(0.8)" },
    to: { opacity: 1, transform: "scale(1)" },
    config: { mass: 1, tension: 200, friction: 20 },
    delay: 600,
  });

  useEffect(() => {
    if (location.state) {
      setTicket(location.state);
      formatDate(location.state.TicketDate);
    }
  }, [location.state]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    setFormattedDate(date.toLocaleDateString(undefined, options));
  };

  const handleChange = (e, itemId) => {
    const { name, value } = e.target;
    setTicket((prevTicket) => ({
      ...prevTicket,
      Items: prevTicket.Items.map((item) =>
        item.TicketLine === itemId ? { ...item, [name]: value } : item
      ),
    }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setTicket(location.state);
  };

  const handleSaveClick = async () => {
    try {
      const response = await fetch(
        `https://ogfieldticket.com/api/tickets.php?ticket=${ticket.Ticket}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ticket),
        }
      );

      console.log(JSON.stringify(ticket));
      if (response.ok) {
        navigate("/home");
      } else {
        console.error("Error updating ticket:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(
        `https://ogfieldticket.com/api/tickets.php?ticket=${ticket.Ticket}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        navigate("/home");
      } else {
        console.error("Error deleting ticket:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  const handleDeleteCancel = () => {
    setShowConfirmation(false);
  };

  if (!ticket) {
    return <div>Loading...</div>;
  }

  return (
    <animated.main
      style={backgroundAnimation}
      className="min-h-screen flex items-center justify-center p-6 transition-colors duration-500"
    >
      <animated.div
        style={ticketSummaryAnimation}
        className="w-full max-w-6xl mx-auto backdrop-blur-md rounded-xl shadow-2xl overflow-hidden transition-colors duration-500"
      >
        <button
          onClick={() => navigate("/home")}
          className={`absolute top-4 right-4 ${
            theme === "dark"
              ? "text-gray-400 hover:text-gray-200"
              : "text-gray-600 hover:text-gray-800"
          } focus:outline-none`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <animated.div style={fadeAnimation} className="px-10 py-8">
          <h2
            className={`text-4xl font-extrabold ${
              theme === "dark" ? "text-gray-200" : "text-gray-800"
            } mb-10 text-center`}
          >
            Field Ticket Entry Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-lg mb-8">
            <animated.p
              style={itemAnimation}
              className={
                theme === "dark" ? "text-indigo-400" : "text-indigo-600"
              }
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
            </animated.p>
            <animated.p
              style={itemAnimation}
              className={
                theme === "dark" ? "text-indigo-400" : "text-indigo-600"
              }
            >
              Lease:{" "}
              <span
                className={
                  theme === "dark"
                    ? "font-semibold text-gray-300"
                    : "font-semibold text-gray-700"
                }
              >
                {ticket.LeaseName || "N/A"}
              </span>
            </animated.p>
            <animated.p
              style={itemAnimation}
              className={
                theme === "dark" ? "text-indigo-400" : "text-indigo-600"
              }
            >
              Well:{" "}
              <span
                className={
                  theme === "dark"
                    ? "font-semibold text-gray-300"
                    : "font-semibold text-gray-700"
                }
              >
                {ticket.WellID || "N/A"}
              </span>
            </animated.p>
            <animated.p
              style={itemAnimation}
              className={
                theme === "dark" ? "text-indigo-400" : "text-indigo-600"
              }
            >
              Ticket Type:{" "}
              <span
                className={
                  theme === "dark"
                    ? "font-semibold text-gray-300"
                    : "font-semibold text-gray-700"
                }
              >
                {ticket.JobDescription || "N/A"}
              </span>
            </animated.p>
            <animated.p
              style={itemAnimation}
              className={
                theme === "dark" ? "text-indigo-400" : "text-indigo-600"
              }
            >
              Ticket Number:{" "}
              <span
                className={
                  theme === "dark"
                    ? "font-semibold text-gray-300"
                    : "font-semibold text-gray-700"
                }
              >
                {ticket.Ticket || "N/A"}
              </span>
            </animated.p>
          </div>
          {ticket.Items &&
            ticket.Items.map((item) => (
              <animated.div
                key={item.TicketLine}
                style={itemAnimation}
                className={`flex flex-col md:flex-row gap-6 items-center ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                } p-4 rounded-lg mb-4`}
              >
                <div className="flex-1">
                  <h4
                    className={`text-lg font-semibold ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {item.ItemDescription}{" "}
                    {item.UOM && (
                      <span
                        className={
                          theme === "dark"
                            ? "text-sm text-gray-400"
                            : "text-sm text-gray-600"
                        }
                      >
                        ({item.UOM})
                      </span>
                    )}
                  </h4>
                </div>
                <div className="w-full md:w-auto flex gap-4 items-center">
                  {isEditing ? (
                    <>
                      <label
                        className={
                          theme === "dark"
                            ? "block text-gray-400 font-medium"
                            : "block text-gray-600 font-medium"
                        }
                      >
                        Qty:
                      </label>
                      <input
                        type="number"
                        name="Quantity"
                        value={item.Quantity}
                        onChange={(e) => handleChange(e, item.TicketLine)}
                        className={`form-input w-24 px-4 py-2 rounded-md border ${
                          theme === "dark"
                            ? "border-gray-600 bg-gray-800 text-gray-300"
                            : "border-gray-400 bg-white text-gray-700"
                        } focus:ring-indigo-400 focus:border-indigo-400 transition`}
                        placeholder="0"
                      />
                      <label
                        className={
                          theme === "dark"
                            ? "block text-gray-400 font-medium"
                            : "block text-gray-600 font-medium"
                        }
                      >
                        Notes:
                      </label>
                      <input
                        type="text"
                        name="Note"
                        value={item.Note || ""}
                        onChange={(e) => handleChange(e, item.TicketLine)}
                        className={`form-input w-full md:w-96 px-4 py-2 rounded-md border ${
                          theme === "dark"
                            ? "border-gray-600 bg-gray-800 text-gray-300"
                            : "border-gray-400 bg-white text-gray-700"
                        } focus:ring-indigo-400 focus:border-indigo-400 transition`}
                        placeholder="Add notes"
                      />
                    </>
                  ) : (
                    <>
                      <p
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        <span className="font-medium">Qty:</span>{" "}
                        {item.Quantity}
                      </p>
                      <p
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        <span className="font-medium">Notes:</span>{" "}
                        {item.Note || "N/A"}
                      </p>
                    </>
                  )}
                </div>
              </animated.div>
            ))}
          <animated.div style={buttonAnimation} className="text-center mt-12">
            {!isEditing ? (
              <button
                onClick={handleEditClick}
                className="text-lg px-10 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:bg-gradient-to-l focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 hover:shadow-indigo-500/50 text-white font-semibold rounded-full transition-all ease-in-out duration-300"
              >
                Edit Ticket
              </button>
            ) : (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleSaveClick}
                  className="text-lg px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:bg-gradient-to-l focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 hover:shadow-green-500/50 text-white font-semibold rounded-full transition-all ease-in-out duration-300"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelClick}
                  className="text-lg px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:bg-gradient-to-l focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 hover:shadow-red-500/50 text-white font-semibold rounded-full transition-all ease-in-out duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="text-lg px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:bg-gradient-to-l focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 hover:shadow-red-500/50 text-white font-semibold rounded-full transition-all ease-in-out duration-300"
                >
                  Delete
                </button>
              </div>
            )}
          </animated.div>
        </animated.div>
      </animated.div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </animated.main>
  );
};
export default ViewFieldTicket;
