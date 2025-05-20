import React, { useState, useEffect } from "react";
import { useSpring, animated } from "react-spring";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBusinessTime,
  faListUl,
  faTrash,
  faPlus,
  faPencilAlt,
  faTrashAlt,
  faCheck,
  faTimes,
  faTasks,
  faStickyNote,
  faUserTag,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "ogcommon";
import Modal from "react-modal";
import axios from "axios";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { baseUrl } from "./config";

Modal.setAppElement("#root");

const JobListPage = () => {
  const [ticketTypes, setTicketTypes] = useState([]);
  const [activeJobId, setActiveJobId] = useState(null);
  const { theme } = useTheme();
  const [showTextBox, setShowTextBox] = useState(false);
  const [showNoteBox, setShowNoteBox] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [note, setNote] = useState("");
  const [visibleNoteJobId, setVisibleNoteJobId] = useState(null);
  const [editingNoteDefault, setEditingNoteDefault] = useState(null);
  const [editingJobName, setEditingJobName] = useState(null);
  const [editingJobNote, setEditingJobNote] = useState(null);
  const [subdomain, setSubdomain] = useState("");
  const [isJobRoleModalOpen, setIsJobRoleModalOpen] = useState(false);
  const [selectedJobTypeId, setSelectedJobTypeId] = useState(null);
  const [jobRoles, setJobRoles] = useState([]);
  const [selectedJobRoleIds, setSelectedJobRoleIds] = useState([]);
  const [newJobRoleName, setNewJobRoleName] = useState("");

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

  const fetchTicketTypes = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/jobs.php`);
      const data = await response.json();
      console.log(data);
      data.sort((a, b) => a.Description.localeCompare(b.Description));

      setTicketTypes(data);
    } catch (error) {
      console.error("Error fetching ticket types:", error);
    }
  };

  const fetchJobRoles = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/jobs.php`);
      const data = await response.json();

      // Extract JobRole values from each job type
      let allJobRoles = [];

      data.forEach((job) => {
        if (job.JobRole) {
          // Split the JobRole string by commas and trim whitespace
          const roles = job.JobRole.split(",").map((role) => role.trim());
          allJobRoles = allJobRoles.concat(roles);
        }
      });

      // Remove duplicates
      const uniqueJobRoles = Array.from(new Set(allJobRoles));

      setJobRoles(uniqueJobRoles);
    } catch (error) {
      console.error("Error fetching job roles:", error);
    }
  };

  useEffect(() => {
    fetchTicketTypes();
    fetchJobRoles();
  }, [subdomain]);

  const toggleNoteVisibility = (e, jobId) => {
    e.stopPropagation();
    console.log(`Toggling note for job ID: ${jobId}`);
    setVisibleNoteJobId((prevId) => {
      const newId = prevId === jobId ? null : jobId;
      console.log(`Updating visibleNoteJobId from ${prevId} to ${newId}`);
      return newId;
    });
  };

  const toggleNoteBox = () => {
    setShowNoteBox(!showNoteBox);
  };

  const handleCancelEdit = () => {
    setEditingJobName(null);
    setEditingJobNote(null);
  };

  const titleAnimation = useSpring({
    from: { opacity: 0, transform: "translateY(-10px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { tension: 300, friction: 20 },
  });

  const stickyNoteAnimation = useSpring({
    opacity: visibleNoteJobId ? 1 : 0,
    transform: visibleNoteJobId ? "translateY(0)" : "translateY(-20px)",
  });

  const jobAnimation = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  });

  const noteBoxAnimation = useSpring({
    opacity: showNoteBox ? 1 : 0,
    transform: showNoteBox ? "translateY(0)" : "translateY(-20px)",
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
    setJobDescription("");
    setNote("");
  };

  const toggleJob = (jobId) => {
    setActiveJobId(activeJobId === jobId ? null : jobId);
  };

  const deleteItem = async (itemId) => {
    try {
      const response = await fetch(
        `${baseUrl}/api/jobs.php?itemID=${itemId.JobItemID}`,
        {
          method: "DELETE",
          body: { itemId },
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
        `${baseUrl}/api/jobs.php?jobtype=${jobTypeId}`,
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

  const handleSaveJobName = async (jobId) => {
    try {
      await axios.patch(`${baseUrl}/api/jobs.php?jobtype=${jobId}`, {
        Description: editingJobName.name,
        JobTypeID: jobId,
      });
      setEditingJobName(null);
      fetchTicketTypes();
    } catch (error) {
      console.error("Error updating job name:", error);
    }
  };

  const handleEditJobName = (jobId, currentName) => {
    setEditingJobName({ jobId, name: currentName });
  };

  const handleSaveJobNote = async (jobId) => {
    try {
      await axios.patch(`${baseUrl}/api/jobs.php?jobtype=${jobId}`, {
        NoteDefault: editingJobNote.note,
        JobTypeID: jobId,
      });
      setEditingJobNote(null);
      fetchTicketTypes();
    } catch (error) {
      console.error("Error updating job note:", error);
    }
  };

  const handleKeyPress = async (event) => {
    if (event.key === "Enter") {
      try {
        const response = await fetch(`${baseUrl}/api/jobs.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jobDescription, note }),
        });

        if (response.ok) {
          setJobDescription("");
          setNote("");
          fetchTicketTypes();
        } else {
          console.error("Error adding new job:", response.statusText);
        }
      } catch (error) {
        console.error("Error adding new job:", error);
      }

      setShowTextBox(false);
      setShowNoteBox(false);
    }
  };

  const handleEditJobNote = (jobId, currentNote) => {
    setEditingJobNote({ jobId, note: currentNote });
  };

  const addItem = async (jobTypeId, newItem) => {
    try {
      console.log(JSON.stringify({ ...newItem, job_type_id: jobTypeId }));
      const response = await fetch(`${baseUrl}/api/jobitem.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newItem, job_type_id: jobTypeId }),
      });

      if (response.ok) {
        fetchTicketTypes();
      } else {
        console.error("Error adding new item:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding new item:", error);
    }
  };

  const handleJobRoleClick = (jobTypeId) => {
    setSelectedJobTypeId(jobTypeId);
    setIsJobRoleModalOpen(true);
    // Pre-fill selected job roles if available
    const job = ticketTypes.find((job) => job.JobTypeID === jobTypeId);
    if (job && job.JobRole) {
      const roles = job.JobRole.split(",").map((role) => role.trim());
      setSelectedJobRoleIds(roles);
    } else {
      setSelectedJobRoleIds([]);
    }
    setNewJobRoleName("");
  };

  const handleJobRoleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Combine selected job roles and new job role name (if provided)
      let allRoles = [...selectedJobRoleIds];
      if (newJobRoleName.trim() !== "") {
        allRoles.push(newJobRoleName.trim());
      }

      // Remove duplicates and trim whitespace
      const uniqueRoles = Array.from(
        new Set(allRoles.map((role) => role.trim()))
      );

      // Create a comma-separated string of job roles
      const jobRoleString = uniqueRoles.join(", ");

      // Patch the updated JobRole list to the job
      await axios.patch(
        `${baseUrl}/api/jobs.php?jobtype=${selectedJobTypeId}`,
        {
          JobRole: jobRoleString,
        }
      );

      fetchTicketTypes();
      fetchJobRoles();

      setIsJobRoleModalOpen(false);
      setSelectedJobRoleIds([]);
      setNewJobRoleName("");
    } catch (error) {
      console.error("Error updating JobRoles:", error);
    }
  };

  const handleJobRoleSelection = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    setSelectedJobRoleIds((prev) => {
      if (checked) {
        return [...prev, value];
      } else {
        return prev.filter((role) => role !== value);
      }
    });
  };

  return (
    <>
      <div
        className={`max-w-7xl mx-auto p-4 min-h-screen ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
        }`}
      >
        <animated.header
          style={titleAnimation}
          className="text-center py-10 relative"
        >
          <h1 className="text-5xl font-extrabold mb-5">Job Types</h1>
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
                  onClick={() => setShowNoteBox(false)}
                />
              </animated.button>
              <animated.div
                style={textBoxAnimation}
                className={`absolute p-4 rounded-lg shadow-sm transition-all duration-300 ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                } left-full top-0 mt-[-11px] ml-2 flex items-center`}
              >
                <input
                  type="text"
                  placeholder="Enter job title"
                  className={`px-4 py-2 rounded-lg focus:outline-none ${
                    theme === "dark"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-black"
                  }`}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <label className="flex items-center ml-4">
                  <input
                    type="checkbox"
                    checked={showNoteBox}
                    onChange={toggleNoteBox}
                    className="mr-2"
                  />
                  <FontAwesomeIcon icon={faTasks} className="text-gray-500" />
                </label>
              </animated.div>
              {showNoteBox && (
                <animated.div
                  style={noteBoxAnimation}
                  className={`absolute p-2 rounded-lg shadow-sm transition-all duration-300 ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  } left-full top-full mt-2 ml-2`}
                >
                  <input
                    type="text"
                    placeholder="Enter note"
                    className={`px-4 py-1 rounded-lg focus:outline-none ${
                      theme === "dark"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-100 text-black"
                    }`}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </animated.div>
              )}
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
                  theme === "dark"
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-900"
                }`}
                onClick={() => toggleJob(job.JobTypeID)}
              >
                <div className="flex items-center justify-between">
                  {editingJobName && editingJobName.jobId === job.JobTypeID ? (
                    <input
                      type="text"
                      value={editingJobName.name}
                      onChange={(e) =>
                        setEditingJobName({
                          ...editingJobName,
                          name: e.target.value,
                        })
                      }
                      onBlur={() => handleSaveJobName(job.JobTypeID)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSaveJobName(job.JobTypeID)
                      }
                      className={`text-xl font-semibold w-1/2 ${
                        theme === "dark"
                          ? "bg-gray-700 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    />
                  ) : (
                    <animated.span
                      style={titleAnimation}
                      className="text-xl font-semibold flex-grow"
                      onDoubleClick={() =>
                        handleEditJobName(job.JobTypeID, job.Description)
                      }
                    >
                      <FontAwesomeIcon icon={faBusinessTime} className="mr-2" />
                      {job.Description}
                    </animated.span>
                  )}

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
                    {/* New Icon for JobRole */}
                    <FontAwesomeIcon
                      icon={faUserTag}
                      className="cursor-pointer mr-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJobRoleClick(job.JobTypeID);
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
                        deleteJob(job.JobTypeID);
                      }}
                    />
                    <FontAwesomeIcon
                      icon={faStickyNote}
                      className="cursor-pointer ml-2"
                      onClick={(e) => {
                        toggleNoteVisibility(e, job.JobTypeID);
                      }}
                    />
                  </div>
                </div>
                {/* Display associated JobRoles */}
                {job.JobRoles && job.JobRoles.length > 0 && (
                  <div className="mt-2">
                    <strong>Job Roles:</strong>{" "}
                    {job.JobRoles.map((role) => role.Name).join(", ")}
                  </div>
                )}

                {visibleNoteJobId === job.JobTypeID && (
                  <animated.div
                    style={stickyNoteAnimation}
                    className={`col-span-1 p-4 border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {editingJobNote &&
                    editingJobNote.jobId === job.JobTypeID ? (
                      <textarea
                        value={editingJobNote.note}
                        onChange={(e) =>
                          setEditingJobNote({
                            ...editingJobNote,
                            note: e.target.value,
                          })
                        }
                        onBlur={() => handleSaveJobNote(job.JobTypeID)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSaveJobNote(job.JobTypeID)
                        }
                        className={`text-xl font-semibold w-1/2 ${
                          theme === "dark"
                            ? "bg-gray-700 text-white"
                            : "bg-white text-gray-900"
                        }`}
                        placeholder="Add a note..."
                      />
                    ) : (
                      <p
                        className={`text-lg ${
                          theme === "dark" ? "text-gray-100" : "text-gray-900"
                        }`}
                        onDoubleClick={() =>
                          handleEditJobNote(job.JobTypeID, job.NoteDefault)
                        }
                      >
                        {job.NoteDefault || "Double-click to add a note"}
                      </p>
                    )}
                  </animated.div>
                )}
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
                    subdomain={subdomain}
                    setSubdomain={setSubdomain}
                  />
                </animated.div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      {/* Job Role Modal */}
      {isJobRoleModalOpen && (
        <Modal
          isOpen={isJobRoleModalOpen}
          onRequestClose={() => setIsJobRoleModalOpen(false)}
          contentLabel="Select Job Roles"
          className={`modal ${theme === "dark" ? "dark" : ""}`}
          overlayClassName="modal-overlay"
        >
          {/* Modal content */}
          <div
            className={`relative rounded-lg shadow-xl p-8 ${
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-800"
            }`}
          >
            <button
              onClick={() => setIsJobRoleModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            >
              <i className="material-icons text-2xl">close</i>
            </button>
            <h2 className="text-3xl font-bold mb-8">Select Job Roles</h2>
            <form onSubmit={handleJobRoleSubmit}>
              <div className="mb-8">
                <label className="block mb-2 font-semibold">Job Roles:</label>
                <div className="max-h-60 overflow-y-auto border p-2 rounded">
                  {jobRoles.map((role) => (
                    <div key={role} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        value={role}
                        checked={selectedJobRoleIds.includes(role)}
                        onChange={handleJobRoleSelection}
                        className="form-checkbox"
                      />
                      <span className="ml-2">{role}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Option to create a new JobRole */}
              <div className="mb-8">
                <label
                  htmlFor="newJobRole"
                  className="block mb-2 font-semibold"
                >
                  Or Create New Job Role:
                </label>
                <input
                  type="text"
                  id="newJobRole"
                  name="newJobRole"
                  value={newJobRoleName}
                  onChange={(e) => setNewJobRoleName(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 focus:ring-blue-400"
                      : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                  }`}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsJobRoleModalOpen(false)}
                  className={`px-6 py-2 rounded-lg focus:outline-none transition-colors duration-200 ${
                    theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 focus:ring-2 focus:ring-gray-400"
                      : "bg-gray-200 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2 text-white rounded-lg focus:outline-none transition-colors duration-200 ${
                    theme === "dark"
                      ? "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"
                      : "bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"
                  }`}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
      <style jsx>
        {`
          .rotate-45 {
            transform: rotate(45deg);
          }
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
  subdomain,
  setSubdomain,
}) => {
  const { theme } = useTheme();
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemEdits, setItemEdits] = useState({});
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("new");

  /* ───────────────────────── NEW‑ITEM MODEL ─────────────────────────── */
  const [newItem, setNewItem] = useState({
    item_id: "",
    uom: "",
    item_description: "",
    item_quantity: null,
    item_cost: null,
    use_quantity: "Y", // Quantity allowed by default
    use_cost: "Y", // Cost input visible by default
    use_start_stop: "N", // Hours disabled by default
  });

  /* ───────────────────────── STATE  SYNC  ────────── */
  const [stateItems, setStateItems] = useState(items);
  useEffect(() => setStateItems(items), [items]);

  /* ───────────────────────── FETCH AVAILABLE ITEMS ──────────────────── */
  const fetchAvailableItems = async () => {
    try {
      const { data } = await axios.get(
        `${baseUrl}/api/jobitem.php?item_types=1`
      );
      setAvailableItems(data.itemTypes);
    } catch (err) {
      console.error("Error fetching available items:", err);
    }
  };

  /* ───────────────────────── FIND SUBDOMAIN ─────────────────────────── */
  useEffect(() => {
    const parts = window.location.hostname.split(".");
    setSubdomain(parts.length > 2 ? parts.shift() : "");
  }, []);

  /* ───────────────────────── PRE‑FILL ON ✎ CLICK ────────────────────── */
  useEffect(() => {
    if (!editingItemId) return;
    const row = stateItems.find((i) => i.ItemID === editingItemId);
    if (row) {
      setItemEdits({
        ...row,
        UseQuantity: row.UseQuantity ?? "Y",
        UseCost: row.UseCost ?? "Y",
        UseStartStop: row.UseStartStop ?? "N",
      });
    }
  }, [editingItemId, stateItems]);

  /* ---------- STATE UPDATE HANDLER ---------- */
  const handleChange = (e) => {
    const { name, type } = e.target;
    const value =
      type === "checkbox" ? (e.target.checked ? "Y" : "N") : e.target.value;

    setItemEdits((prev) => {
      const next = { ...prev, [name]: value };

      /* --- inter-dependency rules ----------------------------------- */
      // Hours ON ⇒ disable Quantity
      if (name === "UseStartStop") {
        if (value === "Y") {
          next.UseQuantity = "N";
          next.ItemQuantity = null; // keep this: Hours mode hides qty
        }
      }

      // Quantity ON ⇒ turn Hours OFF (but no longer clears ItemQuantity)
      if (name === "UseQuantity" && value === "Y") {
        next.UseStartStop = "N";
      }

      // Cost toggle controls ItemCost
      if (name === "UseCost" && value === "N") {
        next.ItemCost = null;
      }

      /* --- safety clamp (keep only for cost) ------------------------ */
      if (next.UseCost !== "Y") next.ItemCost = null;

      return next;
    });
  };

  /* ───────────────────────── PATCH EDITS TO API ─────────────────────── */
  const finalizeEdit = async () => {
    try {
      const {
        UseStartStop,
        UseCost,
        UseQuantity,
        ItemCost,
        ItemQuantity,
        ...rest
      } = itemEdits;

      const payload = {
        ...rest,
        use_start_stop: UseStartStop,
        use_cost: UseCost,
        use_quantity: UseQuantity,
        item_cost: ItemCost,
        item_quantity: ItemQuantity,
        newOrder: null,
      };

      const { data } = await axios.patch(
        `${baseUrl}/api/jobs.php?itemID=${editingItemId}`,
        payload
      );

      if (data.success) {
        const updated = stateItems.map((it) =>
          it.ItemID === editingItemId ? { ...it, ...itemEdits } : it
        );
        setStateItems(updated);
        setTicketTypes((jobs) =>
          jobs.map((job) =>
            job.JobTypeID === activeJobId ? { ...job, Items: updated } : job
          )
        );
        setEditingItemId(null);
        setItemEdits({});
      } else {
        console.error("Error updating item:", data.message);
      }
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  /* ───────────────────────── NEW‑ITEM CHANGE HANDLER ─────────────────── */
  // ---------------------------------------------------------------------------
  // One-stop input handler: supports text/select + all check-boxes
  // • ‘Lock Quantity’ inverts the usual Y/N logic
  // • Keeps mutual-exclusion rules in one place
  // ---------------------------------------------------------------------------
  const handleInputChange = (e) => {
    const { name, type, checked, value: raw } = e.target;

    // Resolve new value --------------------------------------------------------
    const value =
      type === "checkbox"
        ? name === "use_quantity" // special-case “Lock Quantity”
          ? checked
            ? "N"
            : "Y"
          : checked
          ? "Y"
          : "N"
        : raw;

    setNewItem((prev) => {
      let next = { ...prev, [name]: value };

      // --- Mutual-exclusion helpers ------------------------------------------
      if (name === "use_start_stop") {
        next.use_quantity = value === "Y" ? "N" : prev.use_quantity;
        if (value === "Y") next.item_quantity = null;
      }
      if (name === "use_quantity" && value === "Y") next.use_start_stop = "N";
      if (name === "use_cost" && value === "N") next.item_cost = null;

      // --- Item picker logic --------------------------------------------------
      if (name === "item_id") {
        if (value === "new") {
          return {
            item_id: "",
            uom: "",
            item_description: "",
            item_quantity: null,
            item_cost: null,
            use_quantity: "Y",
            use_cost: "Y",
            use_start_stop: "N",
          };
        }

        const chosen = availableItems.find((i) => i.ItemID === value);
        if (chosen) {
          next = {
            ...next,
            item_id: chosen.ItemID,
            uom: chosen.UOM,
            item_description: chosen.ItemDescription,
            use_quantity: chosen.UseQuantity ?? "Y",
            use_cost: chosen.UseCost ?? "Y",
            use_start_stop: chosen.UseStartStop ?? "N",
            item_cost:
              chosen.UseCost === "Y"
                ? parseFloat(chosen.defaultCost || 0)
                : null,
            item_quantity: chosen.UseQuantity === "Y" ? 1 : null,
          };
          if (next.use_start_stop === "Y") {
            next.use_quantity = "N";
            next.item_quantity = null;
          }
        }
      }

      return next;
    });
  };

  /* ───────────────────────── DELETE ITEM ─────────────────────────────── */
  const handleDeleteItem = (item) => {
    fetch(`${baseUrl}/api/jobs.php?itemID=${item.JobItemID}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        JobItemID: item.JobItemID,
        ItemDescription: item.ItemDescription,
      }),
    })
      .then((r) => {
        if (r.ok) {
          setStateItems((prev) =>
            prev.filter((i) => i.JobItemID !== item.JobItemID)
          );
          onDeleteItem(item);
        } else {
          throw new Error("Error deleting item");
        }
      })
      .catch((err) => console.error("Error deleting item:", err));
  };

  /* ───────────────────────── CANCEL EDIT ─────────────────────────────── */
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setItemEdits({});
  };

  /* ───────────────────────── DRAG & DROP ─────────────────────────────── */
  let requestInProgress = false;
  const handleDragStart = (idx) => (e) => e.dataTransfer.setData("drag", idx);
  const handleDrop = (idx) => async (e) => {
    e.preventDefault();
    if (requestInProgress) return;
    const from = e.dataTransfer.getData("drag");
    const arr = [...stateItems];
    const [moved] = arr.splice(from, 1);
    arr.splice(idx, 0, moved);
    setStateItems(arr);

    requestInProgress = true;
    try {
      const r = await fetch(`${baseUrl}/api/jobs.php?itemID=${moved.ItemID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ItemOrder: idx, JobTypeID: moved.JobTypeID }),
      });
      const d = await r.json();
      if (!d.success) console.error("Failed to reorder:", d.message);
    } catch (err) {
      console.error("Reorder error:", err);
    } finally {
      requestInProgress = false;
    }
  };

  /* ───────────────────────── SPRING FOR ADD CARD ─────────────────────── */
  const [addProps, api] = useSpring(() => ({ transform: "scale(1)" }));
  const iconColor = theme === "dark" ? "text-white" : "text-gray-800";

  /* ───────────────────────── MODAL HELPERS ───────────────────────────── */
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => {
    setModalOpen(true);
    fetchAvailableItems();
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem("new");
    setNewItem({
      item_id: "",
      uom: "",
      item_description: "",
      item_quantity: null,
      item_cost: null,
      use_quantity: "Y",
      use_cost: "Y",
      use_start_stop: "N",
    });
  };

  /* ───────────────────────── ADD ITEM ──────────────────────────────── */
  const handleAddItem = () => {
    const id = selectedItem === "new" ? newItem.item_id : selectedItem;
    const payload = {
      ...newItem,
      item_id: id,
      item_quantity:
        newItem.use_quantity === "Y" ? newItem.item_quantity || 1 : null,
    };
    onAddItem(payload);
    setStateItems((prev) => [...prev, payload]);
    closeModal();
  };

  /* ───────────────────────── RENDER ─────────────────────────────────── */
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {stateItems.map((item, idx) => (
        <div
          key={item.ItemID}
          draggable
          onDragStart={handleDragStart(idx)}
          onDrop={handleDrop(idx)}
          onDragOver={(e) => e.preventDefault()}
          className={`border rounded-lg shadow-sm p-4 relative ${
            theme === "dark"
              ? "bg-gray-800 text-white border-gray-700"
              : "bg-white text-gray-800 border-gray-300"
          }`}
        >
          {editingItemId === item.ItemID ? (
            <>
              {/* ───── EDIT MODE ───── */}
              <textarea
                name="ItemDescription"
                value={itemEdits.ItemDescription || ""}
                onChange={handleChange}
                rows="2"
                className={`w-full mb-2 p-2 rounded ${
                  theme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-100 text-gray-800 border-gray-300"
                }`}
              />
              <input
                type="text"
                name="ItemID"
                value={itemEdits.ItemID || item.ItemID}
                onChange={handleChange}
                className={`w-full mb-2 p-2 rounded ${
                  theme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-100 text-gray-800 border-gray-300"
                }`}
              />

              {/* Checkboxes */}
              <div className="flex gap-4 mb-2">
                {/* Hours */}
                <label
                  className="inline-flex items-center"
                  data-tooltip-id="hours-tooltip"
                >
                  <input
                    type="checkbox"
                    name="UseStartStop"
                    checked={itemEdits.UseStartStop === "Y"}
                    onChange={handleChange}
                    className="form-checkbox"
                  />
                  <span className="ml-1">Hours</span>
                </label>
                <Tooltip id="hours-tooltip" place="top" effect="solid">
                  Log worker start/stop times (mutually exclusive with
                  Quantity).
                </Tooltip>

                {/* Quantity */}
                <label
                  className="inline-flex items-center"
                  data-tooltip-id="qty-tooltip"
                >
                  <input
                    type="checkbox"
                    name="UseQuantity"
                    checked={itemEdits.UseQuantity === "Y"}
                    onChange={handleChange}
                    className="form-checkbox"
                    disabled={itemEdits.UseStartStop === "Y"}
                  />
                  <span className="ml-1">Quantity</span>
                </label>
                <Tooltip id="qty-tooltip" place="top" effect="solid">
                  Allows user to edit quantity.
                </Tooltip>

                {/* Cost */}
                <label
                  className="inline-flex items-center"
                  data-tooltip-id="cost-tooltip"
                >
                  <input
                    type="checkbox"
                    name="UseCost"
                    checked={itemEdits.UseCost === "Y"}
                    onChange={handleChange}
                    className="form-checkbox"
                  />
                  <span className="ml-1">Cost</span>
                </label>
                <Tooltip id="cost-tooltip" place="top" effect="solid">
                  Item Cost.
                </Tooltip>
              </div>

              {/* Cost Input */}
              {itemEdits.UseCost === "Y" && (
                <div className="relative mb-2">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    $
                  </span>
                  <input
                    type="number"
                    name="ItemCost"
                    step="0.01"
                    value={itemEdits.ItemCost || ""}
                    onChange={handleChange}
                    className={`w-full p-2 pl-7 rounded ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-gray-100 text-gray-800 border-gray-300"
                    }`}
                  />
                </div>
              )}

              {/* Quantity Input */}
              {itemEdits.UseStartStop !== "Y" && (
                <div className="relative mb-4">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    #
                  </span>
                  <input
                    type="number"
                    name="ItemQuantity"
                    placeholder="set quantity"
                    value={itemEdits.ItemQuantity || ""}
                    onChange={handleChange}
                    className={`w-full p-2 pl-7 rounded ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-gray-100 text-gray-800 border-gray-300"
                    }`}
                  />
                </div>
              )}

              {/* Action Icons */}
              <div className="flex justify-end space-x-2">
                <FontAwesomeIcon
                  icon={faCheck}
                  onClick={finalizeEdit}
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
              {/* ───── DISPLAY MODE ───── */}
              <h3 className="font-semibold text-lg mb-1">
                {item.ItemDescription}
                <span className="text-sm text-gray-500 ml-2">
                  {item.UOM && item.UOM.length > 1 && `(${item.UOM})`}
                </span>
              </h3>
              <p className="text-sm mb-1">Item ID: {item.ItemID}</p>

              {/* ── UseStartStop (show only when > 0) ── */}

              {item.UseStartStop !== "Y" &&
                item.ItemQuantity !== null &&
                item.ItemQuantity !== "" &&
                Number(item.ItemQuantity) > 0 && (
                  <p className="text-sm mb-1">
                    Quantity:&nbsp;
                    {Number(item.ItemQuantity).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                )}

              {item.UseCost === "Y" && (
                <p className="text-sm mb-1">Cost: ${item.ItemCost} </p>
              )}
              {item.UseStartStop === "Y" && (
                <p className="text-sm mb-1">Hours Enabled</p>
              )}

              <div className="absolute top-2 right-2 flex space-x-2">
                <FontAwesomeIcon
                  icon={faPencilAlt}
                  onClick={() => setEditingItemId(item.ItemID)}
                  className={`cursor-pointer ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                />
                <FontAwesomeIcon
                  icon={faTrashAlt}
                  onClick={() => handleDeleteItem(item)}
                  className={`cursor-pointer ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                />
              </div>
            </>
          )}
        </div>
      ))}

      {/* ───── ADD CARD ───── */}
      <animated.div
        style={addProps}
        onMouseEnter={() => api.start({ transform: "scale(1.05)" })}
        onMouseLeave={() => api.start({ transform: "scale(1)" })}
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

      {/* ───── MODAL ───── */}
      <Modal
        isOpen={modalOpen}
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
          <h2 className="text-3xl font-bold mb-8">Add Item</h2>
          <form>
            {/* Item ID selection */}
            <div className="mb-8">
              <label htmlFor="item_id" className="block mb-2 font-semibold">
                Item ID:
              </label>
              <select
                id="item_id"
                name="item_id"
                value={selectedItem}
                onChange={(e) => {
                  setSelectedItem(e.target.value);
                  handleInputChange(e);
                }}
                className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 focus:ring-blue-400"
                    : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                }`}
              >
                <option value="new">Add New Item</option>
                {availableItems
                  .filter((i) => i.Active !== "N")
                  .map((i) => (
                    <option key={i.ItemID} value={i.ItemID}>
                      {i.ItemID}
                    </option>
                  ))}
              </select>
            </div>

            {/* New Item ID field for custom entry */}
            {selectedItem === "new" && (
              <div className="mb-8">
                <label
                  htmlFor="new_item_id"
                  className="block mb-2 font-semibold"
                >
                  New Item ID:
                </label>
                <input
                  type="text"
                  id="item_id" /* ← match the state field */
                  name="item_id" /* ← was “new_item_id”, now aligns with handler */
                  value={newItem.item_id}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 focus:ring-blue-400"
                      : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                  }`}
                />
              </div>
            )}

            {/* UOM */}
            <div className="mb-8">
              <label htmlFor="uom" className="block mb-2 font-semibold">
                UOM:
              </label>
              <input
                type="text"
                id="uom"
                name="uom"
                value={newItem.uom}
                onChange={handleInputChange}
                readOnly={selectedItem !== "new"}
                className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 focus:ring-blue-400"
                    : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                }`}
              />
            </div>

            {/* Description */}
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
                readOnly={selectedItem !== "new"}
                className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 focus:ring-blue-400"
                    : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                }`}
              ></textarea>
            </div>

            {/* Properties checkboxes */}
            {/* ─────────────────────────────────────────────────────────────
              ITEM PROPERTIES – (regen line-by-line, exact labels & rules)
              ───────────────────────────────────────────────────────────── */}
            <div className="mb-8">
              <fieldset>
                <legend className="block mb-2 font-semibold">
                  Item Properties:
                </legend>
                <div className="flex gap-4">
                  {/* --- Lock Quantity toggle (checked = locked) --- */}
                  <div>
                    <label
                      className="inline-flex items-center"
                      data-tooltip-id="lock-quantity-tooltip"
                    >
                      <input
                        type="checkbox"
                        name="use_quantity"
                        /* When locked, use_quantity === 'N' */
                        checked={newItem.use_quantity === "Y"}
                        onChange={handleInputChange}
                        className="form-checkbox"
                        disabled={newItem.use_start_stop === "Y"}
                      />
                      <span className="ml-2">Use Quantity</span>
                    </label>

                    <Tooltip
                      id="lock-quantity-tooltip"
                      place="top"
                      effect="solid"
                    >
                      When Use Quantity is set, the user can edit the quantity
                      of this item.
                    </Tooltip>
                  </div>

                  {/* Use Cost */}
                  <label
                    className="inline-flex items-center"
                    data-tooltip-id="cost-tooltip"
                  >
                    <input
                      type="checkbox"
                      name="use_cost"
                      checked={newItem.use_cost === "Y"}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    <span className="ml-2">Use Cost</span>
                  </label>
                  <Tooltip id="cost-tooltip" place="top" effect="solid">
                    If enabled, a cost field will be recorded.
                  </Tooltip>

                  {/* Hours */}
                  <label
                    className="inline-flex items-center"
                    data-tooltip-id="hours-tooltip"
                  >
                    <input
                      type="checkbox"
                      name="use_start_stop"
                      checked={newItem.use_start_stop === "Y"}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    <span className="ml-2">Hours</span>
                  </label>
                  <Tooltip id="hours-tooltip" place="top" effect="solid">
                    Log worker start/stop times (mutually exclusive with
                    Quantity).
                  </Tooltip>
                </div>
              </fieldset>
            </div>

            {/* ─────────────────────────────────────────────────────────────
              QUANTITY INPUT – “#” always visible, disabled if locked/Hours
              ───────────────────────────────────────────────────────────── */}
            {newItem.use_start_stop !== "Y" && (
              <div className="mb-8">
                <label
                  htmlFor="item_quantity"
                  className="block mb-2 font-semibold"
                >
                  Quantity:
                </label>
                <div className="relative">
                  <span
                    className={`absolute left-4 top-1/2 -translate-y-1/2 select-none pointer-events-none ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    #
                  </span>
                  <input
                    type="number"
                    id="item_quantity"
                    name="item_quantity"
                    value={newItem.item_quantity ?? ""}
                    onChange={handleInputChange}
                    placeholder="Item Quantiy will default to this value"
                    className={`w-full pl-8 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 focus:ring-blue-400"
                        : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
              COST INPUT – “$” always visible, shown only if Use Cost = Y
              ───────────────────────────────────────────────────────────── */}
            {newItem.use_cost === "Y" && (
              <div className="mb-8">
                <label htmlFor="item_cost" className="block mb-2 font-semibold">
                  Cost:
                </label>
                <div className="relative">
                  <span
                    className={`absolute left-4 top-1/2 -translate-y-1/2 select-none pointer-events-none ${
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
                    value={newItem.item_cost ?? ""}
                    onChange={handleInputChange}
                    className={`w-full pl-8 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 focus:ring-blue-400"
                        : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
              FORM ACTIONS
              ───────────────────────────────────────────────────────────── */}
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

      {/* ───── INLINE STYLES ───── */}
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
