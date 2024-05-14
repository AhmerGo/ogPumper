import React, { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";
import { useUser } from "./UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faUser,
  faLock,
  faPenFancy,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

function UserProfile() {
  const { theme } = useTheme();
  const { userID } = useUser();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
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
    const fetchUserDetails = async () => {
      try {
        const baseUrl = subdomain
          ? `https://${subdomain}.ogpumper.net`
          : "https://ogfieldticket.com";

        const response = await axios.get(
          `${baseUrl}/api/userdetails.php?id=${userID}`
        );
        if (response.data.success) {
          const users = response.data.users;
          const currentUser = users.find((user) => user.UserID === userID);
          setUser(currentUser);
          setEditedUser(currentUser);
        } else {
          console.error("Failed to fetch user details");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    if (userID) {
      fetchUserDetails();
    }
  }, [userID, subdomain]);

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    try {
      const baseUrl = subdomain
        ? `https://${subdomain}.ogpumper.net`
        : "https://ogfieldticket.com";
      const response = await fetch(`${baseUrl}/api/userdetails.php`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedUser),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(editedUser);
          setEditMode(false);
          console.log("User profile updated successfully");
        } else {
          console.error("Failed to update user profile");
        }
      } else {
        console.error("Error updating user profile:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };
  const handleCancelEdit = () => {
    setEditedUser(user);
    setEditMode(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditedUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleChangePassword = async () => {
    try {
      const updatedUser = {
        UserID: user.UserID,
        Sec: password, // Assuming 'Sec' is your backend field for password
      };
      const baseUrl = subdomain
        ? `https://${subdomain}.ogpumper.net`
        : "https://ogfieldticket.com";

      const response = await axios.patch(
        `${baseUrl}/api/userdetails.php`,
        updatedUser
      );
      if (response.data.success) {
        console.log("Password changed successfully");
        setPassword("");
        setConfirmPassword("");
        setShowPasswordChange(false); // Hide password fields after change
      } else {
        console.error("Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div
            className={`rounded-xl overflow-hidden shadow-lg ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div
              className={`p-6 ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}
            >
              <h1 className="text-2xl font-bold mb-4">User Profile</h1>
              <div className="flex items-center space-x-4 mb-6">
                <div className="rounded-full w-20 h-20 bg-gray-300 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} size="3x" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-semibold">{user.FullName}</p>

                  {editMode ? (
                    <input
                      type="email"
                      name="Email"
                      value={editedUser.Email}
                      onChange={handleInputChange}
                      className="text-gray-400 bg-transparent border-b border-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-400 truncate">{user.Email}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faEnvelope} className="h-6 w-6 mr-4" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">Email</p>
                    {editMode ? (
                      <input
                        type="email"
                        name="Email"
                        value={editedUser.Email}
                        onChange={handleInputChange}
                        className="text-gray-400 bg-transparent border-b border-gray-500 focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-400 truncate">{user.Email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faPhone} className="h-6 w-6 mr-4" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">Phone</p>
                    {editMode ? (
                      <input
                        type="tel"
                        name="Phone"
                        value={editedUser.Phone}
                        onChange={handleInputChange}
                        className="text-gray-400 bg-transparent border-b border-gray-500 focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-400 truncate">{user.Phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faLock} className="h-6 w-6 mr-4" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">UserID</p>
                    <p className="text-gray-400 truncate">{user.UserID}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faPenFancy} className="h-6 w-6 mr-4" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">Message</p>

                    <p className="text-gray-400 truncate">{user.Message}</p>
                  </div>
                </div>
              </div>

              {showPasswordChange && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-2">
                    Change Password
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="password"
                      placeholder="New Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="text-gray-400 bg-transparent border-b border-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="text-gray-400 bg-transparent border-b border-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex space-x-4 mt-4">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                      onClick={handleChangePassword}
                    >
                      Save Password
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                      onClick={() => setShowPasswordChange(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 mt-6">
                {editMode ? (
                  <>
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                      onClick={handleSaveProfile}
                    >
                      Save
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </button>
                )}
                <button
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                  onClick={() => setShowPasswordChange(true)}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
