import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { useSpring, animated } from "react-spring";
import { useUser } from "./UserContext";
import Modal from "react-modal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearchPlus,
  faTrashAlt,
  faCamera,
  faFolderOpen,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";

function FieldTicketEntry() {
  const { state } = useLocation();
  const { ticketType } = state;
  const { theme } = useTheme();
  const { userRole, userID } = useUser();
  const [subdomain, setSubdomain] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB

  const navigate = useNavigate();

  const [formFields, setFormFields] = useState({
    leaseID: state?.leaseID || "",
    ticketDate: state?.ticketDate || "",
    lease: state?.lease || "",
    well: state?.well || "",
    ticketType: state?.ticketType || "",
    ticketNumber: (state?.highestTicketNumber).toString(),
    note: state?.noteDefault || "",
  });

  const [items, setItems] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);

  useEffect(() => {
    const extractSubdomain = () => {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        setSubdomain(subdomainPart);
      } else {
        setSubdomain("");
      }
    };

    extractSubdomain();
    window.scrollTo(0, 0);
  }, []);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setUploadedImages((prevImages) => [...prevImages, ...imageUrls]);
    onImageChange(event);
  };

  useEffect(() => {
    const fetchTicketTypes = async () => {
      try {
        const hostname = window.location.hostname;
        const parts = hostname.split(".");
        let baseUrl;

        if (parts.length > 2) {
          const subdomainPart = parts.shift();
          baseUrl = `https://${subdomainPart}.ogpumper.net`;
        } else {
          baseUrl = "https://ogfieldticket.com";
        }
        const response = await fetch(`${baseUrl}/api/jobs.php`);
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
  }, [ticketType, subdomain]);

  const handleChange = (e, itemId) => {
    const { name, value } = e.target;
    if (name === "note") {
      setFormFields((prevFields) => ({
        ...prevFields,
        [name]: value,
      }));
    } else if (name === "quantity") {
      const quantity = parseFloat(value);
      if (quantity > 0) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.JobItemID === itemId ? { ...item, [name]: quantity } : item
          )
        );
      } else {
        console.warn("Quantity must be a positive number");
      }
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

  const handleDeleteImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input field
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
  const handleImageUpload = (e) => {
    const files = e.target.files;
    const newImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        newImages.push(URL.createObjectURL(file));
      }
    }

    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const openModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const pageAnimation = useSpring({
    from: { opacity: 0, y: 50 },
    to: { opacity: 1, y: 0 },
    config: { mass: 1, tension: 280, friction: 25 },
  });

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedTicketType = ticketTypes.find(
        (type) => type.Description === formFields.ticketType
      );

      const jobTypeID = selectedTicketType ? selectedTicketType.JobTypeID : "";

      const updatedItems = items.map((item) => ({
        ...item,
        quantity: item.quantity || item.ItemQuantity || 0,
      }));

      const formattedDate = new Date().toISOString().split("T")[0];

      const baseUrl = subdomain
        ? `https://${subdomain}.ogpumper.net`
        : "https://ogfieldticket.com";

      const ticketData = {
        ...formFields,
        lease: formFields.leaseID,
        JobTypeID: jobTypeID,
        userID: userID,
        items: updatedItems,
        note: formFields.note,
      };

      const updatedOfflineItems = updatedItems.map((item, index) => ({
        ItemCost: item.ItemCost,
        JobTypeID: ticketData.JobTypeID,
        ItemDescription: item.ItemDescription || "",
        JobItemID: item.ItemDescription,
        Note: item.note || null,
        Quantity: item.quantity || item.ItemQuantity || 0,
        Ticket: formFields.ticketNumber,
        TicketLine: index.toString(),
        UOM: item.UOM || "",
        UseCost: item.UseCost,
        UseQuantity: item.UseQuantity,
        ItemQuantity: item.ItemQuantity,
      }));

      const normalizedTicket = {
        Billed: "N",
        LeaseID: ticketData.lease,
        TicketDate: formattedDate,
        LeaseName: formFields.lease,
        WellID: ticketData.well || null,
        Comments: ticketData.note || "",
        JobDescription: ticketData.ticketType,
        JoTbypeID: ticketData.JobTypeID,
        Items: updatedOfflineItems,
        Note: ticketData.note || "",
        UserID: ticketData.userID,
        Ticket: formFields.ticketNumber,
      };

      // Save ticket to local storage
      const storedTickets = JSON.parse(localStorage.getItem("tickets")) || [];
      storedTickets.push(normalizedTicket);
      localStorage.setItem("tickets", JSON.stringify(storedTickets));

      const imagePromises = uploadedImages.map((image, index) => {
        return fetch(image)
          .then((response) => response.blob())
          .then((blob) => {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve({
                  name: `uploads/ticket_${formFields.ticketNumber}/image_${index}.jpg`,
                  data: reader.result.split(",")[1], // Remove the Base64 prefix
                  type: blob.type,
                });
              };
              reader.readAsDataURL(blob);
            });
          });
      });

      const imageFiles = await Promise.all(imagePromises);

      await Promise.all(imagePromises);

      const payload = {
        ticketData,
        images: imageFiles,
      };

      const response = await fetch(`${baseUrl}/api/tickets.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        navigate("/home");
      } else {
        console.error("Error submitting ticket:", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = formFields.ticketDate
    ? new Date(formFields.ticketDate).toLocaleDateString()
    : "N/A";

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

          <div
            className={`w-full max-w-6xl mx-auto transition-colors duration-500 ${
              theme === "dark"
                ? "bg-gray-800/90 text-gray-100"
                : "bg-white/90 text-gray-800"
            } backdrop-blur-md rounded-xl shadow-2xl overflow-hidden z-10`}
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

            <div className="px-6 py-8 md:px-12 md:py-16">
              <h2
                className={`text-4xl font-extrabold ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                } mb-10 text-center`}
              >
                Field Ticket
              </h2>
              {/* Desktop layout */}
              <div className="hidden sm:grid grid-cols-3 gap-8 mb-8 items-center text-center">
                <div>
                  <p
                    className={`text-lg ${
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
                      {formFields.ticketNumber || "N/A"}
                    </span>
                  </p>
                </div>

                <div>
                  <p
                    className={`text-lg ${
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
                  </p>
                </div>
                <div>
                  <p
                    className={`text-lg ${
                      theme === "dark" ? "text-indigo-400" : "text-indigo-600"
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
                      {formFields.lease || "N/A"}
                    </span>
                  </p>
                </div>
                <div>
                  <p
                    className={`text-lg ${
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
                      {formFields.well || "N/A"}
                    </span>
                  </p>
                </div>
                <div>
                  <p
                    className={`text-lg ${
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
                      {formFields.ticketType || "N/A"}
                    </span>
                  </p>
                </div>
              </div>
              {/* Mobile layout */}
              <div className="sm:hidden">
                <div className="grid grid-cols-2 gap-4 mb-8">
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
                      {formFields.ticketNumber || "N/A"}
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
                      {formFields.lease || "N/A"}
                    </span>
                  </div>

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
                      {formFields.well || "N/A"}
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
                      {formFields.ticketType || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              {items.map((item, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row justify-between items-center ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  } p-4 rounded-lg mb-4 shadow-md`}
                >
                  <div className="mb-4 md:mb-0 text-center md:text-left">
                    <h4 className="text-xl md:text-2xl font-semibold transition-colors duration-500">
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
                  <div className="flex items-center justify-center md:justify-end">
                    <label className="block font-medium transition-colors duration-500 mr-4">
                      Qty:
                    </label>
                    {item.ItemQuantity !== null ? (
                      <span
                        className={`inline-block w-24 px-4 py-2 rounded-md transition-colors duration-500 ${
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
                        onChange={(e) => handleChange(e, item.JobItemID)}
                        onClick={(e) => e.target.select()}
                        className={`form-input w-24 px-4 py-2 rounded-md transition-colors duration-500 ${
                          theme === "dark"
                            ? "bg-gray-800 border border-gray-700 focus:ring-gray-600 text-white"
                            : "border border-gray-300 focus:ring-gray-500"
                        }`}
                        placeholder="0"
                      />
                    )}
                  </div>
                </div>
              ))}
              <div className="mb-8 md:mb-16">
                <label className="block font-medium transition-colors duration-500 mb-2">
                  Note:
                </label>
                <textarea
                  name="note"
                  value={formFields.note || ""}
                  onChange={(e) => handleChange(e)}
                  className={`form-textarea w-full px-4 py-2 rounded-md transition-colors duration-500 ${
                    theme === "dark"
                      ? "bg-gray-800 border border-gray-700 focus:ring-gray-600 text-white"
                      : "border border-gray-300 focus:ring-gray-500"
                  }`}
                  rows={4}
                ></textarea>
              </div>
              <div className="flex items-center justify-center w-full relative">
                {uploadedImages.length > 0 &&
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(index);
                            }}
                            className="text-white hover:text-gray-300 focus:outline-none"
                          >
                            <FontAwesomeIcon icon={faTrashAlt} size="lg" />
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
                  } ${uploadedImages.length > 0 ? "-ml-10 mt-4" : "mt-4"}`}
                >
                  <div className="flex items-center justify-center h-full">
                    {uploadedImages.length === 0 ? (
                      <>
                        <button
                          className="focus:outline-none"
                          onClick={() => triggerFileInput(true)}
                        >
                          <FontAwesomeIcon icon={faCamera} size="3x" />
                        </button>
                        <button
                          className="focus:outline-none ml-4"
                          onClick={() => triggerFileInput(false)}
                        >
                          <FontAwesomeIcon icon={faFolderOpen} size="3x" />
                        </button>
                      </>
                    ) : (
                      <button
                        className="focus:outline-none"
                        onClick={() => triggerFileInput(false)}
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
                  onChange={(e) => {
                    console.log("Files selected: ", e.target.files);
                    handleImageChange(e);
                  }}
                  ref={fileInputRef}
                  className="hidden"
                />

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
                  <div className="bg-white p-4 rounded-lg shadow-lg max-w-xl mx-auto z-50 relative">
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
                              stroke="currentColor"
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
              <div className="text-center">
                <button
                  onClick={handleFinalSubmit}
                  className={`text-xl md:text-2xl px-12 py-4 focus:outline-none focus:ring-4 shadow-lg shadow-gray-500/50 hover:shadow-gray-600/50 font-semibold rounded-full transition-all ease-in-out duration-300 ${
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
        </>
      )}
    </animated.main>
  );
}

export default FieldTicketEntry;
