import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSpring, animated } from "react-spring";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSave,
  faTimes,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "./ThemeContext";

const EditUserForm = ({ user, onSave, onCancel, theme }) => {
  const [formData, setFormData] = useState({
    UserID: user.UserID,
    FullName: user.FullName,
    Email: user.Email,
    Phone: user.Phone,
    Role: user.Role,
    Message: user.Message,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        theme === "dark"
          ? "bg-gray-900 bg-opacity-75"
          : "bg-gray-500 bg-opacity-75"
      }`}
    >
      <div
        className={`rounded-lg shadow-lg p-6 w-full max-w-md ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Edit User</h2>
        <form onSubmit={handleSubmit}>
          <input
            value={formData.FullName}
            name="FullName"
            type="text"
            placeholder="Full Name"
            required
            className={`w-full p-2 mb-2 border rounded ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            onChange={handleChange}
          />
          <input
            value={formData.Email}
            name="Email"
            type="email"
            placeholder="Email"
            className={`w-full p-2 mb-2 border rounded ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            onChange={handleChange}
          />
          <input
            value={formData.Phone}
            name="Phone"
            type="tel"
            placeholder="Phone"
            className={`w-full p-2 mb-2 border rounded ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            onChange={handleChange}
          />
          <input
            value={formData.Role}
            name="Role"
            type="text"
            placeholder="Role"
            required
            className={`w-full p-2 mb-2 border rounded ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            onChange={handleChange}
          />
          <textarea
            value={formData.Message}
            name="Message"
            placeholder="Message"
            className={`w-full p-2 mb-4 border rounded ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            onChange={handleChange}
          ></textarea>{" "}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 mr-2"
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" /> Save
            </button>
            <button
              onClick={onCancel}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ControlUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { theme } = useTheme();
  const [subdomain, setSubdomain] = useState("");

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const baseUrl = subdomain
          ? `https://${subdomain}.ogpumper.net`
          : "https://ogfieldticket.com";

        const response = await axios.get(`${baseUrl}/api/userdetails.php`);
        const filteredUsers = response.data.users.filter(
          (user) => user.Role === "P" || user.Role === "O" || user.Role === "A"
        );
        setUsers(filteredUsers || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleSave = async (updatedUserData) => {
    try {
      const baseUrl = subdomain
        ? `https://${subdomain}.ogpumper.net`
        : "https://ogfieldticket.com";

      const response = await axios.patch(
        `${baseUrl}/api/userdetails.php?id=${updatedUserData.UserID}`,
        updatedUserData
      );
      console.log(response.data);

      if (response.data.success) {
        const updatedUsers = users.map((user) =>
          user.UserID === updatedUserData.UserID ? updatedUserData : user
        );
        setUsers(updatedUsers);
        setEditingUser(null);
      } else {
        console.error("Error updating user details:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter((user) =>
    user.FullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userListAnimation = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 500 },
  });

  return (
    <div
      className={`container mx-auto mt-5 p-4 rounded shadow ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2
          className={`text-2xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          User Management
        </h2>
        <div
          className={`relative ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={handleSearch}
            className={`px-4 py-2 rounded-l-md border ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white focus:ring-gray-500"
                : "bg-white border-gray-300 focus:ring-blue-500"
            } focus:outline-none focus:ring-2`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <FontAwesomeIcon
              icon={faSearch}
              className={`${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            />
          </div>
        </div>
      </div>
      <animated.div
        style={userListAnimation}
        className={`rounded shadow overflow-hidden ${
          theme === "dark" ? "bg-gray-700" : "bg-white"
        }`}
      >
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.UserID}
              className={`py-4 border-b ${
                theme === "dark"
                  ? "border-gray-600 bg-gray-800 text-gray-400"
                  : "border-gray-300 bg-white text-gray-600"
              } flex justify-between items-center`}
            >
              {editingUser && editingUser.UserID === user.UserID ? (
                <EditUserForm
                  user={user}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  theme={theme}
                />
              ) : (
                <>
                  <div className="flex-1 px-4">
                    <p
                      className={`text-lg font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {user.FullName}
                    </p>
                    <p
                      className={`${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {user.Email} | {user.Role}
                    </p>
                    <p
                      className={`${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Phone: {user.Phone}
                    </p>
                    <p
                      className={`${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Message: {user.Message}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEdit(user)}
                    className={`btn-edit px-4 ${
                      theme === "dark" ? "text-gray-400" : "text-blue-500"
                    }`}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                </>
              )}
            </div>
          ))
        ) : (
          <p
            className={`p-4 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No users found.
          </p>
        )}
      </animated.div>
    </div>
  );
};

export default ControlUsers;
