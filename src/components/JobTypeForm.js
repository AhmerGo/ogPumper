import React, { useState, useEffect } from "react";
import { useSpring, animated, useTransition, useTrail } from "react-spring";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBusinessTime,
  faListUl,
  faTrash,
  faPlus,
  faPencilAlt,
  faTrashAlt,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "./ThemeContext";
import Modal from "react-modal";
import axios from "axios";

Modal.setAppElement("#root"); // Add this line to bind the modal to your app's root element

const JobListPage = () => {
  const [ticketTypes, setTicketTypes] = useState([]);
  const [activeJobId, setActiveJobId] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const [showTextBox, setShowTextBox] = useState(false);

  const fetchTicketTypes = async () => {
    try {
      const response = await fetch("https://ogfieldticket.com/api/jobs.php");
      const data = await response.json();
      setTicketTypes(data);
    } catch (error) {
      console.error("Error fetching ticket types:", error);
    }
  };

  useEffect(() => {
    fetchTicketTypes();
  }, []);

  const titleAnimation = useSpring({
    from: { opacity: 0, transform: "translateY(-10px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { tension: 300, friction: 20 },
  });
  const jobAnimation = useSpring({
    from: { opacity: 0, transform: "translateY(30px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  });

  const expandAnimation = useSpring({
    from: { opacity: 0, maxHeight: "0px" },
    to: { opacity: 1, maxHeight: "1000px" },
    config: { tension: 200, friction: 20 },
  });
  const buttonAnimation = useSpring({
    transform: showTextBox ? "translateX(-240px)" : "translateX(0px)",
    config: { tension: 170, friction: 26 },
  });

  const textBoxAnimation = useSpring({
    transform: showTextBox ? "translateX(0%)" : "translateX(240px)",
    opacity: showTextBox ? 1 : 0,
    config: { tension: 170, friction: 26 },
    immediate: true,
  });

  const toggleTextBox = () => {
    setShowTextBox(!showTextBox);
  };

  const toggleJob = (jobId) => {
    setActiveJobId(activeJobId === jobId ? null : jobId);
  };

  const deleteItem = async (itemId) => {
    try {
      const response = await fetch(
        `https://ogfieldticket.com/api/jobs.php?itemID=${itemId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        fetchTicketTypes();
      } else {
        console.error("Error deleting item:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const deleteJob = async (jobTypeId) => {
    try {
      const response = await fetch(
        `https://ogfieldticket.com/api/jobs.php?jobtype=${jobTypeId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        fetchTicketTypes();
        const responseData = await response.json();
        alert(responseData.message);
      } else {
        console.error("Error deleting job:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const handleKeyPress = async (event) => {
    if (event.key === "Enter") {
      const jobDescription = event.target.value;

      try {
        const response = await fetch("https://ogfieldticket.com/api/jobs.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jobDescription }),
        });
        if (response.ok) {
          event.target.value = "";
          fetchTicketTypes();
        } else {
          console.error("Error adding new job:", response.statusText);
        }
      } catch (error) {
        console.error("Error adding new job:", error);
      }
      setShowTextBox(false);
    }
  };

  const addItem = async (jobTypeId, newItem) => {
    try {
      const response = await fetch(
        "https://ogfieldticket.com/api/jobitem.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...newItem, job_type_id: jobTypeId }),
        }
      );

      if (response.ok) {
        fetchTicketTypes();
      } else {
        console.error("Error adding new item:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding new item:", error);
    }
  };
  return (
    <>
      <div
        className={`max-w-7xl mx-auto p-4 min-h-screen ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
        }`}
      >
        {" "}
        <animated.header
          style={titleAnimation}
          className="text-center py-10 relative"
        >
          <h1 className="text-5xl font-extrabold mb-5">Job Listings</h1>
          <div className="absolute top-0 right-0 p-4">
            <animated.div className="flex items-center" style={buttonAnimation}>
              <animated.button
                onClick={toggleTextBox}
                className={`p-2 rounded-full focus:outline-none transition-colors duration-300 ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                <FontAwesomeIcon
                  icon={faPlus}
                  className={`h-8 w-8 transition-transform duration-300 ${
                    showTextBox ? "rotate-45" : ""
                  }`}
                />
              </animated.button>
              <animated.div
                style={textBoxAnimation}
                className={`absolute p-4 rounded-lg shadow-sm transition-all duration-300 ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                } left-full top-0 mt-[-11px] ml-2`}
              >
                <input
                  type="text"
                  placeholder="Enter job title"
                  className={`px-4 py-2 rounded-lg focus:outline-none ${
                    theme === "dark"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-black"
                  }`}
                  onKeyPress={handleKeyPress}
                />
              </animated.div>
            </animated.div>
          </div>
        </animated.header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ticketTypes.map((job, index) => (
            <React.Fragment key={job.JobTypeID}>
              <animated.div
                key={job.JobTypeID}
                style={jobAnimation}
                className={`col-span-1 p-4 border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
                onClick={() => toggleJob(job.JobTypeID)}
              >
                <div className="flex items-center justify-between">
                  <animated.span
                    style={titleAnimation}
                    className="text-xl font-semibold"
                  >
                    <FontAwesomeIcon icon={faBusinessTime} className="mr-2" />
                    {job.Description}
                  </animated.span>
                  <div>
                    <FontAwesomeIcon
                      icon={faListUl}
                      className="mr-4 cursor-pointer transition-colors duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveJobId(
                          activeJobId === job.JobTypeID ? null : job.JobTypeID
                        );
                      }}
                    />
                    <FontAwesomeIcon
                      icon={faTrash}
                      className={`cursor-pointer ${
                        theme === "dark"
                          ? "text-gray-400 hover:text-red-500"
                          : "text-gray-600 hover:text-red-600"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteJob(job.JobTypeID);
                      }}
                    />
                  </div>
                </div>
              </animated.div>
              {activeJobId === job.JobTypeID && (
                <animated.div
                  style={expandAnimation}
                  className={`col-span-1 md:col-span-2 lg:col-span-3 p-4 ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <ItemsAnimation
                    items={job.Items}
                    onAddItem={(newItem) => addItem(job.JobTypeID, newItem)}
                    onDeleteItem={(itemId) => deleteItem(itemId)}
                    activeJobId={activeJobId}
                    setTicketTypes={setTicketTypes}
                  />
                </animated.div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <style jsx>
        {`
          .rotate-45 {
            transform: rotate(45deg);
          }
        `}
      </style>
    </>
  );
};

const ItemsAnimation = ({
  items,
  onAddItem,
  onDeleteItem,
  activeJobId,
  setTicketTypes,
}) => {
  const { theme } = useTheme();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [editingItemCost, setEditingItemCost] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemEdits, setItemEdits] = useState({});

  const handleEditClick = (item) => {
    setEditingItemId(item.ItemID);
    setItemEdits({
      ItemDescription: item.ItemDescription,
      ItemCost: item.ItemCost,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemEdits((prev) => ({ ...prev, [name]: value }));
  };

  const finalizeEdit = async (items, setTicketTypes) => {
    try {
      await axios.patch(
        `https://ogfieldticket.com/api/jobs.php?itemID=${editingItemId}`,
        itemEdits
      );

      // Update the items locally to reflect changes
      const updatedItems = items.map((item) => {
        if (item.ItemID === editingItemId) {
          return { ...item, ...itemEdits };
        }
        return item;
      });

      // Update the ticketTypes state with the updated items
      setTicketTypes((prevTicketTypes) =>
        prevTicketTypes.map((job) => {
          if (job.JobTypeID === activeJobId) {
            return { ...job, Items: updatedItems };
          }
          return job;
        })
      );

      setEditingItemId(null);
      setItemEdits({});
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setItemEdits({});
  };

  const transitions = useTransition(items, {
    keys: (item) => item.ItemID,
    from: { opacity: 0, transform: "translate3d(0,-40px,0)" },
    enter: { opacity: 1, transform: "translate3d(0,0px,0)" },
    leave: { opacity: 0, transform: "translate3d(0,-40px,0)" },
  });

  const [isHovered, setIsHovered] = useState(false);

  const addButtonStyle = {
    from: { transform: "scale(1)" },
    enter: { transform: "scale(1.05)" },
    leave: { transform: "scale(1)" },
  };
  const [addButtonProps, set, stop] = useSpring(() => addButtonStyle.from);

  const iconColor = isHovered
    ? theme === "dark"
      ? "text-yellow-300"
      : "text-blue-500"
    : theme === "dark"
    ? "text-white"
    : "text-gray-800";

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    item_id: "",
    item_description: "",
    uom: "",
    use_quantity: "Y",
    item_cost: 0,
  });

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  };

  const handleAddItem = () => {
    const updatedNewItem = {
      ...newItem,
      use_quantity: newItem.use_quantity || "Y",
      job_type_id: activeJobId,
    };
    onAddItem(updatedNewItem);
    setNewItem({
      item_id: "",
      item_description: "",
      uom: "",
      use_quantity: "Y",
      item_cost: 0,
    });
    closeModal();
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {transitions((style, item) => (
        <animated.div
          key={item.key}
          style={style}
          className={`border rounded-lg shadow-sm p-4 relative ${
            theme === "dark"
              ? "bg-gray-800 text-white border-gray-700"
              : "bg-white text-gray-800 border-gray-300"
          }`}
        >
          {editingItemId === item.ItemID ? (
            <>
              <input
                type="text"
                name="ItemDescription"
                value={itemEdits.ItemDescription || ""}
                onChange={handleChange}
                className={`w-full mb-2 p-2 rounded ${
                  theme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-100 text-gray-800 border-gray-300"
                }`}
              />
              <input
                type="number"
                name="ItemCost"
                value={itemEdits.ItemCost || ""}
                onChange={handleChange}
                className={`w-full mb-4 p-2 rounded ${
                  theme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-100 text-gray-800 border-gray-300"
                }`}
              />
              <div className="flex justify-end space-x-2">
                <FontAwesomeIcon
                  icon={faSave}
                  onClick={() => finalizeEdit(items, setTicketTypes)}
                  className={`cursor-pointer ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                />
                <FontAwesomeIcon
                  icon={faTimes}
                  onClick={handleCancelEdit}
                  className={`cursor-pointer ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                />
              </div>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-lg mb-1">
                {item.ItemDescription}
              </h3>
              <p className="text-sm mb-4">Cost: ${item.ItemCost}</p>
              <div className="absolute top-2 right-2 flex space-x-2">
                <FontAwesomeIcon
                  icon={faPencilAlt}
                  onClick={() => handleEditClick(item)}
                  className={`cursor-pointer ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                />
                <FontAwesomeIcon
                  icon={faTrashAlt}
                  onClick={() => onDeleteItem(item.ItemID)}
                  className={`cursor-pointer ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                />
              </div>
            </>
          )}
        </animated.div>
      ))}{" "}
      <animated.div
        style={addButtonProps}
        onMouseEnter={() => {
          set({ ...addButtonStyle.enter });
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          set({ ...addButtonStyle.leave });
          setIsHovered(false);
        }}
        onClick={openModal}
        className={`border rounded-lg shadow-sm p-4 flex justify-center items-center cursor-pointer ${
          theme === "dark"
            ? "bg-gray-700 hover:bg-gray-600"
            : "bg-gray-100 hover:bg-gray-200"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="text-center">
          <i className={`material-icons ${iconColor} text-4xl`}>add_box</i>
          <div className="font-semibold text-xl mt-2">Add Item</div>
        </div>
      </animated.div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add Item Modal"
        className={`modal ${theme === "dark" ? "dark" : ""}`}
        overlayClassName="modal-overlay"
      >
        <div
          className={`relative rounded-lg shadow-xl p-8 ${
            theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <i className="material-icons text-2xl">close</i>
          </button>
          <h2 className="text-3xl font-bold mb-8">Add New Item</h2>
          <form>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <label htmlFor="item_id" className="block mb-2 font-semibold">
                  Item ID:
                </label>
                <input
                  type="text"
                  id="item_id"
                  name="item_id"
                  value={newItem.item_id}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 focus:ring-blue-400"
                      : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                  }`}
                />
              </div>
              <div>
                <label htmlFor="uom" className="block mb-2 font-semibold">
                  UOM:
                </label>
                <input
                  type="text"
                  id="uom"
                  name="uom"
                  value={newItem.uom}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 focus:ring-blue-400"
                      : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                  }`}
                />
              </div>
            </div>
            <div className="mb-8">
              <label
                htmlFor="item_description"
                className="block mb-2 font-semibold"
              >
                Item Description:
              </label>
              <textarea
                id="item_description"
                name="item_description"
                value={newItem.item_description}
                onChange={handleInputChange}
                rows="3"
                className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 focus:ring-blue-400"
                    : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                }`}
              ></textarea>
            </div>
            <div className="mb-8">
              <label htmlFor="item_cost" className="block mb-2 font-semibold">
                Item Cost:
              </label>
              <div className="relative">
                <span
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-lg ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  $
                </span>
                <input
                  type="number"
                  id="item_cost"
                  name="item_cost"
                  step="0.01"
                  value={newItem.item_cost}
                  onChange={handleInputChange}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 focus:ring-blue-400"
                      : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                  }`}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={closeModal}
                className={`px-6 py-2 rounded-lg focus:outline-none transition-colors duration-200 ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 focus:ring-2 focus:ring-gray-400"
                    : "bg-gray-200 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddItem}
                className={`px-6 py-2 text-white rounded-lg focus:outline-none transition-colors duration-200 ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"
                    : "bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"
                }`}
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      </Modal>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }

        .modal {
          position: relative;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 0.5rem;
          outline: none;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .modal.dark {
          background-color: #1a202c;
          color: white;
        }
      `}</style>
    </div>
  );
};
export default JobListPage;
