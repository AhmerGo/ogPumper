import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ViewFieldTicket = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [formattedDate, setFormattedDate] = useState("");
  const [isEditing, setIsEditing] = useState(false);

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
    // Reset the ticket state to the original values
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

      if (response.ok) {
        // Update successful, navigate back to the ticket list
        navigate("/home");
      } else {
        // Handle error scenario
        console.error("Error updating ticket:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  const handleDeleteClick = async () => {
    try {
      const response = await fetch(
        `https://ogfieldticket.com/api/tickets.php?ticket=${ticket.Ticket}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Deletion successful, navigate back to the ticket list
        navigate("/home");
      } else {
        // Handle error scenario
        console.error("Error deleting ticket:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  if (!ticket) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-900 p-6">
      <div className="w-full max-w-6xl mx-auto bg-white/90 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden">
        <button
          onClick={() => navigate("/home")}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
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

        <div className="px-10 py-8">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-10 text-center">
            Field Ticket Entry Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-lg mb-8">
            <p className="text-indigo-600">
              Date:{" "}
              <span className="font-semibold text-gray-800">
                {formattedDate}
              </span>
            </p>
            <p className="text-indigo-600">
              Lease:{" "}
              <span className="font-semibold text-gray-800">
                {ticket.LeaseID || "N/A"}
              </span>
            </p>
            <p className="text-indigo-600">
              Well:{" "}
              <span className="font-semibold text-gray-800">
                {ticket.WellID || "N/A"}
              </span>
            </p>
            <p className="text-indigo-600">
              Ticket Type:{" "}
              <span className="font-semibold text-gray-800">
                {ticket.JobDescription || "N/A"}
              </span>
            </p>
            <p className="text-indigo-600">
              Ticket Number:{" "}
              <span className="font-semibold text-gray-800">
                {ticket.Ticket || "N/A"}
              </span>
            </p>
          </div>
          {ticket.Items &&
            ticket.Items.map((item) => (
              <div
                key={item.TicketLine}
                className="flex flex-col md:flex-row gap-6 items-center bg-gray-100 p-4 rounded-lg mb-4"
              >
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-700">
                    {item.ItemDescription}{" "}
                    {item.UOM && (
                      <span className="text-sm text-gray-500">
                        ({item.UOM})
                      </span>
                    )}
                  </h4>
                </div>
                <div className="w-full md:w-auto flex gap-4 items-center">
                  {isEditing ? (
                    <>
                      <label className="block text-gray-600 font-medium">
                        Qty:
                      </label>
                      <input
                        type="number"
                        name="Quantity"
                        value={item.Quantity}
                        onChange={(e) => handleChange(e, item.TicketLine)}
                        className="form-input w-24 px-4 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="0"
                      />
                      <label className="block text-gray-600 font-medium">
                        Notes:
                      </label>
                      <input
                        type="text"
                        name="Note"
                        value={item.Note || ""}
                        onChange={(e) => handleChange(e, item.TicketLine)}
                        className="form-input w-full md:w-96 px-4 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Add notes"
                      />
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600">
                        <span className="font-medium">Qty:</span>{" "}
                        {item.Quantity}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Notes:</span>{" "}
                        {item.Note || "N/A"}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          <div className="text-center mt-12">
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
          </div>
        </div>
      </div>
    </main>
  );
};
export default ViewFieldTicket;
