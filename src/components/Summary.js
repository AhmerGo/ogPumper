import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import { useTheme } from "./ThemeContext";
import { useUser } from "./UserContext";
import { MdHome } from "react-icons/md";
const ConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  confirmationQuestion,
  actionButtonLabel,
}) => {
  const { theme } = useTheme();
  const modalAnimation = useSpring({
    transform: isOpen ? "scale(1)" : "scale(0.95)",
    opacity: isOpen ? 1 : 0,
    config: { mass: 1, tension: 280, friction: 30 },
  });

  if (!isOpen) return null;

  return (
    <animated.div
      style={modalAnimation}
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 ${
        theme === "dark"
          ? "bg-black bg-opacity-60"
          : "bg-gray-500 bg-opacity-60"
      }`}
    >
      <div
        className={`rounded-lg p-6 w-full max-w-md mx-auto ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } shadow-lg border ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Confirmation
        </h2>
        <p
          className={`mb-6 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {confirmationQuestion}
        </p>
        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition ease-in-out duration-150"
            style={{
              background: theme === "dark" ? "#374151" : "#d1d5db",
              color: theme === "dark" ? "#d1d5db" : "#374151",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none transition ease-in-out duration-150 ml-2"
            style={{
              backgroundImage: "linear-gradient(45deg, #10B981, #3B82F6)",
            }}
          >
            {actionButtonLabel}
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
  const [showBillingConfirmation, setShowBillingConfirmation] = useState(false);
  const [fieldNote, setFieldNote] = useState("");
  const { userRole, userID } = useUser();
  const [itemCosts, setItemCosts] = useState({});
  const [itemsMap, setItemsMap] = useState(new Map());
  const [subdomain, setSubdomain] = useState("");

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
      setFieldNote(location.state.Note || "");
    }
  }, [location.state]);

  useEffect(() => {
    const fetchItemCosts = async () => {
      console.log(userRole);
      // Early return if ticket or ticket.JobTypeID is not available.
      if (!ticket || !ticket.JobTypeID) {
        console.log("Ticket or JobTypeID not available");
        return;
      }

      try {
        const response = await fetch(
          `https://ogfieldticket.com/api/jobitem.php?id=${ticket.JobTypeID}`
        );
        const data = await response.json();
        console.log(data.items);

        if (data.success) {
          // Create a map of JobItemID to an object containing ItemCost and UseQuantity for easy lookup.
          const itemsMap = new Map(
            data.items.map((item) => [
              item.ItemID,
              {
                ItemCost: parseFloat(item.ItemCost),
                UseQuantity: item.UseQuantity === "Y",
              },
            ])
          );
          console.log(itemsMap);
          setItemsMap(itemsMap); // Store the itemsMap in the component's state

          // Calculate the total cost for each ticket item based on UseQuantity.
          const updatedItems = ticket.Items.map((item) => {
            const itemData = itemsMap.get(item.JobItemID) || {
              ItemCost: 0,
              UseQuantity: false,
            };
            const quantity = itemData.UseQuantity ? item.Quantity : 1;
            const totalCost = (
              itemData.ItemCost * parseFloat(quantity)
            ).toFixed(2);
            return { ...item, totalCost, UseQuantity: itemData.UseQuantity };
          });

          // Update your ticket's state with these updated items
          setTicket((prevTicket) => {
            const updatedTicket = {
              ...prevTicket,
              Items: updatedItems,
            };
            console.log(updatedTicket); // Log the updated ticket state
            return updatedTicket;
          });
        }
      } catch (error) {
        console.error("Error fetching item costs:", error);
      }
    };

    fetchItemCosts();
    // Using ticket?.JobTypeID in the dependency array ensures the effect only reruns when JobTypeID changes.
  }, [ticket?.JobTypeID]);
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    setFormattedDate(date.toLocaleDateString(undefined, options));
  };

  const handleChange = (e, itemId) => {
    const { name, value } = e.target;
    setTicket((prevTicket) => {
      const updatedItems = prevTicket.Items.map((item) => {
        if (item.TicketLine === itemId) {
          const updatedItem = { ...item, [name]: value };
          if (item.UseQuantity) {
            const itemData = itemsMap.get(item.JobItemID) || {
              ItemCost: 0,
              UseQuantity: false,
            };
            const totalCost = (itemData.ItemCost * parseFloat(value)).toFixed(
              2
            );
            updatedItem.totalCost = totalCost;
          }
          return updatedItem;
        }
        return item;
      });
      return { ...prevTicket, Items: updatedItems };
    });
  };
  const handleFieldNoteChange = (e) => {
    setFieldNote(e.target.value);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setFieldNote(location.state.Note || "");

    // Preserve the calculated total costs and UseQuantity
    setTicket((prevTicket) => ({
      ...location.state,
      Items: prevTicket.Items.map((item, index) => ({
        ...location.state.Items[index],
        totalCost: item.totalCost,
        UseQuantity: item.UseQuantity, // Preserve the UseQuantity property
      })),
    }));
  };

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

  const handleSaveClick = async () => {
    try {
      const updatedTicket = { ...ticket, Note: fieldNote };

      const baseUrl = subdomain
        ? `https://${subdomain}.ogpumper.net`
        : "https://ogfieldticket.com";

      const response = await fetch(
        `${baseUrl}/api/tickets.php?ticket=${ticket.Ticket}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTicket),
        }
      );

      if (response.ok) {
        setIsEditing(false);
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
      const baseUrl = subdomain
        ? `https://${subdomain}.ogpumper.net`
        : "https://ogfieldticket.com";

      const response = await fetch(
        `${baseUrl}/api/tickets.php?ticket=${ticket.Ticket}`,
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

  const handleBillClick = () => {
    setShowBillingConfirmation(true);
  };

  const handleBillConfirm = async () => {
    try {
      const updatedTicket = { ...ticket, Billed: "Y" };
      const baseUrl = subdomain
        ? `https://${subdomain}.ogpumper.net`
        : "https://ogfieldticket.com";

      const response = await fetch(
        `${baseUrl}/api/tickets.php?ticket=${ticket.Ticket}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTicket),
        }
      );

      if (response.ok) {
        navigate("/home");
      } else {
        console.error("Error updating ticket:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  const handleBillCancel = () => {
    setShowBillingConfirmation(false);
  };

  if (!ticket) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <animated.main
        style={backgroundAnimation}
        className="min-h-screen flex items-center justify-center p-6
        transition-colors duration-500"
      >
        <animated.div
          style={ticketSummaryAnimation}
          className="w-full max-w-6xl mx-auto backdrop-blur-md rounded-xl shadow-2xl overflow-hidden transition-colors duration-500"
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

          <animated.div style={fadeAnimation} className="px-10 py-8">
            <h2
              className={`text-4xl font-extrabold ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              } mb-10 text-center`}
            >
              Field Ticket Entry Summary
            </h2>
            <div className="px-4 mb-8">
              {/* Desktop layout */}
              <div className="hidden sm:block">
                {/* Row 1: Date and Lease */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-lg mb-8 items-center">
                  <div className="flex flex-col justify-center items-center">
                    <animated.p
                      style={itemAnimation}
                      className={`text-center ${
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
                    </animated.p>
                  </div>

                  {userRole !== "P" ? (
                    <div className="flex flex-col justify-center items-center">
                      <animated.p
                        style={itemAnimation}
                        className={`text-center ${
                          theme === "dark"
                            ? "text-indigo-400"
                            : "text-indigo-600"
                        }`}
                      >
                        Lease/User:{" "}
                        <span
                          className={
                            theme === "dark"
                              ? "font-semibold text-gray-300"
                              : "font-semibold text-gray-700"
                          }
                        >
                          {ticket.LeaseName || "N/A"} /{" "}
                          {ticket.UserID
                            ? ticket.UserID.charAt(0).toUpperCase() +
                              ticket.UserID.slice(1)
                            : "N/A"}
                        </span>
                      </animated.p>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-center items-center">
                      <animated.p
                        style={itemAnimation}
                        className={`text-center ${
                          theme === "dark"
                            ? "text-indigo-400"
                            : "text-indigo-600"
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
                          {ticket.LeaseName || "N/A"}{" "}
                        </span>
                      </animated.p>
                    </div>
                  )}

                  <div className="flex flex-col justify-center items-center">
                    <animated.p
                      style={itemAnimation}
                      className={`text-center ${
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
                        {ticket.WellID || "N/A"}
                      </span>
                    </animated.p>
                  </div>
                  <div className="flex flex-col justify-center items-center">
                    <animated.p
                      style={itemAnimation}
                      className={`text-center ${
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
                        {ticket.JobDescription || "N/A"}
                      </span>
                    </animated.p>
                  </div>
                  <div className="flex flex-col justify-center items-center">
                    <animated.p
                      style={itemAnimation}
                      className={`text-center ${
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
                        {ticket.Ticket || "N/A"}
                      </span>
                    </animated.p>
                  </div>
                  <div className="flex flex-col justify-center items-center">
                    {userRole !== "P" && (
                      <animated.p
                        style={itemAnimation}
                        className={`text-center ${
                          theme === "dark"
                            ? "text-indigo-400"
                            : "text-indigo-600"
                        }`}
                      >
                        Billed:{" "}
                        <span
                          className={
                            theme === "dark"
                              ? "font-semibold text-gray-300"
                              : "font-semibold text-gray-700"
                          }
                        >
                          {ticket.Billed || "N/A"}
                        </span>
                      </animated.p>
                    )}
                  </div>
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
                  {userRole !== "P" ? (
                    <div className="flex flex-col justify-center items-center">
                      <p
                        className={`font-bold ${
                          theme === "dark"
                            ? "text-indigo-400"
                            : "text-indigo-600"
                        } text-center`}
                      >
                        Lease/User:{" "}
                        <span
                          className={
                            theme === "dark"
                              ? "font-semibold text-gray-300"
                              : "font-semibold text-gray-700"
                          }
                        >
                          {ticket.LeaseName || "N/A"} /{" "}
                          {ticket.UserID
                            ? ticket.UserID.charAt(0).toUpperCase() +
                              ticket.UserID.slice(1)
                            : "N/A"}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-center items-center">
                      <p
                        className={`font-bold ${
                          theme === "dark"
                            ? "text-indigo-400"
                            : "text-indigo-600"
                        } text-center`}
                      >
                        Lease:{" "}
                        <span
                          className={
                            theme === "dark"
                              ? "font-semibold text-gray-300"
                              : "font-semibold text-gray-700"
                          }
                        >
                          {ticket.LeaseName || "N/A"} /{" "}
                        </span>
                      </p>
                    </div>
                  )}{" "}
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
                      {ticket.WellID || "N/A"}
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
                      {ticket.JobDescription || "N/A"}
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
                      {ticket.Ticket || "N/A"}
                    </span>
                  </div>
                  {/* Billed Section */}
                  <div className="flex flex-col items-center">
                    <p
                      className={`font-bold ${
                        theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                      } text-center`}
                    >
                      Billed
                    </p>
                    <span
                      className={`block text-center ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {ticket.Billed || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>{" "}
            {ticket.Items &&
              ticket.Items.map((item) => (
                <animated.div
                  key={item.TicketLine}
                  style={itemAnimation}
                  className={`flex flex-col md:flex-row justify-between gap-6 items-center ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  } p-6 rounded-lg mb-4`}
                >
                  <div className="flex-1">
                    <h4
                      className={`text-xl font-semibold ${
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
                  <div className="flex flex-1 items-center justify-end gap-4">
                    {userRole !== "P" && (
                      <div className="flex-grow min-w-0">
                        <p
                          className={`whitespace-nowrap ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <span className="font-medium">Total Cost:</span> $
                          {item.totalCost}
                        </p>
                      </div>
                    )}
                    <div
                      className={`flex-shrink-0 ${
                        userRole.userRole === "P" ? "ml-auto" : ""
                      }`}
                    >
                      {isEditing ? (
                        <>
                          <label
                            className={`block ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            } font-medium text-lg`}
                          >
                            Qty:
                          </label>
                          {item.UseQuantity ? (
                            <input
                              type="number"
                              name="Quantity"
                              value={item.Quantity}
                              onChange={(e) => handleChange(e, item.TicketLine)}
                              onClick={(e) => e.target.select()}
                              className={`form-input w-32 px-4 py-2 rounded-md border text-lg ${
                                theme === "dark"
                                  ? "border-gray-600 bg-gray-800 text-gray-300"
                                  : "border-gray-400 bg-white text-gray-700"
                              } focus:ring-indigo-400 focus:border-indigo-400 transition`}
                              placeholder="0"
                            />
                          ) : (
                            <p
                              className={`whitespace-nowrap text-lg ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              {item.Quantity}
                            </p>
                          )}{" "}
                        </>
                      ) : (
                        <p
                          className={`whitespace-nowrap text-lg ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <span className="font-medium">Qty:</span>{" "}
                          {item.Quantity}
                        </p>
                      )}
                    </div>
                  </div>
                </animated.div>
              ))}{" "}
            {!isEditing && fieldNote && (
              <animated.div
                style={itemAnimation}
                className={`mb-8 p-6 rounded-lg shadow-lg ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-gray-800 to-gray-900"
                    : "bg-gradient-to-r from-gray-100 to-gray-200"
                }`}
              >
                <h4
                  className={`text-2xl font-bold mb-4 ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Note
                </h4>
                <p
                  className={`text-lg leading-relaxed ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {fieldNote}
                </p>
              </animated.div>
            )}
            {isEditing && (
              <animated.div style={itemAnimation} className="mb-8">
                <h4
                  className={`text-2xl font-bold mb-4 ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Edit Note
                </h4>
                <div className="relative">
                  <textarea
                    value={fieldNote}
                    onChange={handleFieldNoteChange}
                    className={`form-textarea w-full px-4 py-3 pr-12 rounded-lg border-2 ${
                      theme === "dark"
                        ? "border-indigo-600 bg-gray-800 text-gray-200"
                        : "border-indigo-400 bg-white text-gray-800"
                    } focus:ring-indigo-500 focus:border-indigo-500 transition resize-none`}
                    placeholder="Add a note"
                    rows={6}
                  ></textarea>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`h-6 w-6 ${
                        theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                      }`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M18.303 4.742a.75.75 0 01.022 1.06l-4.25 4.25a.75.75 0 01-1.06 0L12 9.06l-1.015 1.015a.75.75 0 01-1.06 0l-4.25-4.25a.75.75 0 111.06-1.06L10 7.94l1.015-1.015a.75.75 0 011.06 0L14 8.94l4.243-4.243a.75.75 0 011.06-.022z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </animated.div>
            )}{" "}
            <animated.div style={buttonAnimation} className="text-center mt-12">
              {!isEditing ? (
                <>
                  {ticket.Billed !== "Y" && (
                    <button
                      onClick={handleEditClick}
                      className={`px-4 py-2 font-semibold rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 ${
                        theme === "dark"
                          ? "bg-indigo-600 hover:bg-indigo-700 text-gray-200"
                          : "bg-indigo-500 hover:bg-indigo-600 text-white"
                      }`}
                    >
                      Edit Ticket
                    </button>
                  )}

                  {userRole !== "P" && ticket.Billed !== "Y" && (
                    <button
                      onClick={handleBillClick}
                      className={`ml-4 px-4 py-2 font-semibold rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 ${
                        theme === "dark"
                          ? "bg-green-600 hover:bg-green-700 text-gray-200"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      Bill
                    </button>
                  )}
                </>
              ) : (
                <div className="flex justify-center flex-wrap gap-2 sm:space-x-4 sm:flex-nowrap">
                  <button
                    onClick={handleSaveClick}
                    className={`text-lg px-4 sm:px-8 py-2 sm:py-3 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-green-700 to-green-600 hover:bg-gradient-to-l focus:ring-green-800 text-white"
                        : "bg-gradient-to-r from-green-500 to-green-400 hover:bg-gradient-to-l focus:ring-green-300 text-white"
                    } shadow-lg ${
                      theme === "dark"
                        ? "shadow-green-800/50"
                        : "shadow-green-500/50"
                    } hover:shadow-green-500/50 font-semibold rounded-full transition-all ease-in-out duration-300`}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelClick}
                    className={`text-lg px-4 sm:px-8 py-2 sm:py-3 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-red-700 to-red-600 hover:bg-gradient-to-l focus:ring-red-800 text-white"
                        : "bg-gradient-to-r from-red-500 to-red-400 hover:bg-gradient-to-l focus:ring-red-300 text-gray-800"
                    } shadow-lg ${
                      theme === "dark"
                        ? "shadow-red-800/50"
                        : "shadow-red-500/50"
                    } hover:shadow-red-500/50 font-semibold rounded-full transition-all ease-in-out duration-300`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className={`text-lg px-4 sm:px-8 py-2 sm:py-3 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-red-700 to-red-600 hover:bg-gradient-to-l focus:ring-red-800 text-white"
                        : "bg-gradient-to-r from-red-500 to-red-400 hover:bg-gradient-to-l focus:ring-red-300 text-gray-800"
                    } shadow-lg ${
                      theme === "dark"
                        ? "shadow-red-800/50"
                        : "shadow-red-500/50"
                    } hover:shadow-red-500/50 font-semibold rounded-full transition-all ease-in-out duration-300`}
                  >
                    Delete
                  </button>
                </div>
              )}
            </animated.div>{" "}
          </animated.div>
        </animated.div>
        <ConfirmationModal
          isOpen={showConfirmation}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          confirmationQuestion="Are you sure you want to delete this ticket?"
          actionButtonLabel="Delete"
        />
        <ConfirmationModal
          isOpen={showBillingConfirmation}
          onConfirm={handleBillConfirm}
          onCancel={handleBillCancel}
          confirmationQuestion="Are you sure you want to mark this ticket as billed?"
          actionButtonLabel="Bill"
        />
      </animated.main>

      <style jsx>{`
        :root {
          --btn-bg-light: #f0f0f0; /* Light theme button background */
          --btn-text-light: #333; /* Light theme button text */
          --btn-bg-dark: #333; /* Dark theme button background */
          --btn-text-dark: #f0f0f0; /* Dark theme button text */
        }
        .dark-theme {
          --btn-bg: var(--btn-bg-dark);
          --btn-text: var(--btn-text-dark);
        }
        .light-theme {
          --btn-bg: var(--btn-bg-light);
          --btn-text: var(--btn-text-light);
        }
      `}</style>
    </>
  );
};

export default ViewFieldTicket;
