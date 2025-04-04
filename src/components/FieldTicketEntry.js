import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import { useUser, useTheme } from "ogcommon";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearchPlus,
  faTrashAlt,
  faCamera,
  faFolderOpen,
  faPlusCircle,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { baseUrl } from "./config";

/**
 * FieldTicketEntry
 * Allows creating a brand new Field Ticket with item selection,
 * quantity or Start/Stop times, note, and optional images.
 * If an item has UseStartStop === 'Y', we display two date/time inputs for Start/Stop.
 */
function FieldTicketEntry() {
  const { state } = useLocation();
  const { ticketType } = state; // from the route
  const { theme } = useTheme();
  const { userID } = useUser();

  // Subdomain / environment
  const [subdomain, setSubdomain] = useState("");

  // Image states
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Loading & connectivity
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Scroll management
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollButtonRef = useRef(null);

  // GPS location (captured at submission)
  const [gpsLocation, setGpsLocation] = useState(null);

  // For file input
  const fileInputRef = useRef(null);
  const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6 MB

  const navigate = useNavigate();

  // Basic fields for the new ticket
  const [formFields, setFormFields] = useState({
    leaseID: state?.leaseID || "",
    ticketDate: state?.ticketDate || "",
    lease: state?.lease || "",
    well: state?.well || "",
    ticketType: state?.ticketType || "",
    ticketNumber: (state?.highestTicketNumber || "").toString(),
    note: state?.noteDefault || "",
    jobTypeID: state?.jobTypeID || "",
  });

  // The item arrays
  const [items, setItems] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [ticketTypes, setTicketTypes] = useState([]); // If you need to store them

  // =============================
  //    EFFECTS
  // =============================
  // Grab subdomain
  useEffect(() => {
    const extractSubdomain = () => {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      if (parts.length > 2) {
        setSubdomain(parts.shift());
      } else {
        setSubdomain("");
      }
    };
    extractSubdomain();
    window.scrollTo(0, 0);
  }, []);

  // Listen for online/offline changes
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  // Fetch item types & items for the current job type
  useEffect(() => {
    const fetchItems = async () => {
      try {
        // get all job definitions
        const response = await fetch(`${baseUrl}/api/jobs.php`);
        const data = await response.json();

        // find the job type that matches this ticketType
        const selectedType = data.find(
          (type) => type.Description === ticketType
        );

        // If found, store them
        if (selectedType && selectedType.Items) {
          // Initialize each item with potential Start/Stop fields if needed
          const initItems = selectedType.Items.map((it) => ({
            ...it,
            quantity: 0,
            start: null,
            stop: null,
          }));
          setItems(initItems);
        }
      } catch (error) {
        console.error("Error fetching job items:", error);
      }
    };

    const fetchItemTypes = async () => {
      try {
        // fetch item types (like a master list)
        const resp = await fetch(`${baseUrl}/api/jobitem.php?item_types=1`);
        const data = await resp.json();
        // filter out duplicates
        const filtered = (data.itemTypes || []).filter(
          (it) => !it.ItemID.match(/_[0-9]$/)
        );
        setItemTypes(filtered);
      } catch (error) {
        console.error("Error fetching item types:", error);
      }
    };

    fetchItems();
    fetchItemTypes();
  }, [ticketType, subdomain]);

  // =============================
  //    HELPERS
  // =============================
  // Convert ISO date string -> local "YYYY-MM-DDTHH:MM" for <input type="datetime-local">
  const toDatetimeLocalString = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000;
    const localTime = new Date(date - offset).toISOString().slice(0, 16);
    return localTime;
  };

  // =============================
  //    HANDLERS
  // =============================
  // For top-level note or item quantity
  const handleChange = (e, itemId) => {
    const { name, value } = e.target;

    if (name === "note") {
      setFormFields((prev) => ({ ...prev, note: value }));
      return;
    }

    // quantity changes
    if (name === "quantity") {
      const quantity = parseFloat(value) || 0;
      setItems((prevItems) =>
        prevItems.map((it) => (it.ItemID === itemId ? { ...it, quantity } : it))
      );
    }
  };

  // If item.UseStartStop is "Y", we handle start/stop changes
  const handleTimeFieldChange = (e, itemId, field) => {
    const rawValue = e.target.value; // "2025-03-21T14:30"
    const isoValue = rawValue ? new Date(rawValue).toISOString() : null;

    setItems((prevItems) =>
      prevItems.map((it) => {
        if (it.ItemID === itemId) {
          // If user tries to set Stop < Start, block it
          if (
            field === "stop" &&
            it.start &&
            isoValue &&
            new Date(isoValue) < new Date(it.start)
          ) {
            alert("Stop time cannot be before Start time!");
            return it; // Skip updating
          }
          return { ...it, [field]: isoValue };
        }
        return it;
      })
    );
  };

  // Adding an item from itemTypes
  const addItem = (itemID) => {
    const found = itemTypes.find((it) => it.ItemID === itemID);
    if (!found) return;

    setItems((prev) => [
      ...prev,
      {
        ...found,
        quantity: 0,
        start: null,
        stop: null,
        // ensure we keep the item’s potential UseStartStop
        UseStartStop: found.UseStartStop || "N",
      },
    ]);
    setSelectedItem("");
  };

  // Image-related
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setUploadedImages((prev) => [...prev, ...imageUrls]);
    onImageChange(event);
  };

  const onImageChange = (event) => {
    const files = event.target.files;
    if (!files) return;

    const valid = Array.from(files).filter((f) => f.size <= MAX_FILE_SIZE);
    if (valid.length !== files.length) {
      alert("Some files exceed the 6MB limit.");
    }
    if (valid.length > 0) {
      handleImageUpload({ target: { files: valid } });
    } else {
      fileInputRef.current.value = "";
    }
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    const newImages = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        newImages.push(URL.createObjectURL(file));
      }
    }
    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  const handleDeleteImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = (useCamera) => {
    if (fileInputRef.current) {
      if (useCamera) {
        fileInputRef.current.setAttribute("capture", "environment");
      } else {
        fileInputRef.current.removeAttribute("capture");
      }
      fileInputRef.current.click();
    }
  };

  const openModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  // Spring animation for the entire page
  const pageAnimation = useSpring({
    from: { opacity: 0, y: 50 },
    to: { opacity: 1, y: 0 },
    config: { mass: 1, tension: 280, friction: 25 },
  });

  // =============================
  //   Final submission
  // =============================
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1) Attempt geolocation
      let currentLocation = null;
      if ("geolocation" in navigator) {
        currentLocation = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              resolve({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              });
            },
            () => {
              resolve(null);
            }
          );
        });
      }
      setGpsLocation(currentLocation);

      // 2) Build the item array. We can choose to store item.start & item.stop
      const updatedItems = items.map((it, idx) => ({
        Active: it.Active || "Y",
        ItemCost: it.ItemCost || "0.00",
        ItemDescription: it.ItemDescription || "",
        ItemID: it.ItemID || "",
        ItemOrder: it.ItemOrder || idx.toString(),
        ItemQuantity: it.ItemQuantity || null,
        JobItemID: it.JobItemID || "",
        JobTypeID: formFields.jobTypeID || "",
        UOM: it.UOM || "",
        UseCost: it.UseCost || "Y",
        UseQuantity: it.UseQuantity || "Y",
        UseStartStop: it.UseStartStop || "N",

        // If your server expects these:
        start: it.start || null,
        stop: it.stop || null,

        quantity: it.quantity || 0,
      }));

      // 3) Format the date as YYYY-MM-DD
      const d = new Date(formFields.ticketDate);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      const formattedDate = d.toISOString().split("T")[0];

      // 4) Build final ticket data object
      const ticketData = {
        leaseID: formFields.leaseID,
        ticketDate: formattedDate,
        lease: formFields.lease,
        well: formFields.well,
        ticketType: formFields.ticketType,
        ticketNumber: formFields.ticketNumber,
        userID: userID,
        note: formFields.note,
        JobTypeID: formFields.jobTypeID,
        items: updatedItems,
        gps: currentLocation,
        lastUser: userID,
      };

      // (Optional) store offline
      const offlineItems = updatedItems.map((it, idx) => ({
        Active: it.Active || "Y",
        ItemCost: it.ItemCost,
        ItemDescription: it.ItemDescription,
        ItemID: it.ItemID,
        ItemOrder: it.ItemOrder,
        JobItemID: it.JobItemID,
        JobTypeID: it.JobTypeID,
        UOM: it.UOM,
        UseCost: it.UseCost,
        UseQuantity: it.UseQuantity,
        UseStartStop: it.UseStartStop,
        start: it.start,
        stop: it.stop,
        Quantity: it.quantity,
        Ticket: formFields.ticketNumber,
        TicketLine: idx.toString(),
        totalCost: (
          parseFloat(it.ItemCost) * parseFloat(it.quantity || 0)
        ).toFixed(2),
      }));

      const normalizedTicket = {
        Billed: "N",
        LeaseID: formFields.leaseID,
        TicketDate: formattedDate,
        LeaseName: formFields.lease,
        WellID: formFields.well || null,
        Comments: formFields.note || "",
        JobDescription: formFields.ticketType,
        JobTypeID: formFields.jobTypeID,
        Items: offlineItems,
        Note: formFields.note || "",
        UserID: userID,
        Ticket: formFields.ticketNumber,
        lastUser: userID,
      };

      const storeTicketLocally = (tktObj) => {
        const storedTickets = JSON.parse(localStorage.getItem("tickets")) || [];
        storedTickets.push(tktObj);
        localStorage.setItem("tickets", JSON.stringify(storedTickets));
      };
      storeTicketLocally(normalizedTicket);

      // 5) If you do chunked image upload, here's where you'd handle it...

      const chunkSize = 1024 * 1024; // 1 MB

      const uploadChunk = async (
        image,
        ticketNumber,
        imageIndex,
        chunk,
        chunkIndex,
        totalChunks
      ) => {
        const formData = new FormData();
        formData.append("ticketNumber", ticketNumber);
        formData.append("imageIndex", imageIndex);
        formData.append("chunkIndex", chunkIndex);
        formData.append("totalChunks", totalChunks);
        formData.append("chunk", chunk);

        const resp = await fetch(
          `${baseUrl}/api/tickets.php?upload_chunk=true`,
          {
            method: "POST",
            body: formData,
          }
        );
        return resp.json();
      };

      const uploadImageInChunks = async (image, ticketNumber, imageIndex) => {
        const resp = await fetch(image);
        const blob = await resp.blob();
        const totalChunks = Math.ceil(blob.size / chunkSize);

        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, blob.size);
          const chunk = blob.slice(start, end);
          await uploadChunk(
            image,
            ticketNumber,
            imageIndex,
            chunk,
            i,
            totalChunks
          );
        }
      };

      // Wait for all images to upload
      const promises = uploadedImages.map((img, idx) =>
        uploadImageInChunks(img, ticketData.ticketNumber, idx)
      );
      await Promise.all(promises);

      // 6) POST the main ticket data to the server
      const payload = {
        ticketData,
        images: uploadedImages.map((_, idx) => ({
          name: `uploads/ticket_${formFields.ticketNumber}/image_${idx}.jpg`,
        })),
      };

      const response = await fetch(`${baseUrl}/api/tickets.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        navigate("/home");
      } else {
        console.error("Error submitting ticket:", response.statusText);
      }
    } catch (err) {
      console.error("Error submitting ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create an ISO-based date from `ticketDate` for display
  const formattedDate = (() => {
    const date = new Date(formFields.ticketDate);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split("T")[0]; // e.g. "2025-03-21"
  })();

  // Scroll behavior (mobile)
  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    setIsScrolled(true);
  };
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsScrolled(false);
  };

  // =============================
  //   RENDER
  // =============================
  return (
    <animated.main
      style={pageAnimation}
      className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-900"
          : "bg-gradient-to-br from-white to-gray-100"
      } p-6 relative overflow-hidden`}
    >
      {loading ? (
        <div className="flex justify-center items-center fixed inset-0 z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* background gradient overlays */}
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

          {/* main container */}
          <div
            className={`w-full max-w-6xl mx-auto transition-colors duration-500 ${
              theme === "dark"
                ? "bg-gray-800/90 text-gray-100"
                : "bg-white/90 text-gray-800"
            } backdrop-blur-md rounded-xl shadow-2xl overflow-hidden z-10`}
          >
            {/* Home button */}
            <button
              onClick={() => navigate("/home")}
              className={`absolute top-5 right-5 p-2 rounded-full hover:bg-opacity-30 transition-all ${
                theme === "dark" ? "hover:bg-white" : "hover:bg-gray-400"
              }`}
            >
              <svg
                xmlns="https://www.w3.org/2000/svg"
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

            <div className="px-6 py-8 md:px-12 md:py-16">
              <h2
                className={`text-4xl font-extrabold ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                } mb-10 text-center`}
              >
                Field Ticket
              </h2>

              {/* Desktop summary row */}
              <div className="hidden sm:grid grid-cols-3 gap-8 mb-8 items-center text-center">
                <div>
                  <p
                    className={`text-lg font-bold ${
                      theme === "dark" ? "text-blue-300" : "text-blue-700"
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
                      {formFields.ticketNumber || "N/A"}
                    </span>
                  </p>
                </div>
                <div>
                  <p
                    className={`text-lg font-bold ${
                      theme === "dark" ? "text-blue-300" : "text-blue-700"
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
                  </p>
                </div>
                <div>
                  <p
                    className={`text-lg font-bold ${
                      theme === "dark" ? "text-blue-300" : "text-blue-700"
                    }`}
                  >
                    Lease/Well:{" "}
                    <span
                      className={
                        theme === "dark"
                          ? "font-semibold text-gray-300"
                          : "font-semibold text-gray-700"
                      }
                    >
                      {formFields.lease || "N/A"}{" "}
                      {formFields.well && !formFields.lease.includes("#")
                        ? `# ${formFields.well}`
                        : ""}
                    </span>
                  </p>
                </div>

                <div>
                  <p
                    className={`text-lg font-bold ${
                      theme === "dark" ? "text-blue-300" : "text-blue-700"
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
                      {formFields.ticketType || "N/A"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Mobile summary grid */}
              <div className="sm:hidden">
                <div className="grid grid-cols-2 gap-4 mb-8">
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
                      {formFields.ticketNumber || "N/A"}
                    </span>
                  </div>

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

                  <div className="flex flex-col items-center">
                    <p
                      className={`font-bold ${
                        theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                      } text-center`}
                    >
                      Lease/Well
                    </p>
                    <span
                      className={`block text-center ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {formFields.lease || "N/A"}
                      {formFields.well && !formFields.lease.includes("#") ? (
                        <span> # {formFields.well}</span>
                      ) : null}
                    </span>
                  </div>

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
                      {formFields.ticketType || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add Item Section */}
              <div className="mb-8">
                <label className="block font-medium mb-2">Add Item:</label>
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className={`form-select w-full px-4 py-2 rounded-md ${
                    theme === "dark"
                      ? "bg-gray-800 border border-gray-700 focus:ring-gray-600 text-white"
                      : "border border-gray-300 focus:ring-gray-500"
                  }`}
                >
                  <option value="" disabled>
                    Select an item...
                  </option>
                  {itemTypes.map((it, i) => (
                    <option key={i} value={it.ItemID}>
                      {`${it.ItemID} / ${it.ItemDescription}${
                        it.UOM ? ` / ${it.UOM}` : ""
                      }`}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => addItem(selectedItem)}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Add Item
                </button>
              </div>

              {/* Render the item cards */}
              {items.map((item, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row justify-between items-center ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  } p-4 rounded-lg mb-4 shadow-md`}
                >
                  <div className="mb-4 md:mb-0 text-center md:text-left">
                    <h4 className="text-xl md:text-2xl font-semibold">
                      {item.ItemDescription}{" "}
                      {item.UOM && (
                        <span
                          className={`text-sm md:text-base ${
                            theme === "dark" ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          ({item.UOM})
                        </span>
                      )}
                    </h4>
                  </div>

                  {/* If item.UseStartStop === 'Y', show Start/Stop date-time fields */}
                  {item.UseStartStop === "Y" ? (
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                      <div className="flex flex-col">
                        <label
                          className={`font-medium text-sm ${
                            theme === "dark" ? "text-gray-300" : "text-gray-800"
                          } mb-1`}
                        >
                          Start:
                        </label>
                        <input
                          type="datetime-local"
                          value={toDatetimeLocalString(item.start)}
                          onChange={(e) =>
                            handleTimeFieldChange(e, item.ItemID, "start")
                          }
                          className={`form-input px-3 py-1.5 rounded-md border ${
                            theme === "dark"
                              ? "bg-gray-800 border-gray-700 text-white focus:ring-gray-600"
                              : "border-gray-300 focus:ring-gray-500 text-gray-700"
                          }`}
                        />
                      </div>

                      <div className="flex flex-col">
                        <label
                          className={`font-medium text-sm ${
                            theme === "dark" ? "text-gray-300" : "text-gray-800"
                          } mb-1`}
                        >
                          Stop:
                        </label>
                        <input
                          type="datetime-local"
                          value={toDatetimeLocalString(item.stop)}
                          onChange={(e) =>
                            handleTimeFieldChange(e, item.ItemID, "stop")
                          }
                          className={`form-input px-3 py-1.5 rounded-md border ${
                            theme === "dark"
                              ? "bg-gray-800 border-gray-700 text-white focus:ring-gray-600"
                              : "border-gray-300 focus:ring-gray-500 text-gray-700"
                          }`}
                        />
                      </div>
                    </div>
                  ) : (
                    // Otherwise, show normal quantity
                    <div className="flex items-center justify-center md:justify-end">
                      <label className="block font-medium mr-4">Qty:</label>
                      {item.UseQuantity === "N" &&
                      item.ItemQuantity !== null ? (
                        <span
                          className={`inline-block w-24 px-4 py-2 rounded-md ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {item.ItemQuantity}
                        </span>
                      ) : (
                        <input
                          type="number"
                          name="quantity"
                          value={item.quantity || 0}
                          onChange={(e) => handleChange(e, item.ItemID)}
                          onClick={(e) => e.target.select()}
                          className={`form-input w-24 px-4 py-2 rounded-md ${
                            theme === "dark"
                              ? "bg-gray-800 border border-gray-700 focus:ring-gray-600 text-white"
                              : "border border-gray-300 focus:ring-gray-500"
                          }`}
                          placeholder="0"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Note field */}
              <div className="mb-8 md:mb-16">
                <label className="block font-medium mb-2">Note:</label>
                <textarea
                  name="note"
                  value={formFields.note || ""}
                  onChange={(e) => handleChange(e)}
                  className={`form-textarea w-full px-4 py-2 rounded-md ${
                    theme === "dark"
                      ? "bg-gray-800 border border-gray-700 focus:ring-gray-600 text-white"
                      : "border border-gray-300 focus:ring-gray-500"
                  }`}
                  rows={4}
                ></textarea>
              </div>

              {/* Image Upload, only if online */}
              {isOnline && (
                <div className="flex flex-col items-center justify-center w-full px-4">
                  <label
                    className={`block font-medium text-lg mb-4 text-center ${
                      theme === "dark" ? "text-gray-300" : "text-black"
                    }`}
                  >
                    Upload Images:
                  </label>
                  <div className="mb-4 w-full max-w-5xl">
                    <div className="flex items-center justify-center w-full relative">
                      {uploadedImages.length > 0 &&
                        uploadedImages.map((image, idx) => {
                          let zIndex;
                          if (idx === uploadedImages.length - 1) {
                            zIndex = 2;
                          } else if (idx === uploadedImages.length - 2) {
                            zIndex = 1;
                          } else {
                            zIndex = 0;
                          }
                          return (
                            <div
                              key={idx}
                              className={`relative w-48 h-64 transform transition-transform duration-300 hover:scale-105 ${
                                idx === 0 ? "-ml-2" : "-ml-10"
                              } mt-4`}
                              style={{ zIndex }}
                            >
                              <img
                                src={image}
                                alt={`uploaded ${idx}`}
                                className="w-full h-full object-cover rounded-lg shadow-md cursor-pointer"
                                onClick={() => openModal(image)}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center space-x-4 opacity-100 sm:opacity-0 sm:hover:opacity-100 transition-opacity duration-300">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(image);
                                  }}
                                  className="text-white hover:text-gray-300 focus:outline-none"
                                >
                                  <FontAwesomeIcon
                                    icon={faSearchPlus}
                                    size="lg"
                                  />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteImage(idx);
                                  }}
                                  className="text-white hover:text-gray-300 focus:outline-none"
                                >
                                  <FontAwesomeIcon
                                    icon={faTrashAlt}
                                    size="lg"
                                  />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                      <div
                        className={`relative w-48 h-64 p-6 rounded-lg border-2 cursor-pointer transition-colors duration-500 z-10 ${
                          theme === "dark"
                            ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                            : "bg-white border-gray-300 hover:bg-gray-100 text-black"
                        } ${
                          uploadedImages.length > 0 ? "-ml-10 mt-4" : "mt-4"
                        }`}
                      >
                        <div className="flex items-center justify-center h-full">
                          {uploadedImages.length === 0 ? (
                            <>
                              <button
                                className="focus:outline-none"
                                onClick={() =>
                                  isOnline && triggerFileInput(true)
                                }
                                disabled={!isOnline}
                              >
                                <FontAwesomeIcon icon={faCamera} size="3x" />
                              </button>
                              <button
                                className="focus:outline-none ml-4"
                                onClick={() =>
                                  isOnline && triggerFileInput(false)
                                }
                                disabled={!isOnline}
                              >
                                <FontAwesomeIcon
                                  icon={faFolderOpen}
                                  size="3x"
                                />
                              </button>
                            </>
                          ) : (
                            <button
                              className="focus:outline-none"
                              onClick={() =>
                                isOnline && triggerFileInput(false)
                              }
                              disabled={!isOnline}
                            >
                              <FontAwesomeIcon icon={faPlusCircle} size="3x" />
                            </button>
                          )}
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="hidden"
                        disabled={!isOnline}
                      />
                    </div>

                    {/* Image Modal */}
                    <Modal
                      isOpen={isModalOpen}
                      onRequestClose={closeModal}
                      contentLabel="Image Zoom Modal"
                      className="flex items-center justify-center h-full"
                      overlayClassName={`fixed inset-0 z-40 ${
                        theme === "dark"
                          ? "bg-black bg-opacity-80"
                          : "bg-black bg-opacity-50"
                      }`}
                    >
                      <div
                        className={`p-4 rounded-lg shadow-lg max-w-xl mx-auto z-50 relative ${
                          theme === "dark" ? "bg-gray-800" : "bg-white"
                        }`}
                      >
                        {selectedImage && (
                          <div className="relative">
                            <img
                              src={selectedImage}
                              alt="Selected"
                              className="w-full h-auto max-h-screen object-cover"
                            />
                            <div className="absolute top-0 right-0 p-2">
                              <button
                                onClick={closeModal}
                                className="text-gray-800 hover:text-gray-600 focus:outline-none"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="grey"
                                  className="w-6 h-6"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Modal>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <div className="text-center">
                <button
                  onClick={handleFinalSubmit}
                  className={`text-xl md:text-2xl px-12 py-4 focus:outline-none focus:ring-4 shadow-lg font-semibold rounded-full transition-all ease-in-out duration-300 ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:bg-gradient-to-l focus:ring-gray-500 text-gray-100"
                      : "bg-gradient-to-r from-gray-200 to-gray-300 hover:bg-gradient-to-l focus:ring-gray-300 text-gray-800"
                  }`}
                >
                  Submit Ticket
                </button>
              </div>
            </div>
          </div>

          {/* Mobile scroll button */}
          <button
            ref={scrollButtonRef}
            className="fixed bottom-5 right-5 bg-blue-500 bg-opacity-75 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-all duration-300 transform focus:outline-none z-50 hover:bg-blue-700 hover:bg-opacity-100 hover:scale-110 animate-pulse md:hidden"
            onClick={isScrolled ? scrollToTop : scrollToBottom}
          >
            <FontAwesomeIcon icon={isScrolled ? faChevronUp : faChevronDown} />
          </button>
        </>
      )}
    </animated.main>
  );
}

export default FieldTicketEntry;
