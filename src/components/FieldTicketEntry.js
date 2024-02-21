import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function FieldTicketEntry() {
  const { state } = useLocation();
  const { ticketDate, lease, well, ticketType, ticketNumber } = state;
  const navigate = useNavigate();

  const [items, setItems] = useState([
    { id: 1, name: "ACID PUMP CHARGE", quantity: 0, unit: "", notes: "" },
    { id: 2, name: "ACID (10%)", quantity: 0, unit: "", notes: "" },
    // Additional items...
    { id: 10, name: "WATER", quantity: 0, unit: "gal", notes: "" },
    { id: 11, name: "WATER TRUCK", quantity: 0, unit: "", notes: "" },
    {
      id: 12,
      name: "OPERATOR TRUCK MILEAGE",
      quantity: 0,
      unit: "miles",
      notes: "",
    },
    // More items as needed...
  ]);

  const handleItemChange = (itemId, field, value) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const formattedDate = ticketDate
    ? new Date(ticketDate).toLocaleDateString()
    : "N/A";

  const handleFinalSubmit = () => {
    console.log("Submitting:", {
      ticketDate,
      lease,
      well,
      ticketType,
      ticketNumber,
      items,
    });

    // // Reset states to their initial values
    // setTicketDate(new Date()); // Reset to today or a specific date if needed
    // setLease(""); // Reset lease
    // setWell(""); // Reset well if it's part of this component's state
    // setTicketType(""); // Reset ticket type
    // setTicketNumber(undefined); // Reset ticket number

    setItems([
      // Reset items array to its initial state
      { id: 1, name: "ACID PUMP CHARGE", quantity: 0, unit: "", notes: "" },
      { id: 2, name: "ACID (10%)", quantity: 0, unit: "", notes: "" },
      // Include all initial items here...
    ]);

    // Navigate back to the home page or the starting point of the form
    navigate("/home");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-900 p-6">
      <div className="w-full max-w-6xl mx-auto bg-white/90 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden">
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
                {lease || "N/A"}
              </span>
            </p>
            <p className="text-indigo-600">
              Well:{" "}
              <span className="font-semibold text-gray-800">
                {state.well || "N/A"}
              </span>
            </p>
            <p className="text-indigo-600">
              Ticket Type:{" "}
              <span className="font-semibold text-gray-800">
                {ticketType || "N/A"}
              </span>
            </p>
            <p className="text-indigo-600">
              Ticket Number:{" "}
              <span className="font-semibold text-gray-800">
                {ticketNumber || "N/A"}
              </span>
            </p>
          </div>

          {items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row gap-6 items-center bg-gray-100 p-4 rounded-lg mb-4"
            >
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-700">
                  {item.name}{" "}
                  {item.unit && (
                    <span className="text-sm text-gray-500">({item.unit})</span>
                  )}
                </h4>
              </div>
              <div className="w-full md:w-auto flex gap-4 items-center">
                <label className="block text-gray-600 font-medium">Qty:</label>
                <input
                  type="number"
                  name="quantity"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(item.id, "quantity", e.target.value)
                  }
                  className="form-input w-24 px-4 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="0"
                />
                <label className="block text-gray-600 font-medium">
                  Notes:
                </label>
                <input
                  type="text"
                  name="notes"
                  value={item.notes}
                  onChange={(e) =>
                    handleItemChange(item.id, "notes", e.target.value)
                  }
                  className="form-input w-full md:w-96 px-4 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Add notes"
                />
              </div>
            </div>
          ))}

          <div className="text-center mt-12">
            <button
              onClick={handleFinalSubmit}
              className="text-lg px-10 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:bg-gradient-to-l focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 hover:shadow-indigo-500/50 text-white font-semibold rounded-full transition-all ease-in-out duration-300"
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
