import React, { useState, useEffect } from "react";
import { animated } from "react-spring";
import Modal from "react-modal";
import { useTheme } from "./ThemeContext";

const PrintSection = ({
  userRole,
  ticket,
  theme,
  buttonAnimation,
  isEditing,
  uploadedImages,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [printSelections, setPrintSelections] = useState({
    head: true,
    items: true,
    image: true,
  });

  const openPrintModal = () => setModalIsOpen(true);

  const closePrintModal = () => setModalIsOpen(false);
  const handleCheckboxChange = (e) =>
    setPrintSelections({
      ...printSelections,
      [e.target.name]: e.target.checked,
    });

  const handlePrint = () => {
    const isSinglePageLayout =
      ticket.Items.length <= 9 && uploadedImages.length <= 1;
    const printWindow = window.open("", "", "height=600,width=800");

    printWindow.document.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              body, html {
                margin: 0; padding: 0; width: 100%; height: 100%;
                font-family: 'Arial', sans-serif; color: #333;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
                background-color: #f3f4f6;
              }
              .header {
                width: 100%; padding: 15px; text-align: center;
                background-color: #4a90e2; color: #fff; font-size: 20px;
                border-bottom: 2px solid #ddd;
              }
              .content {
                width: 100%; max-width: 800px; margin: 20px auto; padding: 20px;
                background: #fff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); border-radius: 10px;
                flex: 1;
              }
              .section {
                margin-bottom: 20px;
              }
              .section h2 {
                font-size: 18px; margin-bottom: 10px; color: #4a90e2; border-bottom: 1px solid #ddd; padding-bottom: 10px;
              }
              .section div {
                font-size: 14px; margin: 10px 0;
              }
              .net-cost {
                text-align: center; font-size: 16px; font-weight: bold; margin-top: 20px;
              }
              .items {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: ${isSinglePageLayout ? "10px" : "15px"};
                margin-bottom: 20px;
              }
              .item {
                background-color: #fafafa;
                padding: ${isSinglePageLayout ? "10px" : "15px"};
                border-radius: 10px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease;
              }
              .item:hover {
                transform: scale(1.05);
              }
              .item h4 {  
                margin-bottom: 10px; font-size: 14px; font-weight: bold; color: #333;
              }
              .item p {
                margin: 0; font-size: 12px; color: #555;
              }
              img {
                max-width: 100%; max-height: 300px; margin: 20px auto; display: block; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                page-break-inside: avoid;
              }
              .footer {
                width: 100%; padding: 10px; text-align: center;
                font-size: 12px; color: #555; border-top: 1px solid #ddd;
              }
              .image-header {
                width: 100%; padding: 10px; text-align: center; font-size: 16px; color: #333;
                background-color: #eef2f7; border-bottom: 1px solid #ddd; margin-top: 20px;
              }
              .page-break {
                page-break-before: always;
              }
              @page {
                size: A4;
                margin: 10mm;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                  -webkit-print-color-adjust: exact;
                  background-color: #fff;
                }
                .header {
                  background-color: #4a90e2;
                  color: #fff;
                }
                .content {
                  box-shadow: none;
                  border-radius: 0;
                }
                .footer {
                  position: fixed;
                  bottom: 0;
                  width: 100%;
                  text-align: center;
                }
                .page-break {
                  page-break-before: always;
                }
                @page {
                  margin: 0;
                }
                body::after {
                  content: '';
                  display: block;
                  page-break-after: always;
                  visibility: hidden;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              OgFieldTicket
            </div>
            <div class="content">
              ${
                printSelections.head
                  ? `
                <div class="section">
                  <h2>Ticket Information</h2>
                  <div><strong>Date:</strong> ${new Date(
                    ticket.TicketDate
                  ).toLocaleDateString()}</div>
                  <div><strong>Lease/User:</strong> ${
                    ticket.LeaseName || "N/A"
                  } / ${ticket.UserID || "N/A"}</div>
                  <div><strong>Well:</strong> ${ticket.WellID || "N/A"}</div>
                  <div><strong>Ticket Type:</strong> ${
                    ticket.JobDescription || "N/A"
                  }</div>
                  <div><strong>Ticket Number:</strong> ${
                    ticket.Ticket || "N/A"
                  }</div>
                  <div><strong>Billed:</strong> ${ticket.Billed || "N/A"}</div>
                </div>
              `
                  : ""
              }
              ${
                printSelections.items
                  ? `
                <div class="section net-cost">
                  Net Cost: $${ticket.Items?.reduce(
                    (sum, item) => sum + (Number(item.totalCost) || 0),
                    0
                  ).toFixed(2)}
                </div>
                <div class="items">
                  ${ticket?.Items?.map(
                    (item) => `
                    <div class="item">
                      <h4>${item.ItemDescription}</h4>
                      <p>Qty: ${item.Quantity}</p>
                      <p>Total Cost: $${item.totalCost}</p>
                    </div>
                  `
                  ).join("")}
                </div>
              `
                  : ""
              }
              ${
                !isSinglePageLayout &&
                printSelections.image &&
                uploadedImages.length > 0
                  ? `
                <div class="page-break"></div>
              `
                  : ""
              }
              ${
                printSelections.image && uploadedImages.length > 1
                  ? `
                <div class="image-header">
                  Uploaded Images
                </div>
                ${uploadedImages
                  ?.map(
                    (image, index) =>
                      `<img src="${image}" alt="Uploaded Image ${index + 1}" />`
                  )
                  .join("")}
              `
                  : printSelections.image && uploadedImages.length === 1
                  ? `
                <div class="image-header">
                  Uploaded Image
                </div>
                <img src="${uploadedImages[0]}" alt="Uploaded Image" />
              `
                  : ""
              }
            </div>
            <div class="footer">
              OgEndeavors, LLC, PO Box 7091, Abilene, TX 79608
            </div>
          </body>
        </html>
      `);
    printWindow.document.close();

    printWindow.onload = () => printWindow.print();
  };

  return (
    <div className="flex items-center justify-center">
      <animated.div style={buttonAnimation} className="w-full sm:w-auto">
        {!isEditing && userRole !== "P" && (
          <button
            onClick={openPrintModal}
            className={`w-full sm:w-auto px-6 py-3 font-semibold rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 ${
              theme === "dark"
                ? "bg-blue-600 hover:bg-blue-700 text-gray-200"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            Print
          </button>
        )}
      </animated.div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closePrintModal}
        contentLabel="Print Options"
        className={`modal-content rounded-lg shadow-xl p-8 max-w-lg w-full ${
          theme === "dark"
            ? "bg-gray-800 text-gray-100"
            : "bg-white text-gray-900"
        } transform transition-transform duration-300 ease-in-out ${
          modalIsOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        overlayClassName="modal-overlay fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center transition-opacity duration-300"
      >
        <h2 className="text-2xl font-bold mb-6 text-center border-b pb-4">
          Print Options
        </h2>
        <form className="space-y-6">
          <label className="flex items-center space-x-4">
            <input
              type="checkbox"
              name="head"
              checked={printSelections.head}
              onChange={handleCheckboxChange}
              className={`form-checkbox h-5 w-5 rounded ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              }`}
            />
            <span className="text-lg">Head</span>
          </label>
          <label className="flex items-center space-x-4">
            <input
              type="checkbox"
              name="items"
              checked={printSelections.items}
              onChange={handleCheckboxChange}
              className={`form-checkbox h-5 w-5 rounded ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              }`}
            />
            <span className="text-lg">Items</span>
          </label>
          <label className="flex items-center space-x-4">
            <input
              type="checkbox"
              name="image"
              checked={printSelections.image}
              onChange={handleCheckboxChange}
              className={`form-checkbox h-5 w-5 rounded ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              }`}
            />
            <span className="text-lg">Image</span>
          </label>
        </form>
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={handlePrint}
            className={`px-6 py-3 rounded-lg transition-transform duration-300 text-lg font-semibold ${
              theme === "dark"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } transform hover:scale-105 shadow-md`}
          >
            Print
          </button>
          <button
            onClick={closePrintModal}
            className={`px-6 py-3 rounded-lg transition-transform duration-300 text-lg font-semibold ${
              theme === "dark"
                ? "bg-gray-600 text-white hover:bg-gray-700"
                : "bg-gray-300 text-gray-800 hover:bg-gray-400"
            } transform hover:scale-105 shadow-md`}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PrintSection;
