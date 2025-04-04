import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import { useTheme, useUser } from "ogcommon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "react-modal";
import { baseUrl } from "./config";
import {
  faSearchPlus,
  faTrashAlt,
  faCamera,
  faFolderOpen,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";
import PrintSection from "./PrintSection";
import { parseISO, format } from "date-fns";
import * as XLSX from "xlsx";

// ============================
//   Confirmation Modal
// ============================
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

// ============================
//   ViewFieldTicket Component
// ============================
const ViewFieldTicket = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const { userRole, userID } = useUser(); // userID => "lastUser"

  // Ticket and date
  const [ticket, setTicket] = useState(null);
  const [ticketNumber, setTicketNumber] = useState(null);
  const [formattedDate, setFormattedDate] = useState("");

  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showBillingConfirmation, setShowBillingConfirmation] = useState(false);
  const [fieldNote, setFieldNote] = useState("");

  // Items logic
  const [itemsMap, setItemsMap] = useState(new Map());
  const [itemTypes, setItemTypes] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");

  // For item removal confirmation
  const [showRemoveItemModal, setShowRemoveItemModal] = useState(false);
  const [itemLineToRemove, setItemLineToRemove] = useState(null);

  // Subdomain logic
  const [subdomain, setSubdomain] = useState("");

  // Images
  const [uploadedImages, setUploadedImages] = useState([]);
  const [retrievedImages, setRetrievedImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB
  const [loading, setLoading] = useState(true);

  // GPS location
  const [gpsLocation, setGpsLocation] = useState(null); // Creation
  const [lastUpdatedGPSValue, setLastUpdatedGPSValue] = useState(null);
  const [parsedLastUpdatedGPSValue, setParsedLastUpdatedGPSValue] =
    useState(null);
  const [createdGPSLocation, setCreatedGPSLocation] = useState(null);

  // Animations
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

  // ============================
  //   Helper: Compute total cost
  // ============================
  const computeTotalCost = (item) => {
    const costVal = parseFloat(item.Cost || item.ItemCost || 0);

    // If item has Start/Stop, compute time difference in hours x cost
    if (item.UseStartStop === "Y" && item.Start && item.Stop) {
      const startTime = new Date(item.Start).getTime();
      const stopTime = new Date(item.Stop).getTime();
      let hours = (stopTime - startTime) / 3600000;
      if (hours < 0) hours = 0;
      return (costVal * hours).toFixed(2);
    }

    // Otherwise, if item uses quantity
    if (item.UseQuantity === "Y") {
      const q = parseFloat(item.Quantity) || 0;
      return (costVal * q).toFixed(2);
    }

    // Fallback: just cost
    return costVal.toFixed(2);
  };

  // ============================
  //   Fetch user geolocation
  // ============================
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLastUpdatedGPSValue(coords);
        },
        (err) => {
          console.error("Error getting geolocation:", err);
        }
      );
    }
  }, []);

  // ============================
  //   Subdomain extraction
  // ============================
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
  }, []);

  // ============================
  //   Get ticketNumber from URL
  // ============================
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ticketNum = params.get("ticket");
    setTicketNumber(ticketNum);
  }, [location]);

  // ============================
  //   Fetch ticket from server
  // ============================
  useEffect(() => {
    if (ticketNumber) {
      fetch(`${baseUrl}/api/tickets.php?ticket=${ticketNumber}`)
        .then((response) => response.json())
        .then((data) => {
          setTicket(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching ticket data:", error);
          setLoading(false);
        });
    }
  }, [ticketNumber]);

  // ============================
  //   Initialize from location/state or localStorage
  // ============================
  useEffect(() => {
    if (location.state && location.state.ticket) {
      initializeTicketState(location.state.ticket);
      const dir = location.state.ticket.ImageDirectory;
      if (dir && dir.length > 1) fetchTicketImages(dir);
    } else {
      const cachedTicket = JSON.parse(localStorage.getItem("currentTicket"));
      if (cachedTicket) {
        initializeTicketState(cachedTicket);
        const dir = cachedTicket.ImageDirectory;
        if (dir && dir.length > 1) fetchTicketImages(dir);
      }
    }
  }, [location.state]);

  // ============================
  //   Fetch itemTypes
  // ============================
  useEffect(() => {
    const fetchItemTypes = async () => {
      try {
        const resp = await fetch(`${baseUrl}/api/jobitem.php?item_types=1`);
        const data = await resp.json();
        // Filter out item IDs that end with _1, _2, ...
        const filtered = (data.itemTypes || []).filter(
          (item) => !item.ItemID.match(/_[0-9]$/)
        );
        setItemTypes(filtered);
      } catch (err) {
        console.error("Error fetching item types:", err);
      }
    };

    fetchItemTypes();
  }, []);

  // ============================
  //   initTicket helper
  // ============================
  const initializeTicketState = (ticketData) => {
    if (!ticketData.Items) {
      setTicket({ ...ticketData, Items: [] });
    } else {
      // Build a local itemsMap if needed
      const itemsMapData = new Map(
        ticketData.Items.map((item) => [
          item.JobItemID,
          {
            ItemCost: parseFloat(item.ItemCost || item.Cost || 0),
            UseQuantity: item.UseQuantity,
          },
        ])
      );
      setItemsMap(itemsMapData);

      // Update each item with totalCost
      const updatedItems = ticketData.Items.map((item) => {
        const totalCost = computeTotalCost(item);
        return { ...item, totalCost };
      });

      setTicket({ ...ticketData, Items: updatedItems });
    }

    // Format the date
    if (ticketData.TicketDate) {
      try {
        const correctDate = new Date(ticketData.TicketDate);
        correctDate.setMinutes(
          correctDate.getMinutes() + correctDate.getTimezoneOffset()
        );
        setFormattedDate(
          format(parseISO(ticketData.TicketDate), "MMMM dd, yyyy")
        );
      } catch (err) {
        console.error("Error formatting ticket date:", err);
        setFormattedDate(ticketData.TicketDate);
      }
    }

    // Field note
    setFieldNote(ticketData.Note || "");

    // Created GPS
    if (ticketData.gps) {
      try {
        const parsedGPS = JSON.parse(ticketData.gps);
        setGpsLocation(parsedGPS);
        setCreatedGPSLocation(parsedGPS);
      } catch (e) {
        console.error("Error parsing GPS:", e);
      }
    }

    // lastUpdatedGPS
    if (ticketData.lastUpdatedGPSValue) {
      try {
        setParsedLastUpdatedGPSValue(
          JSON.parse(ticketData.lastUpdatedGPSValue)
        );
      } catch (e) {
        console.error("Error parsing lastUpdatedGPSValue:", e);
      }
    }

    setTicket((old) => ({ ...old, ...ticketData }));
  };

  // ============================
  //   Handle Field Note
  // ============================
  const handleFieldNoteChange = (e) => {
    setFieldNote(e.target.value);
  };

  // ============================
  //   Add New Item
  // ============================
  const addItem = (itemID) => {
    if (!itemID) return;
    const itemToAdd = itemTypes.find((it) => it.ItemID === itemID);
    if (!itemToAdd) return;

    // Generate a new TicketLine
    const existingLines = ticket.Items.map(
      (it) => parseInt(it.TicketLine) || 0
    );
    const maxLine = existingLines.length > 0 ? Math.max(...existingLines) : 0;
    const newTicketLine = (maxLine + 1).toString();

    const newItem = {
      ...itemToAdd,
      ItemDescription: itemToAdd.ItemDescription || "",
      ItemID: itemToAdd.ItemID,
      JobItemID: itemToAdd.JobItemID || "",
      UOM: itemToAdd.UOM || "",
      UseCost: itemToAdd.UseCost || "Y",
      UseQuantity: itemToAdd.UseQuantity || "Y",
      // Keep track of Start/Stop usage
      UseStartStop: itemToAdd.UseStartStop || "N",

      ItemCost: itemToAdd.ItemCost || "0.00",
      TicketLine: newTicketLine,
      Active: "Y",
      Cost: itemToAdd.ItemCost || "0.00",
      Quantity: 0,
      totalCost: "0.00",
      Start: null,
      Stop: null,
    };

    setTicket((prev) => ({
      ...prev,
      Items: [...(prev.Items || []), newItem],
    }));
    setSelectedItem("");
  };

  // ============================
  //   Item Edits (Cost/Qty)
  // ============================
  const handleCostChange = (e, ticketLine) => {
    const newCost = e.target.value;
    setTicket((prevTicket) => {
      const updatedItems = prevTicket.Items.map((item) => {
        if (item.TicketLine === ticketLine) {
          const newItem = { ...item, Cost: newCost };
          newItem.totalCost = computeTotalCost(newItem);
          return newItem;
        }
        return item;
      });
      return { ...prevTicket, Items: updatedItems };
    });
  };

  // For general field changes on an item
  const handleChange = useCallback(
    (e, itemLine) => {
      const { name, value } = e.target;

      setTicket((prevTicket) => {
        // If editing top-level field
        if (
          name === "TicketDate" ||
          name === "LeaseName" ||
          name === "WellID"
        ) {
          return { ...prevTicket, [name]: value };
        }
        // Otherwise, editing an item field
        const updatedItems = prevTicket.Items.map((item) => {
          if (item.TicketLine === itemLine) {
            const updatedItem = { ...item, [name]: value };
            // Recompute total cost
            updatedItem.totalCost = computeTotalCost(updatedItem);
            return updatedItem;
          }
          return item;
        });
        return { ...prevTicket, Items: updatedItems };
      });
    },
    [computeTotalCost]
  );

  // ============================
  //   Helper for <input type="datetime-local">
  // ============================
  const toDatetimeLocalString = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    // offset so it appears local
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  // ============================
  //   Handle Time Field Change
  // ============================
  const handleTimeFieldChange = (e, ticketLine, field) => {
    const { value } = e.target; // e.g. "2025-03-21T14:30"
    setTicket((prev) => {
      const updatedItems = prev.Items.map((item) => {
        if (item.TicketLine === ticketLine) {
          const isoValue = value ? new Date(value).toISOString() : null;
          const newItem = { ...item, [field]: isoValue };

          // Validation: if field === "Stop" and new Stop < Start => disallow
          if (
            field === "Stop" &&
            newItem.Start &&
            new Date(isoValue) < new Date(newItem.Start)
          ) {
            alert("Stop time must be after Start time.");
            return item; // Skip updating
          }

          // Recompute total cost after editing time
          newItem.totalCost = computeTotalCost(newItem);
          return newItem;
        }
        return item;
      });
      return { ...prev, Items: updatedItems };
    });
  };
  // ============================
  //   START/STOP CLICK HANDLING
  // ============================
  const handleStartStopClick = async (item, action) => {
    // This sets item.Start or item.Stop to "now"
    try {
      const nowISO = new Date().toISOString();
      // Patch payload
      const patchPayload = {
        ticket: ticket.Ticket,
        itemTicketLine: item.TicketLine,
        Start: action === "start" ? nowISO : item.Start,
        Stop: action === "stop" ? nowISO : item.Stop,
      };

      const response = await fetch(
        `${baseUrl}/api/tickets.php?ticket=${ticket.Ticket}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patchPayload),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      // On success, update local state
      setTicket((prev) => {
        const updatedItems = prev.Items.map((i) => {
          if (i.TicketLine === item.TicketLine) {
            const newItem = {
              ...i,
              Start: action === "start" ? nowISO : i.Start,
              Stop: action === "stop" ? nowISO : i.Stop,
            };
            // Recompute total
            newItem.totalCost = computeTotalCost(newItem);
            return newItem;
          }
          return i;
        });
        return { ...prev, Items: updatedItems };
      });
    } catch (error) {
      console.error("Error handling start/stop:", error);
    }
  };

  // ============================
  //   Remove Item (Confirm First)
  // ============================
  const openRemoveItemModal = (ticketLine) => {
    setItemLineToRemove(ticketLine);
    setShowRemoveItemModal(true);
  };

  const handleRemoveItemConfirm = () => {
    if (!itemLineToRemove) {
      setShowRemoveItemModal(false);
      return;
    }
    // Actually remove from state
    setTicket((prevTicket) => {
      const newItems = prevTicket.Items.filter(
        (it) => it.TicketLine !== itemLineToRemove
      );
      return { ...prevTicket, Items: newItems };
    });
    setShowRemoveItemModal(false);
    setItemLineToRemove(null);
  };

  const handleRemoveItemCancel = () => {
    setShowRemoveItemModal(false);
    setItemLineToRemove(null);
  };

  // ============================
  //   IMAGE UPLOAD + DELETE
  // ============================
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setUploadedImages((prevImages) => {
      if (Array.isArray(prevImages)) {
        return [...prevImages, ...imageUrls];
      } else {
        return imageUrls;
      }
    });
    onImageChange(event);
  };

  const onImageChange = (event) => {
    const files = event.target.files;
    if (!files) return;
    const validFiles = Array.from(files).filter(
      (file) => file.size <= MAX_FILE_SIZE
    );
    if (validFiles.length !== files.length) {
      alert("Some files are too large. Maximum file size is 6MB.");
    }
    if (validFiles.length > 0) {
      handleImageUpload({ target: { files: validFiles } });
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
    if (Array.isArray(uploadedImages)) {
      setUploadedImages([...uploadedImages, ...newImages]);
    } else {
      setUploadedImages(newImages);
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

  const handleDeleteImage = useCallback(
    async (index) => {
      const imageToDelete = uploadedImages[index];
      if (!imageToDelete) return;
      const updatedImages = uploadedImages.filter((_, i) => i !== index);
      setUploadedImages(updatedImages);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Attempt server-side delete (if online)
      try {
        if (navigator.onLine) {
          const patchData = {
            Ticket: ticket.Ticket,
            removedImages: [imageToDelete.split("/").pop()],
          };

          const response = await fetch(
            `${baseUrl}/api/tickets.php?ticket=${ticket.Ticket}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(patchData),
            }
          );
          if (response.ok) {
            // Update local storage
            const storedTickets =
              JSON.parse(localStorage.getItem("tickets")) || [];
            const updatedStoredTickets = storedTickets.map((t) =>
              t.Ticket === ticket.Ticket
                ? { ...ticket, ImageDirectory: updatedImages.join(",") }
                : t
            );
            localStorage.setItem(
              "tickets",
              JSON.stringify(updatedStoredTickets)
            );
          } else {
            console.error("Error deleting image:", response.statusText);
          }
        } else {
          console.warn("User is offline. Changes will sync when online.");
        }
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    },
    [uploadedImages, ticket]
  );

  // ============================
  //   FETCH TICKET IMAGES
  // ============================
  const fetchTicketImages = async (imageDirectory) => {
    try {
      const encodedImageDirectory = encodeURIComponent(
        imageDirectory.replace(/^\.\.\//, "")
      );
      const response = await fetch(
        `${baseUrl}/api/tickets.php?imageDirectory=${encodedImageDirectory}`
      );
      const data = await response.json();
      const finalImages = data.images.map((fullUrl) => {
        const idx = fullUrl.indexOf("/uploads/");
        return idx !== -1 ? baseUrl + fullUrl.substring(idx) : fullUrl;
      });
      setRetrievedImages(finalImages);
      setUploadedImages(finalImages);
    } catch (error) {
      console.error("Error fetching ticket images:", error);
    }
  };

  // ============================
  //   EXPORT BUTTON
  // ============================
  const handleExport = () => {
    if (!ticket || !ticket.Items) return;
    const headers = [
      "Ticket",
      "TicketLine",
      "JobItemID",
      "ItemID",
      "ItemDescription",
      "UOM",
      "Quantity",
      "Cost",
      "UseQuantity",
      "UseCost",
      "ItemOrder",
      "Active",
      "Ticket",
      "LeaseID",
      "WellID",
      "TicketDate",
      "Comments",
      "JobTypeID",
      "UserID",
      "Billed",
      "Note",
    ];

    const data = [headers];

    ticket.Items.forEach((item) => {
      const row = [
        ticket.Ticket || "",
        item.TicketLine || "",
        item.JobItemID || "",
        item.ItemID || "",
        item.ItemDescription || "",
        item.UOM || "",
        item.Quantity || "",
        item.Cost || "",
        item.UseQuantity || "",
        item.UseCost || "",
        item.ItemOrder || "",
        item.Active || "",
        ticket.Ticket || "",
        ticket.LeaseID || "",
        ticket.WellID || "",
        ticket.TicketDate || "",
        ticket.Comments || "",
        ticket.JobTypeID || "",
        ticket.UserID || "",
        ticket.Billed || "",
        ticket.Note || "",
      ];
      data.push(row);
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ticket Data");
    const filename = `Ticket_${ticket.Ticket || "export"}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  // ============================
  //   EDIT / DELETE / BILL
  // ============================
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    if (location.state && location.state.ticket) {
      initializeTicketState(location.state.ticket);
    } else {
      const cachedTicket = JSON.parse(localStorage.getItem("currentTicket"));
      if (cachedTicket) initializeTicketState(cachedTicket);
    }
  };
  const handleSaveClick = async () => {
    try {
      const nowISO = new Date().toISOString();

      // Copy current ticket, attach the updated Note
      const updatedTicket = { ...ticket, Note: fieldNote };

      // Build the final payload to PATCH
      const patchData = {
        ...updatedTicket,
        TicketDate: ticket.TicketDate,
        LeaseName: ticket.LeaseName,
        WellID: ticket.WellID,
        Note: fieldNote,
        lastUser: userID,
        lastUpdatedTimestamp: nowISO,
        lastUpdatedGPSValue: lastUpdatedGPSValue
          ? JSON.stringify(lastUpdatedGPSValue)
          : "",
        addedImages: [],
        removedImages: [],

        // Recompute items (including hours for UseStartStop)
        Items: ticket.Items.map((item) => {
          const newItem = { ...item };

          // If item uses Start/Stop and both times are set, recalc Quantity as hours
          if (newItem.UseStartStop === "Y" && newItem.Start && newItem.Stop) {
            const startTime = new Date(newItem.Start).getTime();
            const stopTime = new Date(newItem.Stop).getTime();
            let hours = (stopTime - startTime) / 3600000;
            if (hours < 0) hours = 0;
            newItem.Quantity = hours;
          }

          // Then compute the totalCost from cost * quantity
          newItem.totalCost = computeTotalCost(newItem);
          return newItem;
        }),
      };

      // Identify newly added images
      const existingImageNames = Array.isArray(retrievedImages)
        ? retrievedImages.map((img) => img.split("/").pop())
        : [];
      const addedImages = Array.isArray(uploadedImages)
        ? uploadedImages.filter(
            (img) => !existingImageNames.includes(img.split("/").pop())
          )
        : [];

      // Convert newly added images to base64
      for (const addedImage of addedImages) {
        const imageName = addedImage.split("/").pop();
        if (existingImageNames.includes(imageName)) continue; // Already known
        const response = await fetch(addedImage);
        const blob = await response.blob();

        const reader = new FileReader();
        const base64Data = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result.split(",")[1]);
          reader.readAsDataURL(blob);
        });

        // Derive file extension
        const fileExtension = (addedImage.match(/\.\w+$/) || [".jpg"])[0];
        patchData.addedImages.push({
          name: `${Date.now()}_${patchData.addedImages.length}${fileExtension}`,
          data: base64Data,
        });
      }

      // Identify removed images (previously existed, but now not in uploadedImages)
      const removedImages = existingImageNames.filter(
        (img) =>
          !Array.isArray(uploadedImages) ||
          !uploadedImages.map((u) => u.split("/").pop()).includes(img)
      );
      patchData.removedImages = removedImages;

      // Save to localStorage (optimistic)
      localStorage.setItem("currentTicket", JSON.stringify(updatedTicket));
      const storedTickets = JSON.parse(localStorage.getItem("tickets")) || [];

      // Make the PATCH call (with &itemRemoval=1 to handle item deletion)
      const response = await fetch(
        `${baseUrl}/api/tickets.php?ticket=${ticket.Ticket}&itemRemoval=1`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchData),
        }
      );

      if (!response.ok) {
        console.error("Error updating ticket:", response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // On success, exit editing mode
      setIsEditing(false);

      // Update local "tickets" store
      const updatedStoredTickets = storedTickets.map((t) =>
        t.Ticket === ticket.Ticket
          ? { ...patchData, ImageDirectory: uploadedImages.join(",") }
          : t
      );
      localStorage.setItem("tickets", JSON.stringify(updatedStoredTickets));

      // Update local state
      setTicket((prevTicket) => ({
        ...prevTicket,
        TicketDate: patchData.TicketDate,
        LeaseName: patchData.LeaseName,
        WellID: patchData.WellID,
        Note: fieldNote,
        Items: patchData.Items,
        lastUser: userID,
        lastUpdatedTimestamp: nowISO,
        lastUpdatedGPSValue: patchData.lastUpdatedGPSValue,
      }));

      // Reformat TicketDate for display
      setFormattedDate(
        ticket.TicketDate
          ? format(parseISO(ticket.TicketDate), "MMMM dd, yyyy")
          : ticket.TicketDate
      );

      // If we have a new lastUpdatedGPSValue, parse and store it
      if (patchData.lastUpdatedGPSValue) {
        try {
          setParsedLastUpdatedGPSValue(
            JSON.parse(patchData.lastUpdatedGPSValue)
          );
        } catch (err) {
          console.error("Error re-parsing lastUpdatedGPSValue:", err);
        }
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
      if (navigator.onLine) {
        const response = await fetch(
          `${baseUrl}/api/tickets.php?ticket=${ticket.Ticket}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          const storedTickets =
            JSON.parse(localStorage.getItem("tickets")) || [];
          const updatedStoredTickets = storedTickets.filter(
            (t) => t.Ticket !== ticket.Ticket
          );
          localStorage.setItem("tickets", JSON.stringify(updatedStoredTickets));

          const currentTicket = JSON.parse(
            localStorage.getItem("currentTicket")
          );
          if (currentTicket && currentTicket.Ticket === ticket.Ticket) {
            localStorage.removeItem("currentTicket");
          }
          navigate("/home");
        } else {
          console.error("Error deleting ticket:", response.statusText);
        }
      } else {
        // Offline => remove from local storage only
        const storedTickets = JSON.parse(localStorage.getItem("tickets")) || [];
        const updatedStoredTickets = storedTickets.filter(
          (t) => t.Ticket !== ticket.Ticket
        );
        localStorage.setItem("tickets", JSON.stringify(updatedStoredTickets));

        const currentTicket = JSON.parse(localStorage.getItem("currentTicket"));
        if (currentTicket && currentTicket.Ticket === ticket.Ticket) {
          localStorage.removeItem("currentTicket");
        }
        navigate("/home");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };
  const handleDeleteCancel = () => {
    setShowConfirmation(false);
  };

  // ============================
  //   Billed
  // ============================
  const handleBillClick = () => {
    setShowBillingConfirmation(true);
  };
  const handleBillConfirm = async () => {
    try {
      const updatedTicket = { ...ticket, Billed: "Y" };

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
  const handleUnbillClick = async () => {
    try {
      const updatedTicket = { ...ticket, Billed: "N" };

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
        setTicket(updatedTicket);
      } else {
        console.error("Error updating ticket:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  // ============================
  //   Image Modal
  // ============================
  const openModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  if (!ticket) {
    return <div>Loading...</div>;
  }

  let formattedLastUpdatedDate = "";
  if (ticket.lastUpdatedTimestamp) {
    try {
      formattedLastUpdatedDate = format(
        parseISO(ticket.lastUpdatedTimestamp),
        "PPpp"
      );
    } catch (err) {
      console.error("Error formatting lastUpdatedTimestamp:", err);
      formattedLastUpdatedDate = ticket.lastUpdatedTimestamp;
    }
  }

  let formattedCreatedDate = "";
  if (ticket.createdTimestamp) {
    try {
      formattedCreatedDate = format(parseISO(ticket.createdTimestamp), "PPpp");
    } catch (err) {
      console.error("Error formatting createdTimestamp:", err);
      formattedCreatedDate = ticket.createdTimestamp;
    }
  }

  // Calculate Net Cost with updated item totals
  // Example adjustment to netCost calculation:
  const netCost = ticket?.Items
    ? ticket.Items.reduce((sum, item) => {
        const costVal = parseFloat(item.Cost ?? item.ItemCost ?? 0);

        // If item uses Start/Stop and both times are set:
        if (item.UseStartStop === "Y" && item.Start && item.Stop) {
          const startTime = new Date(item.Start).getTime();
          const stopTime = new Date(item.Stop).getTime();
          let hours = (stopTime - startTime) / 3600000;
          if (hours < 0) hours = 0;
          return sum + hours * costVal;
        }

        // Otherwise if item uses normal Quantity:
        if (item.UseQuantity === "Y") {
          const q = parseFloat(item.Quantity ?? 0);
          return sum + q * costVal;
        }

        // Fallback: just cost
        return sum + costVal;
      }, 0).toFixed(2)
    : "0.00";

  // ============================
  //   Return JSX
  // ============================
  return (
    <>
      <animated.main
        style={backgroundAnimation}
        className="min-h-screen flex items-center justify-center p-6 transition-colors duration-500"
      >
        <animated.div
          style={ticketSummaryAnimation}
          className="w-full max-w-6xl mx-auto backdrop-blur-md rounded-xl shadow-2xl overflow-hidden transition-colors duration-500 relative"
        >
          {/* Go Home button */}
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
              Field Ticket
            </h2>

            {/* Ticket Header */}
            <div className="px-4 mb-8">
              {/* Desktop View */}
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
                      {ticket.Ticket || "N/A"}
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
                    {isEditing ? (
                      <input
                        type="date"
                        name="TicketDate"
                        value={ticket.TicketDate}
                        onChange={handleChange}
                        className={`form-input px-2 py-1 rounded-md border text-base inline-block ${
                          theme === "dark"
                            ? "border-gray-600 bg-gray-800 text-gray-300"
                            : "border-gray-400 bg-white text-gray-700"
                        } focus:ring-indigo-400 focus:border-indigo-400 transition`}
                        style={{
                          colorScheme: theme === "dark" ? "dark" : "light",
                        }}
                      />
                    ) : (
                      <span
                        className={
                          theme === "dark"
                            ? "font-semibold text-gray-300"
                            : "font-semibold text-gray-700"
                        }
                      >
                        {formattedDate}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-lg font-bold ${
                      theme === "dark" ? "text-blue-300" : "text-blue-700"
                    }`}
                  >
                    {userRole !== "P" ? "Lease/User:" : "Lease/Well:"}{" "}
                    <span
                      className={
                        theme === "dark"
                          ? "font-semibold text-gray-300"
                          : "font-semibold text-gray-700"
                      }
                    >
                      {ticket.LeaseName || "N/A"}
                      {userRole !== "P" && ticket.UserID
                        ? ` / ${ticket.UserID}`
                        : ""}
                      {ticket.WellID && !ticket.LeaseName?.includes("#")
                        ? ` # ${ticket.WellID}`
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
                      {ticket.JobDescription || "N/A"}
                    </span>
                  </p>
                </div>
                {userRole !== "P" && (
                  <div>
                    <p
                      className={`text-lg font-bold ${
                        theme === "dark" ? "text-blue-300" : "text-blue-700"
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
                    </p>
                  </div>
                )}
                {userRole !== "P" && (
                  <div>
                    <p
                      className={`text-lg font-bold ${
                        theme === "dark" ? "text-blue-300" : "text-blue-700"
                      }`}
                    >
                      Net Cost:{" "}
                      <span
                        className={
                          theme === "dark"
                            ? "font-semibold text-gray-300"
                            : "font-semibold text-gray-700"
                        }
                      >
                        ${netCost}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Mobile View */}
              <div className="sm:hidden">
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="flex flex-col items-center">
                    <p
                      className={`font-bold ${
                        theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                      } text-center`}
                    >
                      Date
                    </p>
                    {isEditing ? (
                      <input
                        type="date"
                        name="TicketDate"
                        value={ticket.TicketDate}
                        onChange={handleChange}
                        className={`form-input w-36 px-4 py-2 rounded-md border text-base ${
                          theme === "dark"
                            ? "border-gray-600 bg-gray-800 text-gray-300"
                            : "border-gray-400 bg-white text-gray-700"
                        } focus:ring-indigo-400 focus:border-indigo-400 transition`}
                        style={{
                          colorScheme: theme === "dark" ? "dark" : "light",
                        }}
                      />
                    ) : (
                      <span
                        className={`block text-center ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {formattedDate}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <p
                      className={`font-bold ${
                        theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                      } text-center`}
                    >
                      Lease
                    </p>
                    <span
                      className={`block text-center ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {ticket.LeaseName || "N/A"}
                    </span>
                  </div>
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
                  {userRole !== "P" && (
                    <div className="flex flex-col items-center">
                      <p
                        className={`font-bold ${
                          theme === "dark"
                            ? "text-indigo-400"
                            : "text-indigo-600"
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
                  )}
                  {userRole !== "P" && (
                    <div className="flex flex-col items-center col-span-2">
                      <p
                        className={`font-bold ${
                          theme === "dark"
                            ? "text-indigo-400"
                            : "text-indigo-600"
                        } text-center`}
                      >
                        Net Cost
                      </p>
                      <span
                        className={`block text-center ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        ${netCost}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* "Add Item" UI (only if isEditing) */}
            {isEditing && (
              <div className="mb-8">
                <label className="block font-medium mb-2">Add Item:</label>
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className={`form-select w-full px-4 py-2 rounded-md ${
                    theme === "dark"
                      ? "bg-gray-800 border border-gray-700 text-white"
                      : "border border-gray-300"
                  }`}
                >
                  <option value="" disabled>
                    Select an item...
                  </option>
                  {itemTypes.map((it) => (
                    <option key={it.ItemID} value={it.ItemID}>
                      {`${it.ItemID} / ${it.ItemDescription} ${
                        it.UOM ? `/ ${it.UOM}` : ""
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
            )}

            {/* Item List */}
            {ticket?.Items?.length > 0 &&
              ticket.Items.map((item) => {
                // For Start/Stop items, compute hours as quantity
                let hoursWorked = 0;
                if (item.UseStartStop === "Y" && item.Start && item.Stop) {
                  const startTime = new Date(item.Start).getTime();
                  const stopTime = new Date(item.Stop).getTime();
                  hoursWorked = (stopTime - startTime) / 3600000;
                  if (hoursWorked < 0) hoursWorked = 0;
                }

                return (
                  <animated.div
                    key={item.TicketLine}
                    style={itemAnimation}
                    className={`flex flex-col md:flex-row justify-between items-center ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    } p-4 rounded-lg mb-4 shadow-md`}
                  >
                    <div className="flex-1 w-full md:w-auto mb-4 md:mb-0 text-center md:text-left">
                      <h4
                        className={`text-lg md:text-xl font-semibold ${
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        {item.ItemDescription}
                      </h4>
                      {item.UOM && (
                        <span
                          className={`block md:inline mt-1 md:mt-0 ${
                            theme === "dark"
                              ? "text-sm text-gray-400"
                              : "text-sm text-gray-600"
                          }`}
                        >
                          ({item.UOM})
                        </span>
                      )}
                    </div>

                    {/* UseStartStop? */}
                    {item.UseStartStop === "Y" ? (
                      <div className="flex flex-col md:flex-row items-center w-full md:w-auto gap-2 md:gap-6">
                        {/* Main info row */}
                        <div className="flex flex-row items-center gap-4 text-sm">
                          {userRole !== "P" && !isEditing && (
                            <p
                              className={
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-800"
                              }
                            >
                              <span className="font-medium">Cost:</span> $
                              {(
                                parseFloat(item.Cost) *
                                parseFloat(item.Quantity || 0)
                              ).toFixed(2)}
                            </p>
                          )}
                          {!isEditing && (
                            <>
                              <p
                                className={
                                  theme === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-800"
                                }
                              >
                                <span className="font-medium">Start:</span>{" "}
                                {item.Start
                                  ? format(parseISO(item.Start), "PPpp")
                                  : "Not started"}
                              </p>
                              <p
                                className={
                                  theme === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-800"
                                }
                              >
                                <span className="font-medium">Stop:</span>{" "}
                                {item.Stop
                                  ? format(parseISO(item.Stop), "PPpp")
                                  : "Not stopped"}
                              </p>
                            </>
                          )}

                          <p
                            className={
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-800"
                            }
                          >
                            <span className="font-medium">Qty:</span>{" "}
                            {hoursWorked > 0 ? hoursWorked.toFixed(2) : "0.00"}
                          </p>
                        </div>

                        {/* Editing controls (if isEditing) */}
                        {isEditing && (
                          <div className="flex flex-row items-center gap-3 mt-2 md:mt-0">
                            {/* Time inputs */}
                            <label className="text-xs">
                              <span className="mr-1">Edit Start:</span>
                              <input
                                type="datetime-local"
                                value={toDatetimeLocalString(item.Start)}
                                onChange={(e) =>
                                  handleTimeFieldChange(
                                    e,
                                    item.TicketLine,
                                    "Start"
                                  )
                                }
                                className="px-2 py-1 border rounded-md text-sm"
                              />
                            </label>
                            <label className="text-xs">
                              <span className="mr-1">Edit Stop:</span>
                              <input
                                type="datetime-local"
                                value={toDatetimeLocalString(item.Stop)}
                                onChange={(e) =>
                                  handleTimeFieldChange(
                                    e,
                                    item.TicketLine,
                                    "Stop"
                                  )
                                }
                                className="px-2 py-1 border rounded-md text-sm"
                              />
                            </label>

                            {/* Start/Stop buttons */}
                            {!item.Start && (
                              <button
                                className="px-3 py-1.5 rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                onClick={() =>
                                  handleStartStopClick(item, "start")
                                }
                              >
                                Start
                              </button>
                            )}
                            {item.Start && !item.Stop && (
                              <button
                                className="px-3 py-1.5 rounded-md text-white bg-red-600 hover:bg-red-700"
                                onClick={() =>
                                  handleStartStopClick(item, "stop")
                                }
                              >
                                Stop
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Non–UseStartStop items
                      <div className="flex flex-col md:flex-row items-center w-full md:w-auto gap-4 md:gap-12">
                        {userRole !== "P" && item.UseCost !== "N" && (
                          <div className="flex-1 text-center md:text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center md:justify-end">
                                <label
                                  className={`mr-2 ${
                                    theme === "dark"
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                  } font-medium text-lg`}
                                >
                                  Cost:
                                </label>
                                <input
                                  type="number"
                                  name="Cost"
                                  value={item.Cost}
                                  onChange={(e) =>
                                    handleCostChange(e, item.TicketLine)
                                  }
                                  onClick={(e) => e.target.select()}
                                  className={`form-input w-24 px-3 py-1.5 rounded-md border text-base ${
                                    theme === "dark"
                                      ? "border-gray-600 bg-gray-800 text-gray-300"
                                      : "border-gray-400 bg-white text-gray-700"
                                  } focus:ring-indigo-400 focus:border-indigo-400 transition`}
                                  placeholder="0.00"
                                />
                              </div>
                            ) : (
                              <p
                                className={`text-base ${
                                  theme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-600"
                                }`}
                              >
                                <span className="font-medium">Cost:</span> $
                                {item.Cost * item.Quantity}
                              </p>
                            )}
                          </div>
                        )}
                        <div className="w-full md:w-auto text-center md:text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-center md:justify-end">
                              <label
                                className={`mr-2 ${
                                  theme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-600"
                                } font-medium text-lg`}
                              >
                                Qty:
                              </label>
                              {item.UseQuantity === "Y" ? (
                                <input
                                  type="number"
                                  name="Quantity"
                                  value={item.Quantity}
                                  onChange={(e) =>
                                    handleChange(e, item.TicketLine)
                                  }
                                  onClick={(e) => e.target.select()}
                                  className={`form-input w-24 px-3 py-1.5 rounded-md border text-base ${
                                    theme === "dark"
                                      ? "border-gray-600 bg-gray-800 text-gray-300"
                                      : "border-gray-400 bg-white text-gray-700"
                                  } focus:ring-indigo-400 focus:border-indigo-400 transition`}
                                  placeholder="0"
                                />
                              ) : (
                                <p
                                  className={`text-base ${
                                    theme === "dark"
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {item.Quantity}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p
                              className={`text-base ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              <span className="font-medium">Qty:</span>{" "}
                              {item.Quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Remove item button (only if editing) */}
                    {isEditing && (
                      <button
                        onClick={() => openRemoveItemModal(item.TicketLine)}
                        className="mt-4 md:mt-0 md:ml-4 px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} className="mr-1" />
                      </button>
                    )}
                  </animated.div>
                );
              })}

            {/* Field Note */}
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
            )}

            {/* Ticket Images */}
            <div className="flex flex-col items-center justify-center w-full px-4">
              <div className="mb-4 w-full max-w-5xl">
                <label
                  className={`block font-medium text-lg mb-4 text-center ${
                    theme === "dark" ? "text-gray-300" : "text-black"
                  }`}
                >
                  Ticket Images:
                </label>
                <div
                  id="printArea"
                  className="flex items-center justify-center w-full relative"
                >
                  {Array.isArray(uploadedImages) &&
                    uploadedImages.length > 0 &&
                    uploadedImages.map((image, index) => {
                      let zIndex;
                      if (index === uploadedImages.length - 1) {
                        zIndex = 2;
                      } else if (index === uploadedImages.length - 2) {
                        zIndex = 1;
                      } else {
                        zIndex = 0;
                      }
                      return (
                        <div
                          key={index}
                          className={`relative w-48 h-64 transform transition-transform duration-300 hover:scale-105 ${
                            index === 0 ? "-ml-2" : "-ml-10"
                          } mt-4`}
                          style={{ zIndex }}
                        >
                          <img
                            src={image}
                            alt={`uploaded ${index}`}
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
                              <FontAwesomeIcon icon={faSearchPlus} size="lg" />
                            </button>
                            {isEditing && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteImage(index);
                                }}
                                className="text-white hover:text-gray-300 focus:outline-none"
                              >
                                <FontAwesomeIcon icon={faTrashAlt} size="lg" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {isEditing && navigator.onLine && (
                    <div
                      onClick={() => triggerFileInput(false)}
                      className={`relative w-48 h-64 p-6 rounded-lg border-2 cursor-pointer transition-colors duration-500 z-10 ${
                        theme === "dark"
                          ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                          : "bg-white border-gray-300 hover:bg-gray-100 text-black"
                      } ${
                        Array.isArray(uploadedImages) &&
                        uploadedImages.length > 0
                          ? "-ml-10 mt-4"
                          : "mt-4"
                      }`}
                    >
                      <div className="flex items-center justify-center h-full">
                        {Array.isArray(uploadedImages) &&
                        uploadedImages.length === 0 ? (
                          <>
                            <FontAwesomeIcon icon={faCamera} size="3x" />
                            <FontAwesomeIcon
                              icon={faFolderOpen}
                              size="3x"
                              className="ml-4"
                            />
                          </>
                        ) : (
                          <FontAwesomeIcon icon={faPlusCircle} size="3x" />
                        )}
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Image Modal */}
              <Suspense fallback={<div>Loading...</div>}>
                <Modal
                  isOpen={isModalOpen}
                  onRequestClose={closeModal}
                  contentLabel="Image Zoom Modal"
                  /* Overlay with semi-dark backdrop */
                  overlayClassName={`fixed inset-0 z-40 flex items-center justify-center transition-all ${
                    theme === "dark"
                      ? "bg-black bg-opacity-80"
                      : "bg-black bg-opacity-50"
                  }`}
                  /* Center the modal content */
                  className="relative outline-none flex items-center justify-center"
                >
                  {/* Container with soft zoom animation & nicer aesthetics */}
                  <div
                    className={`relative max-w-3xl w-full mx-auto rounded-xl shadow-2xl ${
                      theme === "dark" ? "bg-gray-900" : "bg-white"
                    } animate-zoomModal overflow-hidden`}
                    style={{ maxHeight: "90vh" }}
                  >
                    {selectedImage && (
                      <div className="relative flex flex-col items-center p-4">
                        <img
                          src={selectedImage}
                          alt="Selected"
                          className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-md"
                        />
                        {/* High-contrast close button on top-right */}
                        <button
                          onClick={closeModal}
                          className="absolute top-3 right-3 bg-black bg-opacity-70 rounded-full p-2
                       hover:bg-opacity-90 transition focus:outline-none"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            stroke="#fff"
                            viewBox="0 0 24 24"
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
                    )}
                  </div>
                </Modal>
              </Suspense>

              <style>
                {`
  @keyframes zoomModal {
    0%   { transform: scale(0.95); opacity: 0.85; }
    100% { transform: scale(1);    opacity: 1;    }
  }
  .animate-zoomModal {
    animation: zoomModal 0.2s ease-out forwards;
  }
`}
              </style>
            </div>

            {/* Action Buttons */}
            <animated.div style={buttonAnimation} className="text-center mt-12">
              {!isEditing ? (
                <div className="flex flex-wrap gap-2 justify-center">
                  {userRole !== "P" && (
                    <button
                      onClick={handleExport}
                      className={`w-full sm:w-auto px-4 py-2 font-semibold rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 ${
                        theme === "dark"
                          ? "bg-yellow-600 hover:bg-yellow-700 text-gray-200"
                          : "bg-yellow-500 hover:bg-yellow-600 text-white"
                      }`}
                    >
                      Export
                    </button>
                  )}

                  {userRole !== "P" && (
                    <div className="hidden md:block">
                      <PrintSection
                        userRole={userRole}
                        ticket={ticket}
                        theme={theme}
                        buttonAnimation={buttonAnimation}
                        isEditing={isEditing}
                        uploadedImages={uploadedImages}
                        gpsLocation={gpsLocation}
                      />
                    </div>
                  )}

                  {ticket.Billed === "Y" && userRole === "A" && (
                    <button
                      onClick={handleUnbillClick}
                      className={`w-full sm:w-auto px-4 py-2 font-semibold rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 ${
                        theme === "dark"
                          ? "bg-red-600 text-gray-200"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      Unbill
                    </button>
                  )}

                  {ticket.Billed !== "Y" && (
                    <button
                      onClick={handleEditClick}
                      className={`w-full sm:w-auto px-4 py-2 font-semibold rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 ${
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
                      className={`w-full sm:w-auto px-4 py-2 font-semibold rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 ${
                        theme === "dark"
                          ? "bg-green-600 hover:bg-green-700 text-gray-200"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      Bill
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 justify-center mt-4">
                  <button
                    onClick={handleSaveClick}
                    className={`w-full sm:w-auto px-6 py-3 font-semibold rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 ${
                      theme === "dark"
                        ? "bg-green-600 hover:bg-green-700 text-gray-200"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelClick}
                    className={`w-full sm:w-auto px-6 py-3 font-semibold rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 ${
                      theme === "dark"
                        ? "bg-red-600 hover:bg-red-700 text-gray-200"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className={`w-full sm:w-auto px-6 py-3 font-semibold rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 ${
                      theme === "dark"
                        ? "bg-red-600 hover:bg-red-700 text-gray-200"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                  >
                    Delete
                  </button>
                </div>
              )}

              {/* Timestamps */}
              <div className="mt-8 text-center text-sm space-y-2">
                {/* Last updated */}
                {ticket.lastUser && ticket.lastUpdatedTimestamp && (
                  <div style={{ opacity: 0.8 }}>
                    Last updated by {ticket.lastUser} on{" "}
                    {formattedLastUpdatedDate}
                    {parsedLastUpdatedGPSValue &&
                      parsedLastUpdatedGPSValue.lat && (
                        <>
                          {" "}
                          at{" "}
                          <a
                            href={`https://maps.google.com/?q=${parsedLastUpdatedGPSValue.lat},${parsedLastUpdatedGPSValue.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`underline hover:opacity-80 ${
                              theme === "dark"
                                ? "text-blue-300"
                                : "text-blue-700"
                            }`}
                          >
                            Google Maps
                          </a>{" "}
                          |{" "}
                          <a
                            href={`https://maps.apple.com/?q=${parsedLastUpdatedGPSValue.lat},${parsedLastUpdatedGPSValue.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`underline hover:opacity-80 ${
                              theme === "dark"
                                ? "text-blue-300"
                                : "text-blue-700"
                            }`}
                          >
                            Apple Maps
                          </a>
                        </>
                      )}
                  </div>
                )}
                {/* Created */}
                {ticket.UserID && ticket.createdTimestamp && (
                  <div style={{ opacity: 0.8 }}>
                    Created by {ticket.UserID} on {formattedCreatedDate}
                    {createdGPSLocation && createdGPSLocation.lat && (
                      <>
                        {" "}
                        at{" "}
                        <a
                          href={`https://maps.google.com/?q=${createdGPSLocation.lat},${createdGPSLocation.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`underline hover:opacity-80 ${
                            theme === "dark" ? "text-blue-300" : "text-blue-700"
                          }`}
                        >
                          Google Maps
                        </a>{" "}
                        |{" "}
                        <a
                          href={`https://maps.apple.com/?q=${createdGPSLocation.lat},${createdGPSLocation.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`underline hover:opacity-80 ${
                            theme === "dark" ? "text-blue-300" : "text-blue-700"
                          }`}
                        >
                          Apple Maps
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>
            </animated.div>
          </animated.div>
        </animated.div>

        {/* Confirmation Modals */}
        <Suspense fallback={<div>Loading...</div>}>
          {/* Ticket-level deletion */}
          <ConfirmationModal
            isOpen={showConfirmation}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            confirmationQuestion="Are you sure you want to delete this ticket?"
            actionButtonLabel="Delete"
          />
          {/* Billing */}
          <ConfirmationModal
            isOpen={showBillingConfirmation}
            onConfirm={handleBillConfirm}
            onCancel={handleBillCancel}
            confirmationQuestion="Are you sure you want to mark this ticket as billed?"
            actionButtonLabel="Bill"
          />
          {/* Item removal */}
          <ConfirmationModal
            isOpen={showRemoveItemModal}
            onConfirm={handleRemoveItemConfirm}
            onCancel={handleRemoveItemCancel}
            confirmationQuestion="Are you sure you want to remove this item?"
            actionButtonLabel="Remove"
          />
        </Suspense>
      </animated.main>

      <style jsx>{`
        :root {
          --btn-bg-light: #f0f0f0;
          --btn-text-light: #333;
          --btn-bg-dark: #333;
          --btn-text-dark: #f0f0f0;
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
