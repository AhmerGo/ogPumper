import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import { useTheme } from "./ThemeContext";
import { useUser } from "./UserContext";
import { MdHome } from "react-icons/md";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearchPlus,
  faTrashAlt,
  faCamera,
  faFolderOpen,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";

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
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const MAX_FILE_SIZE = 6 * 1024 * 1024; // 5MB

  const [retrievedImages, setRetrievedImages] = useState([]);
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

  const initializeTicketState = (ticketData) => {
    if (!ticketData.Items) {
      setTicket({ ...ticketData, Items: [] });
      return;
    }

    // Initialize itemsMap with correct UseQuantity values
    const itemsMap = new Map(
      ticketData.Items.map((item) => [
        item.JobItemID,
        {
          ItemCost: parseFloat(item.ItemCost),
          UseQuantity: item.UseQuantity === "Y" || item.UseQuantity === true,
        },
      ])
    );
    setItemsMap(itemsMap);

    const updatedItems = ticketData.Items.map((item) => {
      const itemData = itemsMap.get(item.JobItemID) || {
        ItemCost: 0,
        UseQuantity: false,
      };
      const quantity = itemData.UseQuantity ? parseFloat(item.Quantity) : 1;
      const totalCost = (itemData.ItemCost * quantity).toFixed(2);
      return { ...item, totalCost, UseQuantity: itemData.UseQuantity };
    });

    setTicket({ ...ticketData, Items: updatedItems });
    setFormattedDate(
      new Date(ticketData.TicketDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
    setFieldNote(ticketData.Note || "");
  };

  useEffect(() => {
    if (location.state) {
      initializeTicketState(location.state.ticket);
      fetchTicketImages(location.state.ticket.ImageDirectory);
    } else {
      const cachedTicket = JSON.parse(localStorage.getItem("currentTicket"));
      if (cachedTicket) {
        initializeTicketState(cachedTicket);
        fetchTicketImages(cachedTicket.ImageDirectory);
      }
    }
  }, [location.state]);
  useEffect(() => {
    if (ticket) {
      console.log(ticket); // Log the updated ticket state
    }
  }, [ticket]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    setFormattedDate(date.toLocaleDateString(undefined, options));
  };
  const handleDeleteImage = async (index) => {
    const imageToDelete = uploadedImages[index];

    if (!imageToDelete) {
      console.error("Image to delete is undefined");
      return;
    }

    // Remove the selected image from the uploadedImages array
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(updatedImages);

    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input field
    }

    try {
      // Check if the user is online
      if (navigator.onLine) {
        // Prepare the PATCH request payload
        const patchData = {
          Ticket: ticket.Ticket,
          removedImages: [imageToDelete.split("/").pop()], // Only send the image name
        };

        // Determine the base URL based on the subdomain
        const hostname = window.location.hostname;
        const parts = hostname.split(".");
        let baseUrl;

        if (parts.length > 2) {
          const subdomainPart = parts.shift();
          baseUrl = `https://${subdomainPart}.ogpumper.net`;
          console.log(`Using subdomain URL: ${baseUrl}`);
        } else {
          baseUrl = "https://ogfieldticket.com";
          console.log(`Using default URL: ${baseUrl}`);
        }

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
          console.log("Image deleted successfully:", imageToDelete);
          // Update the ticket in local storage
          const storedTickets =
            JSON.parse(localStorage.getItem("tickets")) || [];
          const updatedStoredTickets = storedTickets.map((t) =>
            t.Ticket === ticket.Ticket
              ? { ...ticket, ImageDirectory: updatedImages.join(",") }
              : t
          );
          localStorage.setItem("tickets", JSON.stringify(updatedStoredTickets));
        } else {
          console.error("Error deleting image:", response.statusText);
        }
      } else {
        console.warn("User is offline. Changes will be synced when online.");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleChange = (e, itemId) => {
    const { name, value } = e.target;
    const parsedValue = parseFloat(value);

    setTicket((prevTicket) => {
      const updatedItems = prevTicket.Items.map((item) => {
        if (item.TicketLine === itemId) {
          const updatedItem = { ...item, [name]: value };
          if (name === "Quantity" && item.UseQuantity) {
            const itemData = itemsMap.get(item.JobItemID) || {
              ItemCost: 0,
              UseQuantity: false,
            };
            const totalCost = (itemData.ItemCost * parsedValue).toFixed(2);
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
    if (location.state) {
      initializeTicketState(location.state.ticket);
    } else {
      const cachedTicket = JSON.parse(localStorage.getItem("currentTicket"));
      if (cachedTicket) {
        initializeTicketState(cachedTicket);
      }
    }
  };

  const handleSaveClick = async () => {
    try {
      const updatedTicket = { ...ticket, Note: fieldNote };
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let baseUrl;

      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        baseUrl = `https://${subdomainPart}.ogpumper.net`;
      } else {
        baseUrl = "https://ogfieldticket.com";
      }

      localStorage.setItem("currentTicket", JSON.stringify(updatedTicket));

      const storedTickets = JSON.parse(localStorage.getItem("tickets")) || [];
      const patchData = {
        ...updatedTicket,
        addedImages: [],
        removedImages: [],
      };

      // Extract image names from retrievedImages
      const existingImageNames = Array.isArray(retrievedImages)
        ? retrievedImages.map((image) => image.split("/").pop())
        : [];
      const addedImages = Array.isArray(uploadedImages)
        ? uploadedImages.filter(
            (image) => !existingImageNames.includes(image.split("/").pop())
          )
        : [];

      for (const addedImage of addedImages) {
        const imageName = addedImage.split("/").pop();
        if (existingImageNames.includes(imageName)) continue;

        const response = await fetch(addedImage);
        const blob = await response.blob();
        const reader = new FileReader();
        const base64Data = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result.split(",")[1]);
          reader.readAsDataURL(blob);
        });

        const fileExtension = (addedImage.match(/\.\w+$/) || [".jpg"])[0];
        patchData.addedImages.push({
          name: `${Date.now()}_${patchData.addedImages.length}${fileExtension}`,
          data: base64Data,
        });
      }

      const removedImages = existingImageNames.filter(
        (image) =>
          !Array.isArray(uploadedImages) ||
          !uploadedImages.map((img) => img.split("/").pop()).includes(image)
      );
      patchData.removedImages = removedImages;

      // Send the patch request regardless of online status
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
        const updatedStoredTickets = storedTickets.map((t) =>
          t.Ticket === ticket.Ticket
            ? { ...updatedTicket, ImageDirectory: uploadedImages.join(",") }
            : t
        );
        localStorage.setItem("tickets", JSON.stringify(updatedStoredTickets));
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
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let baseUrl;

      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        baseUrl = `https://${subdomainPart}.ogpumper.net`;
        console.log(`Using subdomain URL: ${baseUrl}`);
      } else {
        baseUrl = "https://ogfieldticket.com";
        console.log(`Using default URL: ${baseUrl}`);
      }

      if (navigator.onLine) {
        const response = await fetch(
          `${baseUrl}/api/tickets.php?ticket=${ticket.Ticket}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          // Remove ticket from local storage
          const storedTickets =
            JSON.parse(localStorage.getItem("tickets")) || [];
          const updatedStoredTickets = storedTickets.filter(
            (t) => t.Ticket !== ticket.Ticket
          );
          localStorage.setItem("tickets", JSON.stringify(updatedStoredTickets));

          // Remove current ticket from local storage if it matches the deleted ticket
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
        // User is offline, remove ticket from local storage
        const storedTickets = JSON.parse(localStorage.getItem("tickets")) || [];
        const updatedStoredTickets = storedTickets.filter(
          (t) => t.Ticket !== ticket.Ticket
        );
        localStorage.setItem("tickets", JSON.stringify(updatedStoredTickets));

        // Remove current ticket from local storage if it matches the deleted ticket
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

  const fetchTicketImages = async (imageDirectory) => {
    try {
      // Determine the base URL based on the subdomain
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let baseUrl;

      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        baseUrl = `https://${subdomainPart}.ogpumper.net`;
        console.log(`Using subdomain URL: ${baseUrl}`);
      } else {
        baseUrl = "https://ogfieldticket.com";
        console.log(`Using default URL: ${baseUrl}`);
      }
      const encodedImageDirectory = encodeURIComponent(
        imageDirectory.replace(/^\.\.\//, "")
      );
      const response = await fetch(
        `${baseUrl}/api/tickets.php?imageDirectory=${encodedImageDirectory}`
      );
      console.log("stasneyDom");
      console.log(baseUrl);
      const data = await response.json();
      setRetrievedImages(data.images);
      setUploadedImages(data.images); // Set initial state for uploadedImages
    } catch (error) {
      console.error("Error fetching ticket images:", error);
    }
  };
  const onImageChange = (event) => {
    const files = event.target.files;
    if (!files) {
      return;
    }

    const validFiles = Array.from(files).filter(
      (file) => file.size <= MAX_FILE_SIZE
    );

    if (validFiles.length !== files.length) {
      alert("Some files are too large. Maximum file size is 2MB.");
    }

    if (validFiles.length > 0) {
      handleImageUpload({ target: { files: validFiles } });
    } else {
      // Clear the file input if no valid files
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

  const openModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
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
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let baseUrl;

      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        baseUrl = `https://${subdomainPart}.ogpumper.net`;
        console.log(`Using subdomain URL: ${baseUrl}`);
      } else {
        baseUrl = "https://ogfieldticket.com";
        console.log(`Using default URL: ${baseUrl}`);
      }

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
                    <div className="flex flex-col items-center">
                      <p
                        className={`font-bold ${
                          theme === "dark"
                            ? "text-indigo-400"
                            : "text-indigo-600"
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
                  {/* Billed Section */}
                  {userRole !== "P" && (
                    <animated.p
                      style={itemAnimation}
                      className={`font-bold ${
                        theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                      } text-center`}
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
            </div>{" "}
            {ticket?.Items?.length > 0 &&
              ticket.Items.map((item) => (
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
                  <div className="flex flex-col md:flex-row items-center w-full md:w-auto gap-4 md:gap-12">
                    {userRole !== "P" && (
                      <div className="flex-1 text-center md:text-center">
                        <p
                          className={`text-base ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <span className="font-medium">Total Cost:</span> $
                          {item.totalCost}
                        </p>
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
                          {item.UseQuantity ? (
                            <input
                              type="number"
                              name="Quantity"
                              value={item.Quantity}
                              onChange={(e) => handleChange(e, item.TicketLine)}
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
              ))}
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
            <div className="flex flex-col items-center justify-center w-full px-4">
              <div className="mb-4 w-full max-w-5xl">
                <label
                  className={`block font-medium text-lg mb-4 text-center ${
                    theme === "dark" ? "text-gray-300" : "text-black"
                  }`}
                >
                  Ticket Images:
                </label>
                <div className="flex items-center justify-center w-full relative">
                  {Array.isArray(uploadedImages) &&
                    uploadedImages.length > 0 &&
                    uploadedImages.map((image, index) => {
                      let zIndex;
                      if (index === uploadedImages.length - 1) {
                        zIndex = 2; // Most recent image
                      } else if (index === uploadedImages.length - 2) {
                        zIndex = 1; // Second most recent image
                      } else {
                        zIndex = 0; // All other images
                      }

                      return (
                        <div
                          key={index}
                          className={`relative w-48 h-64 transform transition-transform duration-300 hover:scale-105 ${
                            index === 0 ? "-ml-2" : "-ml-10"
                          } mt-4`}
                          style={{
                            zIndex,
                          }}
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
                  {isEditing && (
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
                    onChange={(e) => {
                      console.log("Files selected: ", e.target.files);
                      handleImageChange(e);
                    }}
                    ref={fileInputRef}
                    className="hidden"
                  />
                </div>
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
                  className={`p-4 rounded-lg shadow-lg max-w-3xl mx-auto z-50 relative ${
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
                    className={`px-4 py-2 font-semibold rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 ${
                      theme === "dark"
                        ? "bg-green-600 hover:bg-green-700 text-gray-200"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelClick}
                    className={`px-4 py-2 font-semibold rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 ${
                      theme === "dark"
                        ? "bg-red-600 hover:bg-red-700 text-gray-200"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className={`px-4 py-2 font-semibold rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 ${
                      theme === "dark"
                        ? "bg-red-600 hover:bg-red-700 text-gray-200"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
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
