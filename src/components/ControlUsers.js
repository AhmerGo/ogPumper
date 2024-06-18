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
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
        theme === "dark"
          ? "bg-black bg-opacity-80"
          : "bg-gray-500 bg-opacity-50"
      }`}
    >
      <div
        className={`rounded-lg shadow-xl p-8 w-full max-w-lg transition-transform transform ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-3xl font-semibold mb-6">Edit User</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              value={formData.FullName}
              name="FullName"
              type="text"
              placeholder="Full Name"
              required
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white focus:ring-blue-500"
                  : "bg-gray-100 border-gray-300 text-gray-900 focus:ring-blue-500"
              }`}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              value={formData.Email}
              name="Email"
              type="email"
              placeholder="Email"
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white focus:ring-blue-500"
                  : "bg-gray-100 border-gray-300 text-gray-900 focus:ring-blue-500"
              }`}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              value={formData.Phone}
              name="Phone"
              type="tel"
              placeholder="Phone"
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white focus:ring-blue-500"
                  : "bg-gray-100 border-gray-300 text-gray-900 focus:ring-blue-500"
              }`}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Role</label>
            <input
              value={formData.Role}
              name="Role"
              type="text"
              placeholder="Role"
              required
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white focus:ring-blue-500"
                  : "bg-gray-100 border-gray-300 text-gray-900 focus:ring-blue-500"
              }`}
              onChange={handleChange}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              value={formData.Message}
              name="Message"
              placeholder="Message"
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white focus:ring-blue-500"
                  : "bg-gray-100 border-gray-300 text-gray-900 focus:ring-blue-500"
              }`}
              onChange={handleChange}
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-5 rounded-full hover:bg-blue-700 transition duration-300"
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" /> Save
            </button>
            <button
              onClick={onCancel}
              className="bg-red-600 text-white py-2 px-5 rounded-full hover:bg-red-700 transition duration-300"
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
        setSubdomain(subdomainPart);
      } else {
        setSubdomain("");
      }
    };
    extractSubdomain();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
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
  }, [subdomain]);

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleSave = async (updatedUserData) => {
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
      const response = await axios.patch(
        `${baseUrl}/api/userdetails.php?id=${updatedUserData.UserID}`,
        updatedUserData
      );

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
      className={`container mx-auto mt-10 p-6 rounded-lg shadow-xl transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">User Management</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={handleSearch}
            className={`px-4 py-2 rounded-full border focus:outline-none focus:ring-2 transition-shadow ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-white focus:ring-blue-500"
                : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
            }`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <FontAwesomeIcon
              icon={faSearch}
              className={theme === "dark" ? "text-gray-400" : "text-gray-700"}
            />
          </div>
        </div>
      </div>
      <animated.div
        style={userListAnimation}
        className="rounded-lg shadow-lg overflow-hidden"
      >
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.UserID}
              className={`p-4 flex justify-between items-center border-b transition-colors ${
                theme === "dark"
                  ? "border-gray-800 bg-gray-900 text-gray-400"
                  : "border-gray-200 bg-white text-gray-900"
              }`}
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
                    <p className="text-lg font-semibold">{user.FullName}</p>
                    <p className="text-sm">
                      {user.Email} | {user.Role}
                    </p>
                    <p className="text-sm">Phone: {user.Phone}</p>
                    <p className="text-sm">Message: {user.Message}</p>
                  </div>
                  <button
                    onClick={() => handleEdit(user)}
                    className={`p-2 rounded-full hover:bg-opacity-75 transition ${
                      theme === "dark"
                        ? "bg-gray-700 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="p-4 text-center">No users found.</p>
        )}
      </animated.div>
    </div>
  );
};

export default ControlUsers;
