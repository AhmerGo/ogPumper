import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function FieldTicketEntry() {
  const { state } = useLocation();
  const { ticketType } = state;

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

      const response = await fetch(
        "https://ogfieldticket.com/api/tickets.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formFields,
            JobTypeID: jobTypeID, // Include the job type ID in the request body
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
                {formFields.lease || "N/A"}
              </span>
            </p>
            <p className="text-indigo-600">
              Well:{" "}
              <span className="font-semibold text-gray-800">
                {formFields.well || "N/A"}
              </span>
            </p>
            <p className="text-indigo-600">
              Ticket Type:{" "}
              <span className="font-semibold text-gray-800">
                {formFields.ticketType || "N/A"}
              </span>
            </p>
            <p className="text-indigo-600">
              Ticket Number:{" "}
              <span className="font-semibold text-gray-800">
                {formFields.ticketNumber || "N/A"}
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
                  {item.ItemDescription}{" "}
                  {item.UOM && (
                    <span className="text-sm text-gray-500">({item.UOM})</span>
                  )}
                </h4>
              </div>
              <div className="w-full md:w-auto flex gap-4 items-center">
                <label className="block text-gray-600 font-medium">Qty:</label>
                <input
                  type="number"
                  name="quantity"
                  value={item.quantity || 0}
                  onChange={(e) => handleChange(e, item.JobItemID)}
                  className="form-input w-24 px-4 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="0"
                />
                <label className="block text-gray-600 font-medium">
                  Notes:
                </label>
                <input
                  type="text"
                  name="notes"
                  value={item.notes || ""}
                  onChange={(e) => handleChange(e, item.JobItemID)}
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
