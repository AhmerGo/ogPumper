import React, { useState, useEffect, useRef } from "react";
import { useSpring, animated } from "react-spring";
import Modal from "react-modal";
import axios from "axios";
import { useTheme } from "ogcommon";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faTimes,
  faFileExport,
  faPrint,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import "tailwindcss/tailwind.css";
import { baseUrl } from "./config";

Modal.setAppElement("#root");

const MasterList = () => {
  const { theme } = useTheme();
  const [data, setData] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Include the new field `use_start_stop` in our formData state.
  const [formData, setFormData] = useState({
    item_id: "",
    item_description: "",
    uom: "",
    use_quantity: "N",
    use_cost: "N",
    use_start_stop: "N", // NEW FIELD
    active: "Y",
    defaultCost: 0,
  });

  const gridApiRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // GET all from ItemTypes (including defaultCost and UseStartStop)
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

  /**
   * Open the modal to edit an existing item
   */
  const openModal = (item) => {
    setSelectedItem(item);
    setFormData({
      item_id: item.ItemID,
      item_description: item.ItemDescription,
      uom: item.UOM,
      use_quantity: item.UseQuantity,
      use_cost: item.UseCost,
      use_start_stop: item.UseStartStop, // Carry over from DB
      active: item.Active,
      defaultCost: item.defaultCost || 0,
    });
    setModalIsOpen(true);
  };

  /**
   * Open the modal to add a new item
   */
  const openAddModal = () => {
    setSelectedItem(null);
    setFormData({
      item_id: "",
      item_description: "",
      uom: "",
      use_quantity: "N",
      use_cost: "N",
      use_start_stop: "N", // default
      active: "Y",
      defaultCost: 0,
    });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedItem(null);
  };

  /**
   * Handle changes on form fields
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle form submission:
   * - if selectedItem != null => PATCH
   * - else => POST
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      item_id: formData.item_id.trim(),
      item_description: formData.item_description,
      uom: formData.uom,
      use_quantity: formData.use_quantity,
      use_cost: formData.use_cost,
      use_start_stop: formData.use_start_stop, // pass the new field
      active: formData.active,
      defaultCost: formData.defaultCost,
    };

    try {
      const method = selectedItem ? axios.patch : axios.post;
      const response = await method(`${baseUrl}/api/jobitem.php`, payload);
      if (response.data.success) {
        fetchData();
        closeModal();
      } else {
        console.error("Error saving item", response.data.message);
      }
    } catch (error) {
      console.error("Error saving item", error);
    }
  };

  const tableClass =
    theme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine";
  const modalBgClass =
    theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black";
  const inputClass =
    theme === "dark"
      ? "shadow appearance-none border rounded w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
      : "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline";

  /**
   * The columns for the grid – now including UseStartStop
   * Description column auto‑expands; Use* columns have fixed narrow widths.
   */
  const columnDefs = [
    {
      headerName: "Item ID",
      field: "ItemID",
      pinned: "left",
      editable: false,
      cellRenderer: "agGroupCellRenderer",
      minWidth: 160,
      flex: 2,
    },
    {
      headerName: "Description",
      field: "ItemDescription",
      editable: true,
      flex: 2,
      minWidth: 260,
      cellClass: "custom-cell",
    },
    {
      headerName: "UOM",
      field: "UOM",
      editable: true,
      width: 100,
    },
    {
      headerName: "Qty",
      field: "UseQuantity",
      editable: true,
      maxWidth: 45,
      maxWidth: 90,
      flex: 0,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: ["Y", "N"] },
    },
    {
      headerName: "Cost",
      field: "UseCost",
      editable: true,
      width: 45,
      maxWidth: 90,
      flex: 0,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: ["Y", "N"] },
    },
    {
      headerName: "Hours",
      field: "UseStartStop",
      editable: true,
      width: 90,
      maxWidth: 90,
      flex: 0,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: ["Y", "N"] },
    },
    {
      headerName: "Active",
      field: "Active",
      editable: true,
      width: 100,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: ["Y", "N"] },
    },
    {
      headerName: "Cost",
      field: "defaultCost",
      editable: true,
      width: 130,
      cellStyle: { textAlign: "right" },
      valueFormatter: (params) => {
        const value = parseFloat(params.value);
        if (isNaN(value)) return "";
        return `$${value.toFixed(2)}`;
      },
    },
  ];

  /**
   * Called when a cell's value is changed in the grid
   */
  const onCellValueChanged = async (params) => {
    const updatedData = {
      item_id: params.data.ItemID,
      item_description: params.data.ItemDescription,
      uom: params.data.UOM,
      use_quantity: params.data.UseQuantity,
      use_cost: params.data.UseCost,
      use_start_stop: params.data.UseStartStop,
      active: params.data.Active,
      defaultCost: params.data.defaultCost,
    };

    try {
      const response = await axios.patch(
        `${baseUrl}/api/jobitem.php`,
        updatedData
      );
      if (!response.data.success) {
        console.error("Error updating item", response.data.message);
      }
      fetchData();
    } catch (error) {
      console.error("Error updating item", error);
    }
  };

  /**
   * Export the grid data to CSV
   */
  const onExportClick = () => {
    const currentDate = new Date().toISOString().slice(0, 10);
    const params = {
      fileName: `master-list-${currentDate}.csv`,
    };
    gridApiRef.current.exportDataAsCsv(params);
  };

  /**
   * Print the grid data
   */
  const onPrintClick = async () => {
    try {
      const allRowData = [];
      gridApiRef.current.forEachNode((node) => allRowData.push(node.data));

      const printWindow = window.open("", "", "width=800,height=600");

      // Build the table with the currency format for the defaultCost column
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
              .map((row) => {
                return `
              <tr>
                ${columnDefs
                  .map((col) => {
                    if (col.field === "defaultCost") {
                      const val = parseFloat(row[col.field]);
                      const formattedVal = !isNaN(val)
                        ? "$" + val.toFixed(2)
                        : "";
                      return `<td style="border: 1px solid black; padding: 8px; text-align:right;">${formattedVal}</td>`;
                    } else {
                      return `<td style="border: 1px solid black; padding: 8px;">${
                        row[col.field] != null ? row[col.field] : ""
                      }</td>`;
                    }
                  })
                  .join("")}
              </tr>
            `;
              })
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

  /**
   * Grid is ready
   */
  const onGridReady = (params) => {
    gridApiRef.current = params.api;
    params.api.sizeColumnsToFit();

    // Auto‑size Description to content after initial fit.
    setTimeout(() => {
      const descCol = params.columnApi.getColumn("ItemDescription");
      if (descCol) params.columnApi.autoSizeColumn(descCol);
    }, 0);
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
          <h2 className="text-4xl font-bold">Items Masterlist</h2>
        </div>

        {/* Top‑right buttons */}
        <div className="flex flex-wrap gap-2 justify-end p-4">
          <button
            onClick={openAddModal}
            className="flex items-center bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Item
          </button>

          <button
            onClick={onExportClick}
            className="flex items-center bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            <FontAwesomeIcon icon={faFileExport} className="mr-2" />
            Export
          </button>

          <button
            onClick={onPrintClick}
            className="flex items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            <FontAwesomeIcon icon={faPrint} className="mr-2" />
            Print
          </button>
        </div>

        {/* The AG Grid */}
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
              minWidth: 90,
              sortable: true,
              filter: true,
              editable: true,
              floatingFilter: true,
              resizable: true,
            }}
            pagination={true}
            paginationPageSize={100}
            enableRangeSelection={true}
            suppressRowClickSelection={true}
            onGridReady={onGridReady}
            onCellValueChanged={onCellValueChanged}
            onRowDoubleClicked={(event) => openModal(event.data)}
          />
        </div>
      </div>

      {/* Modal for Add/Edit */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="fixed inset-0 flex items-center justify-center p-4 mt-16"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div
          className={`rounded-lg overflow-hidden shadow-2xl max-w-md w-full p-6 ${modalBgClass}`}
        >
          <h2 className="text-3xl mb-4 font-semibold">
            {selectedItem ? "Edit Item" : "Add New Item"}
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Item ID (only for new) */}
            {!selectedItem && (
              <div className="mb-4">
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="item_id"
                >
                  Item ID
                </label>
                <input
                  id="item_id"
                  name="item_id"
                  type="text"
                  value={formData.item_id}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            )}

            {/* Description */}
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
                required
              />
            </div>

            {/* UOM */}
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

            {/* Use Quantity */}
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

            {/* Use Cost */}
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

            {/* Use StartStop (New Field) */}
            <div className="mb-4">
              <label
                className="block text-sm font-bold mb-2"
                htmlFor="use_start_stop"
              >
                Use StartStop
              </label>
              <select
                id="use_start_stop"
                name="use_start_stop"
                value={formData.use_start_stop}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>

            {/* Active */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="active">
                Active
              </label>
              <select
                id="active"
                name="active"
                value={formData.active}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>

            {/* Default Cost */}
            <div className="mb-6">
              <label
                className="block text-sm font-bold mb-2"
                htmlFor="defaultCost"
              >
                Default Cost
              </label>
              <input
                id="defaultCost"
                name="defaultCost"
                type="number"
                step="0.01"
                value={formData.defaultCost}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="flex items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {selectedItem ? "Save" : "Add"}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="flex items-center bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                Cancel
              </button>
            </div>
          </form>
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
