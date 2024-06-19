import React, { useState, useEffect, useRef } from "react";
import { useSpring, animated } from "react-spring";
import Modal from "react-modal";
import axios from "axios";
import { useTheme } from "./ThemeContext";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSave,
  faTimes,
  faFileExport,
  faPrint,
} from "@fortawesome/free-solid-svg-icons";
import "tailwindcss/tailwind.css";

// Import ag-grid-enterprise package
import "ag-grid-enterprise";

Modal.setAppElement("#root");

const MasterList = () => {
  const { theme } = useTheme();
  const [data, setData] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    item_description: "",
    uom: "",
    use_quantity: "N",
    use_cost: "N",
  });

  const gridApiRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      const baseUrl =
        parts.length > 2
          ? `https://${parts.shift()}.ogfieldticket.com`
          : "https://test.ogfieldticket.com";

      const response = await axios.get(
        `${baseUrl}/api/jobitem.php?item_types=true`
      );
      if (response.data.success) {
        setData(response.data.itemTypes);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const tableAnimation = useSpring({
    to: { opacity: 1, transform: "translateY(0)" },
    from: { opacity: 0, transform: "translateY(-20px)" },
    config: { tension: 220, friction: 20 },
  });

  const openModal = (item) => {
    setSelectedItem(item);
    setFormData({
      item_description: item.ItemDescription,
      uom: item.UOM,
      use_quantity: item.UseQuantity,
      use_cost: item.UseCost,
    });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedItem(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      const baseUrl =
        parts.length > 2
          ? `https://${parts.shift()}.ogfieldticket.com`
          : "https://test.ogfieldticket.com";

      const response = await axios.patch(`${baseUrl}/api/jobitem.php`, {
        item_id: selectedItem.ItemID,
        ...formData,
      });
      if (response.data.success) {
        fetchData();
        closeModal();
      } else {
        console.error("Error updating item", response.data.message);
      }
    } catch (error) {
      console.error("Error updating item", error);
    }
  };

  const tableClass =
    theme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine";
  const modalBgClass =
    theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black";
  const inputClass =
    theme === "dark"
      ? "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-900 text-white"
      : "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline";

  const columnDefs = [
    {
      headerName: "Item ID",
      field: "ItemID",
      pinned: "left",
      editable: false,
      cellRenderer: "agGroupCellRenderer",
    },
    {
      headerName: "Description",
      field: "ItemDescription",
      editable: true,
      cellClass: "custom-cell",
    },
    { headerName: "UOM", field: "UOM", editable: true },
    {
      headerName: "Use Qty",
      field: "UseQuantity",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: ["Y", "N"] },
    },
    {
      headerName: "Use Cost",
      field: "UseCost",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: ["Y", "N"] },
    },
  ];

  const onCellValueChanged = async (params) => {
    const updatedData = {
      item_id: params.data.ItemID,
      item_description: params.data.ItemDescription,
      uom: params.data.UOM,
      use_quantity: params.data.UseQuantity,
      use_cost: params.data.UseCost,
    };

    try {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      const baseUrl =
        parts.length > 2
          ? `https://${parts.shift()}.ogfieldticket.com`
          : "https://test.ogfieldticket.com";

      await axios.patch(`${baseUrl}/api/jobitem.php`, updatedData);
      fetchData();
    } catch (error) {
      console.error("Error updating item", error);
    }
  };

  const onExportClick = () => {
    const params = {
      fileName: "master-list.csv",
    };
    gridApiRef.current.exportDataAsCsv(params);
  };

  const onPrintClick = async () => {
    try {
      const allRowData = [];
      gridApiRef.current.forEachNode((node) => allRowData.push(node.data));

      const printWindow = window.open("", "", "width=800,height=600");

      const gridHtml = `
        <table style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              ${columnDefs
                .map(
                  (col) =>
                    `<th style="border: 1px solid black; padding: 8px;">${col.headerName}</th>`
                )
                .join("")}
            </tr>
          </thead>
          <tbody>
            ${allRowData
              .map(
                (row) => `
              <tr>
                ${columnDefs
                  .map(
                    (col) =>
                      `<td style="border: 1px solid black; padding: 8px;">${
                        row[col.field]
                      }</td>`
                  )
                  .join("")}
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `;

      printWindow.document.write(`
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 10px;
              }
            </style>
          </head>
          <body>
            ${gridHtml}
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = window.close;
              };
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();
    } catch (error) {
      console.error("Error preparing data for print", error);
    }
  };

  const onGridReady = (params) => {
    gridApiRef.current = params.api;
    params.api.sizeColumnsToFit();
  };

  return (
    <animated.div style={tableAnimation} className="mt-8">
      <div
        className={`bg-gradient-to-r ${
          theme === "dark"
            ? "from-gray-900 to-gray-800 text-white"
            : "from-white to-gray-100 text-black"
        } shadow-xl rounded-lg overflow-hidden ${tableClass}`}
      >
        <div className="p-5 text-center bg-gray-50 dark:bg-gray-700 dark:text-white">
          <h2 className="text-4xl font-bold">Master List</h2>
        </div>
        <div className="flex justify-end p-4">
          <button
            onClick={onExportClick}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
          >
            <FontAwesomeIcon icon={faFileExport} className="mr-2" />
            Export
          </button>
          <button
            onClick={onPrintClick}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            <FontAwesomeIcon icon={faPrint} className="mr-2" />
            Print
          </button>
        </div>
        <div
          className={`ag-theme-alpine min-w-full ${tableClass}`}
          style={{ height: 800 }}
        >
          <AgGridReact
            columnDefs={columnDefs}
            rowData={data}
            context={{ openModal }}
            defaultColDef={{
              flex: 1,
              minWidth: 100,
              sortable: true,
              filter: true,
              editable: true,
              floatingFilter: true,
              resizable: true,
            }}
            pagination={true}
            paginationPageSize={15}
            enableRangeSelection={true}
            suppressRowClickSelection={true}
            onGridReady={onGridReady}
            onCellValueChanged={onCellValueChanged}
          />
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="fixed inset-0 flex items-center justify-center p-4 mt-16"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div
          className={`rounded-lg overflow-hidden shadow-2xl max-w-md w-full p-6 ${modalBgClass}`}
        >
          <h2 className="text-3xl mb-4 font-semibold">Edit Item</h2>
          {selectedItem && (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="item_description"
                >
                  Description
                </label>
                <input
                  id="item_description"
                  name="item_description"
                  type="text"
                  value={formData.item_description}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="uom">
                  UOM
                </label>
                <input
                  id="uom"
                  name="uom"
                  type="text"
                  value={formData.uom}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="use_quantity"
                >
                  Use Quantity
                </label>
                <select
                  id="use_quantity"
                  name="use_quantity"
                  value={formData.use_quantity}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="use_cost"
                >
                  Use Cost
                </label>
                <select
                  id="use_cost"
                  name="use_cost"
                  value={formData.use_cost}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="ml-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      <style jsx>{`
        .custom-cell {
          font-weight: bold;
          font-style: italic;
        }
      `}</style>
    </animated.div>
  );
};

export default MasterList;
