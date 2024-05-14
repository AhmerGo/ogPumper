import React, { useState, useEffect } from "react";
import { useSpring, animated } from "react-spring";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "./ThemeContext";
import axios from "axios";

const Leases = () => {
  const { theme } = useTheme();
  const [leases, setLeases] = useState([]);
  const [filteredLeases, setFilteredLeases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [leasesPerPage] = useState(10);
  const [editLease, setEditLease] = useState(null);
  const [formData, setFormData] = useState({});
  const [subdomain, setSubdomain] = useState("");
  const [purchasers, setPurchasers] = useState([]);

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
    fetchLeases();
    fetchPurchasers();
  }, []);

  const fetchLeases = async () => {
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

      const response = await axios.get(`${baseUrl}/api/leases.php`);

      const data = response.data;
      setLeases(data);
      setFilteredLeases(data);
    } catch (error) {
      console.error("Error fetching leases:", error);
    }
  };

  const fetchPurchasers = async () => {
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

      const response = await axios.get(`${baseUrl}/api/usertags.php`);
      setPurchasers(response.data);
    } catch (error) {
      console.error("Error fetching purchasers:", error);
    }
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    const filtered = leases.filter(
      (lease) =>
        lease.LeaseID.toLowerCase().includes(searchTerm) ||
        lease.LeaseName.toLowerCase().includes(searchTerm) ||
        lease.PumperID.toLowerCase().includes(searchTerm)
    );

    setFilteredLeases(filtered);
    setCurrentPage(1);
  };

  const indexOfLastLease = currentPage * leasesPerPage;
  const indexOfFirstLease = indexOfLastLease - leasesPerPage;
  const currentLeases = filteredLeases.slice(
    indexOfFirstLease,
    indexOfLastLease
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const leaseAnimation = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  });

  const handleEdit = (lease) => {
    setEditLease(lease);
    setFormData({ ...lease }); // Create a copy of the lease object
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setEditLease({
      ...editLease,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedLease = {
        ...formData,
      };
      console.log(updatedLease);
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

      const response = await axios.patch(
        `${baseUrl}/api/leases.php`,
        updatedLease,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        setEditLease(null);
        fetchLeases();
      } else {
        console.error("Error updating lease:", response.data.message);
        // Display an error message to the user
      }
    } catch (error) {
      console.error("Error updating lease:", error);
      // Display an error message to the user
    }
  };

  return (
    <div
      className={`container mx-auto mt-5 p-4 rounded shadow ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h1 className="text-4xl font-bold mb-8">Leases</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by LeaseID, LeaseName, or PumperID"
          value={searchTerm}
          onChange={handleSearch}
          className={`w-full px-4 py-2 rounded ${
            theme === "dark"
              ? "bg-gray-700 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentLeases.map((lease) => (
          <animated.div
            key={lease.LeaseID}
            style={leaseAnimation}
            className={`p-6 rounded-lg shadow-md relative ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <div className="absolute top-2 right-2">
              <button
                className={`${
                  theme === "dark" ? "text-white" : "text-gray-800"
                } hover:text-blue-500 mr-2`}
                onClick={() => handleEdit(lease)}
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button
                className={`${
                  theme === "dark" ? "text-white" : "text-gray-800"
                } hover:text-red-500`}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">{lease.LeaseName}</h2>
              <p className="mb-2">
                <strong>LeaseID:</strong> {lease.LeaseID}
              </p>
              <p className="mb-2">
                <strong>Pumper:</strong> {lease.PumperID}
              </p>
              <p className="mb-2">
                <strong>Relief:</strong> {lease.ReliefID}
              </p>
              <p className="mb-2">
                <strong>District:</strong> {lease.District}
              </p>
              <p className="mb-2">
                <strong>RRC:</strong> {lease.RRC}
              </p>
              <p className="mb-2">
                <strong>Field Name:</strong> {lease.FieldName}
              </p>
              <p className="mb-2">
                <strong>Tag 1:</strong> {lease.Tag1}
              </p>
              <p className="mb-2">
                <strong>Tag 2:</strong> {lease.Tag2}
              </p>
              <p className="mb-2">
                <strong>Tag 3:</strong> {lease.Tag3}
              </p>
              <p className="mb-2">
                <strong>Tag 4:</strong> {lease.Tag4}
              </p>
              <p className="mb-2">
                <strong>Purchaser:</strong> {lease.Purchaser}
              </p>
              <p className="mb-2">
                <strong>Purchaser Lease No:</strong> {lease.PurchaserLeaseNo}
              </p>
              <p className="mb-2">
                <strong>Max Inj:</strong> {lease.MaxInj}
              </p>
              <p className="mb-2">
                <strong>Max Pressure:</strong> {lease.MaxPressure}
              </p>
              <p className="mb-2">
                <strong>External Property #:</strong> {lease.PropertyNum}
              </p>
            </div>
          </animated.div>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        {Array.from(
          { length: Math.ceil(filteredLeases.length / leasesPerPage) },
          (_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === i + 1
                  ? theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800 text-white"
                  : theme === "dark"
                  ? "bg-gray-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {i + 1}
            </button>
          )
        )}
      </div>
      {editLease && (
        <EditLeaseModal
          lease={editLease}
          formData={formData}
          onInputChange={handleInputChange}
          onSave={handleSubmit}
          onClose={() => setEditLease(null)}
          setFormData={setFormData} // Pass setFormData as a prop
          purchasers={purchasers}
        />
      )}
    </div>
  );
};
const EditLeaseModal = ({
  lease,
  formData,
  onInputChange,
  onSave,
  onClose,
  setFormData,
  purchasers,
}) => {
  const [activeTab, setActiveTab] = useState("basic");
  const { theme } = useTheme();
  const [tagOptions, setTagOptions] = useState([]);
  const [pumperOptions, setPumperOptions] = useState([]);
  const [reliefOptions, setReliefOptions] = useState([]);
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
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
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

      const response = await axios.get(`${baseUrl}/api/usertags.php`);
      const data = response.data;
      const tags = data.filter((item) => item.TagID && item.TagDesc);
      const pumpers = data.filter((item) => item.Role === "P");
      const reliefPumpers = data.filter((item) => item.Role === "P");

      setTagOptions(tags);
      setPumperOptions(pumpers);
      setReliefOptions(reliefPumpers);
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(e);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        theme === "light"
          ? "bg-white bg-opacity-90"
          : "bg-gray-800 bg-opacity-90"
      }`}
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="relative bg-transparent w-full max-w-3xl mx-auto p-6 rounded-lg">
        <div
          className={`rounded-lg shadow-lg overflow-hidden transform transition-all ${
            theme === "light" ? "bg-white" : "bg-gray-700"
          }`}
        >
          <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 mb-4">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3
                className={`text-2xl font-semibold ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                Edit Lease
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-red-500 hover:text-red-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={`px-4 py-2 rounded-lg focus:outline-none ${
                  activeTab === "basic"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("additional")}
                className={`px-4 py-2 rounded-lg focus:outline-none ${
                  activeTab === "additional"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                Additional Info
              </button>
            </div>
            {activeTab === "basic" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="LeaseID"
                    className={`block text-sm font-medium leading-5 ${
                      theme === "light" ? "text-gray-700" : "text-white"
                    }`}
                  >
                    Lease ID
                  </label>
                  <input
                    type="text"
                    name="LeaseID"
                    value={formData.LeaseID}
                    onChange={(e) =>
                      setFormData({ ...formData, LeaseID: e.target.value })
                    }
                    className={`mt-1 form-input block w-full px-3 py-2 ${
                      theme === "light"
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150 ease-in-out sm:text-sm sm:leading-5`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="LeaseName"
                    className={`block text-sm font-medium leading-5 ${
                      theme === "light" ? "text-gray-700" : "text-white"
                    }`}
                  >
                    Lease Name
                  </label>
                  <input
                    type="text"
                    name="LeaseName"
                    value={formData.LeaseName}
                    onChange={(e) =>
                      setFormData({ ...formData, LeaseName: e.target.value })
                    }
                    className={`mt-1 form-input block w-full px-3 py-2 ${
                      theme === "light"
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150 ease-in-out sm:text-sm sm:leading-5`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="PumperID"
                    className={`block text-sm font-medium leading-5 ${
                      theme === "light" ? "text-gray-700" : "text-white"
                    }`}
                  >
                    Pumper
                  </label>
                  <select
                    name="PumperID"
                    value={formData.PumperID || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, PumperID: e.target.value })
                    }
                    className={`mt-1 form-select block w-full px-3 py-2 ${
                      theme === "light"
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150 ease-in-out sm:text-sm sm:leading-5`}
                  >
                    <option value="">Select Pumper</option>
                    {pumperOptions.map((pumper) => (
                      <option key={pumper.UserID} value={pumper.UserID}>
                        {pumper.FullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="ReliefID"
                    className={`block text-sm font-medium leading-5 ${
                      theme === "light" ? "text-gray-700" : "text-white"
                    }`}
                  >
                    Relief
                  </label>
                  <select
                    name="ReliefID"
                    value={formData.ReliefID || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, ReliefID: e.target.value })
                    }
                    className={`mt-1 form-select block w-full px-3 py-2 ${
                      theme === "light"
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150 ease-in-out sm:text-sm sm:leading-5`}
                  >
                    <option value="">Select Relief</option>
                    {reliefOptions.map((relief) => (
                      <option key={relief.UserID} value={relief.UserID}>
                        {relief.FullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {activeTab === "additional" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="Tag1"
                    className={`block text-sm font-medium leading-5 ${
                      theme === "light" ? "text-gray-700" : "text-white"
                    }`}
                  >
                    Tag 1
                  </label>
                  <select
                    name="Tag1"
                    value={formData.Tag1 || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, Tag1: e.target.value })
                    }
                    className={`mt-1 form-select block w-full px-3 py-2 ${
                      theme === "light"
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150 ease-in-out sm:text-sm sm:leading-5`}
                  >
                    <option value="">Select Tag 1</option>
                    {tagOptions.map((tag) => (
                      <option key={tag.TagID} value={tag.TagID}>
                        {tag.TagID} - {tag.TagDesc}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="Tag2"
                    className={`block text-sm font-medium leading-5 ${
                      theme === "light" ? "text-gray-700" : "text-white"
                    }`}
                  >
                    Tag 2
                  </label>
                  <select
                    name="Tag2"
                    value={formData.Tag2 || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, Tag2: e.target.value })
                    }
                    className={`mt-1 form-select block w-full px-3 py-2 ${
                      theme === "light"
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150 ease-in-out sm:text-sm sm:leading-5`}
                  >
                    <option value="">Select Tag 2</option>
                    {tagOptions.map((tag) => (
                      <option key={tag.TagID} value={tag.TagID}>
                        {tag.TagID} - {tag.TagDesc}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="Tag3"
                    className={`block text-sm font-medium leading-5 ${
                      theme === "light" ? "text-gray-700" : "text-white"
                    }`}
                  >
                    Tag 3
                  </label>
                  <select
                    name="Tag3"
                    value={formData.Tag3 || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, Tag3: e.target.value })
                    }
                    className={`mt-1 form-select block w-full px-3 py-2 ${
                      theme === "light"
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150 ease-in-out sm:text-sm sm:leading-5`}
                  >
                    <option value="">Select Tag 3</option>
                    {tagOptions.map((tag) => (
                      <option key={tag.TagID} value={tag.TagID}>
                        {tag.TagID} - {tag.TagDesc}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="Tag4"
                    className={`block text-sm font-medium leading-5 ${
                      theme === "light" ? "text-gray-700" : "text-white"
                    }`}
                  >
                    Tag 4
                  </label>
                  <select
                    name="Tag4"
                    value={formData.Tag4 || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, Tag4: e.target.value })
                    }
                    className={`mt-1 form-select block w-full px-3 py-2 ${
                      theme === "light"
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150 ease-in-out sm:text-sm sm:leading-5`}
                  >
                    <option value="">Select Tag 4</option>
                    {tagOptions.map((tag) => (
                      <option key={tag.TagID} value={tag.TagID}>
                        {tag.TagID} - {tag.TagDesc}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="Purchaser"
                    className={`block text-sm font-medium leading-5 ${
                      theme === "light" ? "text-gray-700" : "text-white"
                    }`}
                  >
                    Purchaser
                  </label>
                  <select
                    name="Purchaser"
                    value={formData.Purchaser || ""}
                    onChange={onInputChange}
                    className={`mt-1 form-select block w-full px-3 py-2 ${
                      theme === "light"
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150 ease-in-out sm:text-sm sm:leading-5`}
                  >
                    <option value="">Select Purchaser</option>
                    {purchasers
                      .filter(
                        (purchaser) =>
                          purchaser.PurchaserName && purchaser.PurchaserID
                      )
                      .map((purchaser) => (
                        <option
                          key={purchaser.PurchaserID}
                          value={purchaser.PurchaserID}
                        >
                          {purchaser.PurchaserName}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="PurchaserLeaseNo"
                    className={`block text-sm font-medium leading-5 ${
                      theme === "light" ? "text-gray-700" : "text-white"
                    }`}
                  >
                    Purchaser Lease No
                  </label>
                  <input
                    type="text"
                    name="PurchaserLeaseNo"
                    value={formData.PurchaserLeaseNo || ""}
                    onChange={onInputChange}
                    className={`mt-1 form-input block w-full px-3 py-2 ${
                      theme === "light"
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150 ease-in-out sm:text-sm sm:leading-5`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="MaxInj"
                    className={`block text-sm font-medium leading-5 ${
                      theme === "light" ? "text-gray-700" : "text-white"
                    }`}
                  >
                    Max Inj
                  </label>
                  <input
                    type="text"
                    name="MaxInj"
                    value={formData.MaxInj || "0"}
                    onChange={onInputChange}
                    className={`mt-1 form-input block w-full px-3 py-2 ${
                      theme === "light"
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150 ease-in-out sm:text-sm sm:leading-5`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="MaxPressure"
                    className={`block text-sm font-medium leading-5 ${
                      theme === "light" ? "text-gray-700" : "text-white"
                    }`}
                  >
                    Max Pressure
                  </label>
                  <input
                    type="text"
                    name="MaxPressure"
                    value={formData.MaxPressure || "0"}
                    onChange={onInputChange}
                    className={`mt-1 form-input block w-full px-3 py-2 ${
                      theme === "light"
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150 ease-in-out sm:text-sm sm:leading-5`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="PropertyNum"
                    className={`block text-sm font-medium leading-5 ${
                      theme === "light" ? "text-gray-700" : "text-white"
                    }`}
                  >
                    External Property #
                  </label>
                  <input
                    type="text"
                    name="PropertyNum"
                    value={formData.PropertyNum || "1000"}
                    onChange={onInputChange}
                    className={`mt-1 form-input block w-full px-3 py-2 ${
                      theme === "light"
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150 ease-in-out sm:text-sm sm:leading-5`}
                  />
                </div>
              </div>
            )}
            <div
              className={`mt-6 px-4 py-3 sm:px-6 flex justify-center space-x-4 ${
                theme === "light" ? "bg-gray-50" : "bg-gray-700"
              }`}
            >
              <span className="flex w-full sm:w-auto">
                <button
                  type="submit"
                  className={`inline-flex items-center justify-center w-full px-6 py-3 text-base font-semibold rounded-lg shadow-md ${
                    theme === "light"
                      ? "text-white bg-blue-500 hover:bg-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
                      : "text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-700 focus:ring-opacity-50"
                  } transition-all duration-300 ease-in-out transform hover:scale-105`}
                >
                  Save
                </button>
              </span>
              <span className="flex w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className={`inline-flex items-center justify-center w-full px-6 py-3 text-base font-semibold rounded-lg shadow-md ${
                    theme === "light"
                      ? "text-gray-700 bg-gray-100 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
                      : "text-white bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-700 focus:ring-opacity-50"
                  } transition-all duration-300 ease-in-out transform hover:scale-105`}
                >
                  Cancel
                </button>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Leases;
