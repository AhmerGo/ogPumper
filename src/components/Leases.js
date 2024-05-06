import React, { useState, useEffect } from "react";
import { useSpring, animated } from "react-spring";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "./ThemeContext";
import axios from "axios";

const Leases = () => {
  const { theme } = useTheme();
  //   const [leases, setLeases] = useState([]);
  //   const [users, setUsers] = useState([]);
  //   const [tags, setTags] = useState([]);
  //   const [purchasers, setPurchasers] = useState([]);
  const [leases, setLeases] = useState([
    {
      id: 1,
      leaseName: "Lease 1",
      pumperId: 1,
      reliefId: 2,
      district: "District 1",
      rrc: "RRC 1",
      fieldName: "Field 1",
      tag1: 1,
      tag2: 2,
      tag3: 3,
      tag4: 4,
      purchaserId: 1,
      purchaserLeaseNo: "PL-001",
      maxInj: 1000,
      maxPressure: 2000,
      propertyNum: "PROP-001",
    },
    {
      id: 2,
      leaseName: "Lease 2",
      pumperId: 2,
      reliefId: 1,
      district: "District 2",
      rrc: "RRC 2",
      fieldName: "Field 2",
      tag1: 2,
      tag2: 3,
      tag3: 4,
      tag4: 1,
      purchaserId: 2,
      purchaserLeaseNo: "PL-002",
      maxInj: 1500,
      maxPressure: 2500,
      propertyNum: "PROP-002",
    },
  ]);

  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", userType: "P" },
    { id: 2, name: "Jane Smith", userType: "P" },
  ]);

  const [tags, setTags] = useState([
    { id: 1, name: "Tag 1" },
    { id: 2, name: "Tag 2" },
    { id: 3, name: "Tag 3" },
    { id: 4, name: "Tag 4" },
  ]);

  const [purchasers, setPurchasers] = useState([
    { id: 1, name: "Purchaser 1" },
    { id: 2, name: "Purchaser 2" },
  ]);

  const [editingLease, setEditingLease] = useState(null);

  useEffect(() => {
    fetchLeases();
    fetchUsers();
    fetchTags();
    fetchPurchasers();
  }, []);

  const fetchLeases = async () => {
    try {
      const response = await axios.get("https://your-api.com/leases");
      setLeases(response.data);
    } catch (error) {
      console.error("Error fetching leases:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("https://your-api.com/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get("https://your-api.com/tags");
      setTags(response.data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const fetchPurchasers = async () => {
    try {
      const response = await axios.get("https://your-api.com/purchasers");
      setPurchasers(response.data);
    } catch (error) {
      console.error("Error fetching purchasers:", error);
    }
  };

  const handleEditLease = (lease) => {
    setEditingLease(lease);
  };

  const handleSaveLease = () => {
    setLeases((prevLeases) =>
      prevLeases.map((lease) =>
        lease.id === editingLease.id ? editingLease : lease
      )
    );
    setEditingLease(null);
  };
  const handleCancelEdit = () => {
    setEditingLease(null);
  };

  const handleDeleteLease = async (leaseId) => {
    try {
      await axios.delete(`https://your-api.com/leases/${leaseId}`);
      fetchLeases();
    } catch (error) {
      console.error("Error deleting lease:", error);
    }
  };

  const leaseAnimation = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  });

  return (
    <div
      className={`p-8 ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      }`}
    >
      <h1 className="text-4xl font-bold mb-8">Leases</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {leases.map((lease) => (
          <animated.div
            key={lease.id}
            style={leaseAnimation}
            className={`p-6 rounded-lg shadow-md ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            {editingLease && editingLease.id === lease.id ? (
              <div>
                <input
                  type="text"
                  value={editingLease.leaseName}
                  onChange={(e) =>
                    setEditingLease({
                      ...editingLease,
                      leaseName: e.target.value,
                    })
                  }
                  className={`w-full mb-4 p-2 rounded ${
                    theme === "dark"
                      ? "bg-gray-600 text-white"
                      : "bg-white text-gray-800"
                  }`}
                />
                <select
                  value={editingLease.pumperId}
                  onChange={(e) =>
                    setEditingLease({
                      ...editingLease,
                      pumperId: e.target.value,
                    })
                  }
                  className={`w-full mb-4 p-2 rounded ${
                    theme === "dark"
                      ? "bg-gray-600 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  <option value="">Select Pumper</option>
                  {users
                    .filter((user) => user.userType === "P")
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                </select>
                <select
                  value={editingLease.reliefId}
                  onChange={(e) =>
                    setEditingLease({
                      ...editingLease,
                      reliefId: e.target.value,
                    })
                  }
                  className={`w-full mb-4 p-2 rounded ${
                    theme === "dark"
                      ? "bg-gray-600 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  <option value="">Select Relief</option>
                  {users
                    .filter((user) => user.userType === "P")
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                </select>
                <input
                  type="text"
                  value={editingLease.district}
                  onChange={(e) =>
                    setEditingLease({
                      ...editingLease,
                      district: e.target.value,
                    })
                  }
                  className={`w-full mb-4 p-2 rounded ${
                    theme === "dark"
                      ? "bg-gray-600 text-white"
                      : "bg-white text-gray-800"
                  }`}
                />
                <input
                  type="text"
                  value={editingLease.rrc}
                  onChange={(e) =>
                    setEditingLease({ ...editingLease, rrc: e.target.value })
                  }
                  className={`w-full mb-4 p-2 rounded ${
                    theme === "dark"
                      ? "bg-gray-600 text-white"
                      : "bg-white text-gray-800"
                  }`}
                />
                <input
                  type="text"
                  value={editingLease.fieldName}
                  onChange={(e) =>
                    setEditingLease({
                      ...editingLease,
                      fieldName: e.target.value,
                    })
                  }
                  className={`w-full mb-4 p-2 rounded ${
                    theme === "dark"
                      ? "bg-gray-600 text-white"
                      : "bg-white text-gray-800"
                  }`}
                />
                <select
                  value={editingLease.tag1}
                  onChange={(e) =>
                    setEditingLease({ ...editingLease, tag1: e.target.value })
                  }
                  className={`w-full mb-4 p-2 rounded ${
                    theme === "dark"
                      ? "bg-gray-600 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  <option value="">Select Tag 1</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <select
                  value={editingLease.tag2}
                  onChange={(e) =>
                    setEditingLease({ ...editingLease, tag2: e.target.value })
                  }
                  className={`w-full mb-4 p-2 rounded ${
                    theme === "dark"
                      ? "bg-gray-600 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  <option value="">Select Tag 2</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <select
                  value={editingLease.tag3}
                  onChange={(e) =>
                    setEditingLease({ ...editingLease, tag3: e.target.value })
                  }
                  className={`w-full mb-4 p-2 rounded ${
                    theme === "dark"
                      ? "bg-gray-600 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  <option value="">Select Tag 3</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <select
                  value={editingLease.tag4}
                  onChange={(e) =>
                    setEditingLease({ ...editingLease, tag4: e.target.value })
                  }
                  className={`w-full mb-4 p-2 rounded ${
                    theme === "dark"
                      ? "bg-gray-600 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  <option value="">Select Tag 4</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <select
                  value={editingLease.purchaserId}
                  onChange={(e) =>
                    setEditingLease({
                      ...editingLease,
                      purchaserId: e.target.value,
                    })
                  }
                  className={`w-full mb-4 p-2 rounded ${
                    theme === "dark"
                      ? "bg-gray-600 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  <option value="">Select Purchaser</option>
                  {purchasers.map((purchaser) => (
                    <option key={purchaser.id} value={purchaser.id}>
                      {purchaser.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={editingLease.purchaserLeaseNo}
                  onChange={(e) =>
                    setEditingLease({
                      ...editingLease,
                      purchaserLeaseNo: e.target.value,
                    })
                  }
                  className={`w-full mb-4 p-2 rounded ${
                    theme === "dark"
                      ? "bg-gray-600 text-white"
                      : "bg-white text-gray-800"
                  }`}
                />
                <input
                  type="number"
                  value={editingLease.maxInj}
                  onChange={(e) =>
                    setEditingLease({ ...editingLease, maxInj: e.target.value })
                  }
                  className={`w-full mb-4 p-2 rounded ${
                    theme === "dark"
                      ? "bg-gray-600 text-white"
                      : "bg-white text-gray-800"
                  }`}
                />
                <input
                  type="number"
                  value={editingLease.maxPressure}
                  onChange={(e) =>
                    setEditingLease({
                      ...editingLease,
                      maxPressure: e.target.value,
                    })
                  }
                  className={`w-full mb-4 p-2 rounded ${
                    theme === "dark"
                      ? "bg-gray-600 text-white"
                      : "bg-white text-gray-800"
                  }`}
                />
                <input
                  type="text"
                  value={editingLease.propertyNum}
                  onChange={(e) =>
                    setEditingLease({
                      ...editingLease,
                      propertyNum: e.target.value,
                    })
                  }
                  className={`w-full mb-4 p-2 rounded ${
                    theme === "dark"
                      ? "bg-gray-600 text-white"
                      : "bg-white text-gray-800"
                  }`}
                  placeholder="External Property #"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveLease}
                    className={`px-4 py-2 rounded mr-4 ${
                      theme === "dark"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className={`px-4 py-2 rounded ${
                      theme === "dark"
                        ? "bg-gray-600 hover:bg-gray-700"
                        : "bg-gray-400 hover:bg-gray-500"
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-4">{lease.leaseName}</h2>
                <p className="mb-2">
                  <strong>Pumper:</strong>{" "}
                  {users.find((user) => user.id === lease.pumperId)?.name}
                </p>
                <p className="mb-2">
                  <strong>Relief:</strong>{" "}
                  {users.find((user) => user.id === lease.reliefId)?.name}
                </p>
                <p className="mb-2">
                  <strong>District:</strong> {lease.district}
                </p>
                <p className="mb-2">
                  <strong>RRC:</strong> {lease.rrc}
                </p>
                <p className="mb-2">
                  <strong>Field Name:</strong> {lease.fieldName}
                </p>
                <p className="mb-2">
                  <strong>Tag 1:</strong>{" "}
                  {tags.find((tag) => tag.id === lease.tag1)?.name}
                </p>
                <p className="mb-2">
                  <strong>Tag 2:</strong>{" "}
                  {tags.find((tag) => tag.id === lease.tag2)?.name}
                </p>
                <p className="mb-2">
                  <strong>Tag 3:</strong>{" "}
                  {tags.find((tag) => tag.id === lease.tag3)?.name}
                </p>
                <p className="mb-2">
                  <strong>Tag 4:</strong>{" "}
                  {tags.find((tag) => tag.id === lease.tag4)?.name}
                </p>
                <p className="mb-2">
                  <strong>Purchaser:</strong>{" "}
                  {
                    purchasers.find(
                      (purchaser) => purchaser.id === lease.purchaserId
                    )?.name
                  }
                </p>
                <p className="mb-2">
                  <strong>Purchaser Lease No:</strong> {lease.purchaserLeaseNo}
                </p>
                <p className="mb-2">
                  <strong>Max Inj:</strong> {lease.maxInj}
                </p>
                <p className="mb-2">
                  <strong>Max Pressure:</strong> {lease.maxPressure}
                </p>
                <p className="mb-2">
                  <strong>External Property #:</strong> {lease.propertyNum}
                </p>
                <div className="flex justify-end">
                  <FontAwesomeIcon
                    icon={faEdit}
                    onClick={() => handleEditLease(lease)}
                    className={`mr-4 cursor-pointer ${
                      theme === "dark"
                        ? "text-white hover:text-gray-300"
                        : "text-gray-800 hover:text-gray-600"
                    }`}
                  />
                  <FontAwesomeIcon
                    icon={faTrash}
                    onClick={() => handleDeleteLease(lease.id)}
                    className={`cursor-pointer ${
                      theme === "dark"
                        ? "text-white hover:text-gray-300"
                        : "text-gray-800 hover:text-gray-600"
                    }`}
                  />
                </div>
              </div>
            )}
          </animated.div>
        ))}
      </div>
    </div>
  );
};

export default Leases;
