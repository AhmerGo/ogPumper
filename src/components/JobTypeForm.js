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
  const [selectedJobRoleIds, setSelectedJobRoleIds] = useState([]); // Updated state for multiple selections
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
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let baseUrl;

      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        baseUrl = `https://${subdomainPart}.ogfieldticket.com`;
        console.log(`Using subdomain URL: ${baseUrl}`);
      } else {
        baseUrl = "https://test.ogfieldticket.com";
        console.log(`Using default URL: ${baseUrl}`);
      }

      const response = await fetch(`${baseUrl}/api/jobs.php`);
      const data = await response.json();
      console.log(data);
      setTicketTypes(data);
    } catch (error) {
      console.error("Error fetching ticket types:", error);
    }
  };

  const fetchJobRoles = async () => {
    try {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let baseUrl;

      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        baseUrl = `https://${subdomainPart}.ogfieldticket.com`;
      } else {
        baseUrl = "https://test.ogfieldticket.com";
      }

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

      // Set the jobRoles state
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
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let baseUrl;

      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        baseUrl = `https://${subdomainPart}.ogfieldticket.com`;
        console.log(`Using subdomain URL: ${baseUrl}`);
      } else {
        baseUrl = "https://test.ogfieldticket.com";
        console.log(`Using default URL: ${baseUrl}`);
      }
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
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let baseUrl;

      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        baseUrl = `https://${subdomainPart}.ogfieldticket.com`;
        console.log(`Using subdomain URL: ${baseUrl}`);
      } else {
        baseUrl = "https://test.ogfieldticket.com";
        console.log(`Using default URL: ${baseUrl}`);
      }
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
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let baseUrl;

      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        baseUrl = `https://${subdomainPart}.ogfieldticket.com`;
        console.log(`Using subdomain URL: ${baseUrl}`);
      } else {
        baseUrl = "https://test.ogfieldticket.com";
        console.log(`Using default URL: ${baseUrl}`);
      }
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
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let baseUrl;

      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        baseUrl = `https://${subdomainPart}.ogfieldticket.com`;
        console.log(`Using subdomain URL: ${baseUrl}`);
      } else {
        baseUrl = "https://test.ogfieldticket.com";
        console.log(`Using default URL: ${baseUrl}`);
      }
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
        const hostname = window.location.hostname;
        const parts = hostname.split(".");
        let baseUrl;

        if (parts.length > 2) {
          const subdomainPart = parts.shift();
          baseUrl = `https://${subdomainPart}.ogfieldticket.com`;
          console.log(`Using subdomain URL: ${baseUrl}`);
        } else {
          baseUrl = "https://test.ogfieldticket.com";
          console.log(`Using default URL: ${baseUrl}`);
        }

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
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let baseUrl;

      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        baseUrl = `https://${subdomainPart}.ogfieldticket.com`;
        console.log(`Using subdomain URL: ${baseUrl}`);
      } else {
        baseUrl = "https://test.ogfieldticket.com";
        console.log(`Using default URL: ${baseUrl}`);
      }
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
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let baseUrl;

      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        baseUrl = `https://${subdomainPart}.ogfieldticket.com`;
      } else {
        baseUrl = "https://test.ogfieldticket.com";
      }

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

      // Update the job in state if necessary
      fetchTicketTypes();
      fetchJobRoles(); // Refresh job roles list if a new role was added

      // Close the modal and reset state
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
            {/* Multi-select checkboxes for JobRoles */}
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
  const [hoveredItem, setHoveredItem] = useState(null);
  const [editingItemCost, setEditingItemCost] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemEdits, setItemEdits] = useState({});
  const [selection, setSelection] = useState("quantity");
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("new");
  const [newItem, setNewItem] = useState({
    item_id: "",
    uom: "",
    item_description: "",
    item_quantity: null,
    item_cost: null,
    use_quantity: "N",
    use_cost: "Y",
  });

  const [stateItems, setStateItems] = useState(items);

  useEffect(() => {
    setStateItems(items);
  }, [items]);

  const fetchAvailableItems = async () => {
    try {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let baseUrl;

      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        baseUrl = `https://${subdomainPart}.ogfieldticket.com`;
        console.log(`Using subdomain URL: ${baseUrl}`);
      } else {
        baseUrl = "https://test.ogfieldticket.com";
        console.log(`Using default URL: ${baseUrl}`);
      }

      const response = await axios.get(
        `${baseUrl}/api/jobitem.php?item_types=1`
      );
      console.log(response.data);
      setAvailableItems(response.data.itemTypes);
    } catch (error) {
      console.error("Error fetching available items:", error);
    }
  };

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

  const handleEditClick = (item) => {
    console.log(item);
    setEditingItemId(item.ItemID);
    setItemEdits({
      ItemDescription: item.ItemDescription,
      ItemCost: item.ItemCost,
      ...(item.ItemQuantity !== null && { ItemQuantity: item.ItemQuantity }),
    });
  };

  const handleRemoveItem = async (itemID) => {
    try {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let baseUrl;

      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        baseUrl = `https://${subdomainPart}.ogfieldticket.com`;
      } else {
        baseUrl = "https://test.ogfieldticket.com";
      }

      const response = await fetch(`${baseUrl}/api/jobitem.php`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item_id: itemID }),
      });

      const data = await response.json();
      if (data.success) {
        setStateItems(stateItems.filter((item) => item.ItemID !== itemID));
      } else {
        console.error("Failed to remove item");
      }
    } catch (error) {
      console.error("An error occurred while removing the item.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemEdits((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteItem = (itemId) => {
    console.log(itemId);
    const baseUrl = subdomain
      ? `https://${subdomain}.ogfieldticket.com`
      : "https://test.ogfieldticket.com";

    const data = {
      JobItemID: itemId.JobItemID,
      ItemDescription: itemId.ItemDescription,
    };
    console.log(data);
    fetch(`${baseUrl}/api/jobs.php?itemID=${itemId.JobItemID}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          setStateItems(
            stateItems.filter((item) => item.JobItemID !== itemId.JobItemID)
          );
          onDeleteItem(itemId);
        } else {
          throw new Error("Error deleting item");
        }
      })
      .catch((error) => {
        console.error("Error deleting item:", error);
      });
  };

  const finalizeEdit = async () => {
    try {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let baseUrl;

      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        baseUrl = `https://${subdomainPart}.ogfieldticket.com`;
        console.log(`Using subdomain URL: ${baseUrl}`);
      } else {
        baseUrl = "https://test.ogfieldticket.com";
        console.log(`Using default URL: ${baseUrl}`);
      }

      const payload = {
        ...itemEdits,
        newOrder: null,
      };

      const response = await axios.patch(
        `${baseUrl}/api/jobs.php?itemID=${editingItemId}`,
        payload
      );

      if (response.data.success) {
        const updatedItems = stateItems.map((item) => {
          if (item.ItemID === editingItemId) {
            return { ...item, ...itemEdits };
          }
          return item;
        });

        setStateItems(updatedItems);
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
      } else {
        console.error("Error updating item:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setItemEdits({});
  };

  const handleSelectionChange = (event) => {
    setSelection(event.target.value);
  };

  const handleDragStart = (index) => (event) => {
    event.dataTransfer.setData("draggedIndex", index);
  };

  let requestInProgress = false;

  const handleDrop = (index) => async (event) => {
    event.preventDefault();

    if (requestInProgress) {
      console.log("Request already in progress, please wait...");
      return;
    }

    const draggedIndex = event.dataTransfer.getData("draggedIndex");
    const updatedItems = Array.from(stateItems);
    const [movedItem] = updatedItems.splice(draggedIndex, 1);
    updatedItems.splice(index, 0, movedItem);

    setStateItems(updatedItems);

    requestInProgress = true;
    try {
      console.log(movedItem);
      const itemID = movedItem.ItemID;
      const newPosition = index;
      const jobTypeID = movedItem.JobTypeID;
      const baseUrl = subdomain
        ? `https://${subdomain}.ogfieldticket.com`
        : "https://test.ogfieldticket.com";

      const response = await fetch(`${baseUrl}/api/jobs.php?itemID=${itemID}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ItemOrder: newPosition,
          JobTypeID: jobTypeID,
          oldOrder: movedItem.ItemOrder,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const updatedStateItems = updatedItems.map((item, idx) => {
          if (item.ItemOrder !== idx) {
            return { ...item, ItemOrder: idx };
          }
          return item;
        });

        setStateItems(updatedStateItems);
      } else {
        console.error("Failed to update item position:", data.message);
      }
    } catch (error) {
      console.error("Error updating item position:", error);
    } finally {
      requestInProgress = false;
    }
  };

  const addButtonStyle = {
    from: { transform: "scale(1)" },
    enter: { transform: "scale(1.05)" },
    leave: { transform: "scale(1)" },
  };
  const [addButtonProps, set, stop] = useSpring(() => addButtonStyle.from);

  const iconColor = theme === "dark" ? "text-white" : "text-gray-800";

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
    fetchAvailableItems();
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedItem("new");
    setNewItem({
      item_id: "",
      uom: "",
      item_description: "",
      item_quantity: null,
      item_cost: null,
      use_quantity: "N",
      use_cost: "Y",
    });
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setNewItem((prevItem) => {
      let updatedItem = { ...prevItem };

      if (name === "item_id") {
        if (value !== "new") {
          const item = availableItems.find((item) => item.ItemID === value);
          updatedItem = {
            ...prevItem,
            item_id: item.ItemID,
            uom: item.UOM,
            item_description: item.ItemDescription,
            item_quantity: item.UseQuantity === "N" ? 1 : null,
            item_cost: item.UseCost === "Y" ? 0.0 : null,
            use_quantity: item.UseQuantity,
            use_cost: item.UseCost,
          };
        } else {
          updatedItem = {
            ...prevItem,
            item_id: "",
            uom: "",
            item_description: "",
            item_quantity: null,
            item_cost: null,
            use_quantity: "Y",
            use_cost: "Y",
          };
        }
      } else if (name === "new_item_id") {
        updatedItem.item_id = value;
      } else if (name === "use_quantity") {
        updatedItem.use_quantity = checked ? "N" : "Y";
        updatedItem.item_quantity = checked ? 1 : null;
      } else if (type === "checkbox") {
        updatedItem[name] = checked ? "Y" : "N";
      } else {
        updatedItem[name] = value;
      }

      return updatedItem;
    });
  };
  const handleAddItem = () => {
    let itemId;
    if (selectedItem === "new") {
      itemId = newItem.item_id;
    } else {
      itemId = `${selectedItem}`;
    }

    const updatedNewItem = {
      ...newItem,
      item_id: itemId,
      use_quantity: newItem.use_quantity,
      use_cost: newItem.use_cost,
      item_quantity:
        newItem.use_quantity === "N" ? newItem.item_quantity || 1 : null,
    };

    onAddItem(updatedNewItem);
    setStateItems([...stateItems, updatedNewItem]);

    closeModal();
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {stateItems.map((item, index) => (
        <div
          key={item.ItemID}
          draggable
          onDragStart={handleDragStart(index)}
          onDrop={handleDrop(index)}
          onDragOver={(e) => e.preventDefault()}
          className={`border rounded-lg shadow-sm p-4 relative ${
            theme === "dark"
              ? "bg-gray-800 text-white border-gray-700"
              : "bg-white text-gray-800 border-gray-300"
          }`}
        >
          {editingItemId === item.ItemID ? (
            <>
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
              <input
                type="number"
                name="ItemCost"
                value={itemEdits.ItemCost || ""}
                onChange={handleChange}
                className={`w-full mb-2 p-2 rounded ${
                  theme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-100 text-gray-800 border-gray-300"
                }`}
              />
              {item.ItemQuantity !== null && (
                <input
                  type="number"
                  name="ItemQuantity"
                  value={itemEdits.ItemQuantity || item.ItemQuantity}
                  onChange={handleChange}
                  className={`w-full mb-4 p-2 rounded ${
                    theme === "dark"
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-gray-100 text-gray-800 border-gray-300"
                  }`}
                />
              )}
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
              <h3 className="font-semibold text-lg mb-1">
                {item.ItemDescription}
                <span className="text-sm text-gray-500 ml-2">
                  {item.UOM && item.UOM.length > 1 && `(${item.UOM})`}
                </span>
              </h3>
              <p className="text-sm mb-1">Item ID: {item.ItemID}</p>
              {item.ItemQuantity === null ? (
                <p className="text-sm mb-1">Cost: ${item.ItemCost}</p>
              ) : (
                <>
                  <p className="text-sm mb-1">Cost: ${item.ItemCost}</p>
                  <p className="text-sm mb-1">Quantity: {item.ItemQuantity}</p>
                </>
              )}
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
                  onClick={() => handleDeleteItem(item)}
                  className={`cursor-pointer ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                />
              </div>
            </>
          )}
        </div>
      ))}{" "}
      <animated.div
        style={addButtonProps}
        onMouseEnter={() => {
          set({ ...addButtonStyle.enter });
        }}
        onMouseLeave={() => {
          set({ ...addButtonStyle.leave });
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
          <h2 className="text-3xl font-bold mb-8">Add Item</h2>
          <form>
            <div className="mb-8">
              <label htmlFor="item_id" className="block mb-2 font-semibold">
                Item ID:
              </label>
              <div className="relative">
                <select
                  id="item_id"
                  name="item_id"
                  value={selectedItem}
                  onChange={(e) => {
                    const selectedItemId = e.target.value;
                    setSelectedItem(selectedItemId);
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
                    .filter((item) => item.Active !== "N")
                    .map((item) => (
                      <option key={item.ItemID} value={item.ItemID}>
                        {item.ItemID}
                      </option>
                    ))}
                </select>
              </div>
            </div>
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
                  id="new_item_id"
                  name="new_item_id"
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
            <div className="mb-8">
              <fieldset>
                <legend className="block mb-2 font-semibold">
                  Item Properties:
                </legend>
                <div className="flex gap-4">
                  <div>
                    <label
                      className="inline-flex items-center"
                      data-tooltip-id="lock-quantity-tooltip"
                    >
                      <input
                        type="checkbox"
                        name="use_quantity"
                        checked={newItem.use_quantity === "N"}
                        onChange={handleInputChange}
                        className="form-checkbox"
                      />
                      <span className="ml-2">Lock Quantity</span>
                    </label>
                    <Tooltip
                      id="lock-quantity-tooltip"
                      place="top"
                      effect="solid"
                    >
                      When Lock Quantity is set, the user cannot edit the
                      quantity.
                    </Tooltip>
                  </div>
                  <div>
                    <label
                      className="inline-flex items-center"
                      data-tooltip-id="use-cost-tooltip"
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
                    <Tooltip id="use-cost-tooltip" place="top" effect="solid">
                      If Use Cost is set, the item has a cost associated with
                      it.
                    </Tooltip>
                  </div>
                </div>
              </fieldset>
            </div>
            {newItem.use_quantity === "N" && (
              <div className="mb-8">
                <label
                  htmlFor="item_quantity"
                  className="block mb-2 font-semibold"
                >
                  Quantity:
                </label>
                <input
                  type="number"
                  id="item_quantity"
                  name="item_quantity"
                  value={newItem.item_quantity || ""}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 focus:ring-blue-400"
                      : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                  }`}
                />
              </div>
            )}
            {newItem.use_cost === "Y" && (
              <div className="mb-8">
                <label htmlFor="item_cost" className="block mb-2 font-semibold">
                  Cost:
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
                    value={newItem.item_cost || ""}
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
        .tooltip {
          position: relative;
          display: inline-block;
          cursor: pointer;
        }

        .tooltip .tooltiptext {
          visibility: hidden;
          width: 220px;
          background-color: black;
          color: #fff;
          text-align: center;
          border-radius: 5px;
          padding: 5px;
          position: absolute;
          z-index: 1;
          bottom: 125%; /* Position above the element */
          left: 50%;
          margin-left: -110px; /* Center the tooltip */
          opacity: 0;
          transition: opacity 0.3s;
        }

        .tooltip:hover .tooltiptext {
          visibility: visible;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default JobListPage;
