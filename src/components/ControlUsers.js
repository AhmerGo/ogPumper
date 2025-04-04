// Import necessary modules and components
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSearch,
  faTimes,
  faUser,
  faEnvelope,
  faPhone,
  faBriefcase,
  faCommentAlt,
  faCheck,
  faBan,
  faSort,
  faFilter,
  faLock,
  faLockOpen,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "ogcommon";
import { baseUrl } from "./config"; // Import base URL from config

// Define role descriptions for user roles
const roleDescriptions = {
  A: "Admin",
  O: "Operator",
  P: "Pumper",
  R: "Read Only",
  I: "Investor",
};

// Main ControlUsers component
const ControlUsers = () => {
  // State variables
  const [users, setUsers] = useState([]);
  const [jobRoles, setJobRoles] = useState([]); // New state for job roles
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const { theme } = useTheme();

  // Fetch users and job roles when the component mounts
  useEffect(() => {
    fetchUsers();
    fetchJobRoles(); // Fetch job roles
  }, []);

  // Function to fetch users from the API
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/userdetails.php`);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Function to fetch job roles from the API
  const fetchJobRoles = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/jobs.php`);
      const data = response.data;

      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error("Expected data to be an array, but got:", data);
        return;
      }

      // Extract JobRole values from each job type
      let allJobRoles = [];

      data.forEach((job) => {
        // Ensure JobRole is a non-empty string
        if (typeof job.JobRole === "string" && job.JobRole.trim() !== "") {
          // Split the JobRole string by commas and trim whitespace
          const roles = job.JobRole.split(",").map((role) => role.trim());
          allJobRoles = allJobRoles.concat(roles);
        }
      });

      // Remove duplicates and set the jobRoles state
      const uniqueJobRoles = Array.from(new Set(allJobRoles));

      // If no job roles were found, you might want to handle this case
      if (uniqueJobRoles && uniqueJobRoles.length === 0) {
        console.warn("No job roles found in the API response.");
      }

      setJobRoles(uniqueJobRoles);
    } catch (error) {
      console.error("Error fetching job roles:", error);
    }
  };

  // Handler functions
  const handleEdit = (user) => setEditingUser(user);
  const handleCancel = () => setEditingUser(null);
  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleFilterChange = (e) => setFilterRole(e.target.value);
  const handleSortChange = (e) => setSortBy(e.target.value);
  const toggleSortOrder = () =>
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");

  // Function to save the updated user data
  const handleSave = async (updatedUserData) => {
    try {
      const response = await axios.patch(
        `${baseUrl}/api/userdetails.php`,
        updatedUserData
      );
      if (response.data.success) {
        setUsers(
          users.map((user) =>
            user.UserID === updatedUserData.UserID ? updatedUserData : user
          )
        );
        setEditingUser(null);
      } else {
        console.error("Error updating user details:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  // Function to disable a user account
  const handleDisable = async (userId) => {
    try {
      const response = await axios.patch(`${baseUrl}/api/userdetails.php`, {
        UserID: userId,
        Action: "disable",
      });
      if (response.data.success) {
        setUsers(
          users.map((user) =>
            user.UserID === userId ? { ...user, Disabled: "1" } : user
          )
        );
        alert("User account has been disabled.");
      } else {
        console.error("Error disabling user:", response.data.message);
        alert(
          `Failed to disable user. Server message: ${response.data.message}`
        );
      }
    } catch (error) {
      console.error("Error disabling user:", error);
      alert(
        `An error occurred while disabling the user. Error: ${error.message}`
      );
    }
  };

  // Function to enable a user account
  const handleEnable = async (userId) => {
    try {
      const response = await axios.patch(`${baseUrl}/api/userdetails.php`, {
        UserID: userId,
        Action: "enable",
      });
      if (response.data.success) {
        setUsers(
          users.map((user) =>
            user.UserID === userId ? { ...user, Disabled: "0" } : user
          )
        );
        alert("User account has been enabled.");
      } else {
        console.error("Error enabling user:", response.data.message);
        alert(
          `Failed to enable user. Server message: ${response.data.message}`
        );
      }
    } catch (error) {
      console.error("Error enabling user:", error);
      alert(
        `An error occurred while enabling the user. Error: ${error.message}`
      );
    }
  };

  // Filter and sort users based on search and filter criteria
  const filteredAndSortedUsers = users
    .filter(
      (user) =>
        user.UserID !== "unassigned" && // Exclude unassigned users
        user.UserID !== "admin" && // Exclude admin user
        (filterRole === "All" || user.Role === filterRole) &&
        ((user.FullName &&
          user.FullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.Email &&
            user.Email.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      const factor = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "name")
        return factor * a.FullName.localeCompare(b.FullName);
      if (sortBy === "role") return factor * a.Role.localeCompare(b.Role);
      return 0;
    });

  // Main render
  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <h1 className="text-4xl font-bold mb-8 text-center">User Management</h1>

        {/* Search, Filter, and Sort Controls */}
        <div className="mb-8 flex flex-col md:flex-row items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-grow w-full md:w-auto">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className={`w-full px-4 py-2 pl-10 rounded-full border ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800 text-gray-300"
                  : "border-gray-300"
              }`}
            />
            <FontAwesomeIcon
              icon={faSearch}
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <FontAwesomeIcon
              icon={faFilter}
              className={theme === "dark" ? "text-gray-300" : "text-gray-600"}
            />
            <select
              value={filterRole}
              onChange={handleFilterChange}
              className={`px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800 text-gray-300"
                  : "border-gray-300"
              }`}
            >
              <option value="All">All Roles</option>
              <option value="P">Pumper</option>
              <option value="O">Operator</option>
              <option value="A">Admin</option>
              <option value="I">Investor</option>
              <option value="R">Read Only</option>
            </select>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <FontAwesomeIcon
              icon={faSort}
              className={theme === "dark" ? "text-gray-300" : "text-gray-600"}
            />
            <select
              value={sortBy}
              onChange={handleSortChange}
              className={`px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800 text-gray-300"
                  : "border-gray-300"
              }`}
            >
              <option value="name">Sort by Name</option>
              <option value="role">Sort by Role</option>
            </select>
            <button
              onClick={toggleSortOrder}
              className={`px-2 py-1 ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-200 text-gray-900"
              } rounded-md`}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>

        {/* User Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedUsers.map((user) => (
            <div
              key={user.UserID}
              className={`p-6 rounded-lg shadow-lg hover:shadow-xl transition ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } ${
                user.Disabled === "1" || user.Disabled === 1 ? "opacity-50" : ""
              }`}
            >
              {/* User Header */}
              <div className="flex justify-between items-center mb-4">
                <h3
                  className={`text-3xl font-semibold ${
                    theme === "dark" ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  {user.FullName}
                </h3>
                <div className="flex space-x-2">
                  {/* Edit Button */}
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition"
                    aria-label="Edit user"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  {/* Enable/Disable Button */}
                  {user.Disabled === "1" || user.Disabled === 1 ? (
                    <button
                      onClick={() => handleEnable(user.UserID)}
                      className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition"
                      aria-label="Enable user"
                    >
                      <FontAwesomeIcon icon={faLockOpen} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDisable(user.UserID)}
                      className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                      aria-label="Disable user"
                    >
                      <FontAwesomeIcon icon={faLock} />
                    </button>
                  )}
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-2">
                {/* Role */}
                <p className="flex items-center">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="mr-2 text-gray-500"
                  />
                  <span className="font-medium">
                    {roleDescriptions[user.Role] || user.Role}
                  </span>
                </p>
                {/* Job Role */}
                <p className="flex items-center">
                  <FontAwesomeIcon
                    icon={faBriefcase}
                    className="mr-2 text-gray-500"
                  />
                  <span>{user.JobRole || "N/A"}</span>
                </p>
                {/* Email */}
                <p className="flex items-center">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="mr-2 text-gray-500"
                  />
                  <span>{user.Email}</span>
                </p>
                {/* Phone */}
                <p className="flex items-center">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="mr-2 text-gray-500"
                  />
                  <span>{user.Phone}</span>
                </p>
                {/* Message */}
                <p className="flex items-center">
                  <FontAwesomeIcon
                    icon={faCommentAlt}
                    className="mr-2 text-gray-500"
                  />
                  <span>{user.Message}</span>
                </p>
                {/* Disabled Indicator */}
                {user.Disabled === "1" && (
                  <p className="flex items-center text-red-500">
                    <FontAwesomeIcon icon={faLock} className="mr-2" />
                    <span>Disabled</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
          <div
            className={`rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden ${
              theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white"
            }`}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-semibold">
                Edit User: {editingUser.FullName}
              </h2>
              <button
                onClick={handleCancel}
                className="text-white hover:text-gray-200 transition"
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>
            {/* Edit User Form */}
            <EditUserForm
              user={editingUser}
              onSave={handleSave}
              onCancel={handleCancel}
              jobRoles={jobRoles} // Pass jobRoles to the form
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Export the component

// EditUserForm component
const EditUserForm = ({ user, onSave, onCancel, jobRoles }) => {
  const [formData, setFormData] = useState({ ...user });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme } = useTheme();

  // Validate the form inputs
  const validateForm = () => {
    const newErrors = {};
    if (!formData.Role.trim()) newErrors.Role = "Role is required";
    if (!formData.JobRole || !formData.JobRole.trim())
      newErrors.JobRole = "Job Role is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onSave(formData);
      } catch (error) {
        console.error("Error saving user:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Form fields
  const fields = [
    {
      name: "FullName",
      icon: faUser,
      placeholder: "Full Name",
    },
    {
      name: "Email",
      icon: faEnvelope,
      placeholder: "Email Address",
      type: "email",
    },
    { name: "Phone", icon: faPhone, placeholder: "Phone Number" },
  ];

  // Render the form
  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Render input fields */}
        {fields.map((field) => (
          <div key={field.name} className="relative">
            <FontAwesomeIcon
              icon={field.icon}
              className="absolute top-3 left-3 text-gray-400"
            />
            <input
              type={field.type || "text"}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition ${
                errors[field.name] ? "border-red-500" : "border-gray-300"
              } ${theme === "dark" ? "bg-gray-800 text-gray-300" : ""}`}
            />
            {errors[field.name] && (
              <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
            )}
          </div>
        ))}

        {/* Role Dropdown */}
        <div className="relative">
          <FontAwesomeIcon
            icon={faBriefcase}
            className="absolute top-3 left-3 text-gray-400"
          />
          <select
            name="Role"
            value={formData.Role}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition ${
              errors["Role"] ? "border-red-500" : "border-gray-300"
            } ${theme === "dark" ? "bg-gray-800 text-gray-300" : ""}`}
          >
            <option value="">Select User Role</option>
            {Object.entries(roleDescriptions).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors["Role"] && (
            <p className="text-red-500 text-sm mt-1">{errors["Role"]}</p>
          )}
        </div>

        {/* JobRole Dropdown */}
        <div className="relative">
          <FontAwesomeIcon
            icon={faBriefcase}
            className="absolute top-3 left-3 text-gray-400"
          />
          <select
            name="JobRole"
            value={formData.JobRole || ""}
            onChange={handleChange}
            disabled={jobRoles.length === 0}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition ${
              errors["JobRole"] ? "border-red-500" : "border-gray-300"
            } ${theme === "dark" ? "bg-gray-800 text-gray-300" : ""}`}
          >
            {jobRoles.length === 0 ? (
              <option value="">No Job Roles Available</option>
            ) : (
              <>
                <option value="">Select Job Role</option>
                {jobRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </>
            )}
          </select>
          {errors["JobRole"] && (
            <p className="text-red-500 text-sm mt-1">{errors["JobRole"]}</p>
          )}
        </div>

        {/* Message Field */}
        <div className="relative md:col-span-2">
          <FontAwesomeIcon
            icon={faCommentAlt}
            className="absolute top-3 left-3 text-gray-400"
          />
          <textarea
            name="Message"
            value={formData.Message}
            onChange={handleChange}
            placeholder="Message"
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition ${
              errors["Message"] ? "border-red-500" : "border-gray-300"
            } ${theme === "dark" ? "bg-gray-800 text-gray-300" : ""}`}
            rows="4"
          />
          {errors["Message"] && (
            <p className="text-red-500 text-sm mt-1">{errors["Message"]}</p>
          )}
        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition flex items-center"
        >
          <FontAwesomeIcon icon={faBan} className="mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FontAwesomeIcon icon={faCheck} className="mr-2" />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

// Export the component
export default ControlUsers;
