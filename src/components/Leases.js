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
  }, []);

  const fetchLeases = async () => {
    try {
      const baseUrl = subdomain
        ? `https://${subdomain}.ogpumper.net`
        : "https://ogfieldticket.com";
      const response = await axios.get(`${baseUrl}/api/leases.php`);

      const data = response.data;
      setLeases(data);
      setFilteredLeases(data);
    } catch (error) {
      console.error("Error fetching leases:", error);
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
      const updatedLease = {};
      Object.keys(formData).forEach((key) => {
        if (editLease.hasOwnProperty(key)) {
          updatedLease[key] = formData[key];
        }
      });
      console.log(editLease.LeaseID);
      console.log(updatedLease);

      const response = await axios.patch(
        `https://ogfieldticket.com/api/leases.php/${editLease.LeaseID}`,
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
      className={`p-8 ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
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
}) => {
  const [activeTab, setActiveTab] = useState("basic");
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(e);
  };
  return (
    <div
      className={`fixed inset-0 z-10 overflow-y-auto ${
        theme === "light" ? "bg-white" : "bg-gray-800"
      }`}
    >
      <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div
            className={`absolute inset-0 ${
              theme === "light"
                ? "bg-gray-500 opacity-75"
                : "bg-black opacity-75"
            }`}
          ></div>
        </div>

        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>

        <div
          className={`inline-block overflow-hidden text-left align-bottom transition-all transform ${
            theme === "light"
              ? "bg-white rounded-lg shadow-xl"
              : "bg-gray-700 rounded-lg shadow-xl"
          } sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <form
            onSubmit={handleSubmit}
            className={`${
              theme === "light" ? "bg-white" : "bg-gray-700 text-white"
            } px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}
          >
            <div>
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3
                    className={`text-lg leading-6 font-medium ${
                      theme === "light" ? "text-gray-900" : "text-white"
                    }`}
                    id="modal-headline"
                  >
                    Edit Lease
                  </h3>
                  <div className="mt-2">
                    <div className="py-2 align-middle inline-block min-w-full">
                      <div
                        className={`shadow overflow-hidden ${
                          theme === "light"
                            ? "border-b border-gray-200"
                            : "border-b border-gray-600"
                        } sm:rounded-lg`}
                      >
                        <div
                          className={`${
                            theme === "light"
                              ? "bg-white px-4 py-5"
                              : "bg-gray-700 px-4 py-5 text-white"
                          } sm:px-6`}
                        >
                          <div className="grid grid-cols-1 gap-6">
                            <div className="col-span-1">
                              <button
                                type="button"
                                onClick={() => setActiveTab("basic")}
                                className={`px-3 py-2 ${
                                  activeTab === "basic"
                                    ? `${
                                        theme === "light"
                                          ? "text-white bg-blue-500"
                                          : "text-white bg-blue-600"
                                      }`
                                    : `${
                                        theme === "light"
                                          ? "text-blue-500 bg-white"
                                          : "text-blue-400 bg-gray-700"
                                      }`
                                } font-medium text-sm leading-4 rounded-md focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition ease-in-out duration-150`}
                              >
                                Basic Info
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveTab("additional")}
                                className={`ml-2 px-3 py-2 ${
                                  activeTab === "additional"
                                    ? `${
                                        theme === "light"
                                          ? "text-white bg-blue-500"
                                          : "text-white bg-blue-600"
                                      }`
                                    : `${
                                        theme === "light"
                                          ? "text-blue-500 bg-white"
                                          : "text-blue-400 bg-gray-700"
                                      }`
                                } font-medium text-sm leading-4 rounded-md focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition ease-in-out duration-150`}
                              >
                                Additional Info
                              </button>
                            </div>
                            {activeTab === "basic" && (
                              <>
                                <div>
                                  <label
                                    htmlFor="LeaseID"
                                    className={`block text-sm font-medium leading-5 ${
                                      theme === "light"
                                        ? "text-gray-700"
                                        : "text-white"
                                    }`}
                                  >
                                    Lease ID
                                  </label>
                                  <input
                                    type="text"
                                    name="LeaseID"
                                    value={formData.LeaseID}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        LeaseID: e.target.value,
                                      })
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
                                      theme === "light"
                                        ? "text-gray-700"
                                        : "text-white"
                                    }`}
                                  >
                                    Lease Name
                                  </label>
                                  <input
                                    type="text"
                                    name="LeaseName"
                                    value={formData.LeaseName}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        LeaseName: e.target.value,
                                      })
                                    }
                                    className={`mt-1 form-input block w-full px-3 py-2 ${
                                      theme === "light"
                                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 bg-gray-700 text-white"
                                    } transition duration-150 ease-in-out sm:text-sm sm:leading-5`}
                                  />
                                </div>
                              </>
                            )}
                            {/* Additional information fields within the tabbed interface */}
                            {activeTab === "additional" && (
                              <div>
                                {/* Additional fields can be added here based on requirement */}
                                <div>
                                  <label
                                    htmlFor="Tag1"
                                    className={`block text-sm font-medium leading-5 ${
                                      theme === "light"
                                        ? "text-gray-700"
                                        : "text-white"
                                    }`}
                                  >
                                    Tag 1
                                  </label>
                                  <input
                                    type="text"
                                    name="Tag1"
                                    value={formData.Tag1 || "OIL/GAS"}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        Tag1: e.target.value,
                                      })
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
                                    htmlFor="Tag2"
                                    className={`block text-sm font-medium leading-5 ${
                                      theme === "light"
                                        ? "text-gray-700"
                                        : "text-white"
                                    }`}
                                  >
                                    Tag 2
                                  </label>
                                  <input
                                    type="text"
                                    name="Tag2"
                                    value={formData.Tag2 || ""}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        Tag2: e.target.value,
                                      })
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
                                    htmlFor="Tag3"
                                    className={`block text-sm font-medium leading-5 ${
                                      theme === "light"
                                        ? "text-gray-700"
                                        : "text-white"
                                    }`}
                                  >
                                    Tag 3
                                  </label>
                                  <input
                                    type="text"
                                    name="Tag3"
                                    value={formData.Tag3 || ""}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        Tag3: e.target.value,
                                      })
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
                                    htmlFor="Tag4"
                                    className={`block text-sm font-medium leading-5 ${
                                      theme === "light"
                                        ? "text-gray-700"
                                        : "text-white"
                                    }`}
                                  >
                                    Tag 4
                                  </label>
                                  <input
                                    type="text"
                                    name="Tag4"
                                    value={formData.Tag4 || ""}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        Tag4: e.target.value,
                                      })
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
                                    htmlFor="Purchaser"
                                    className={`block text-sm font-medium leading-5 ${
                                      theme === "light"
                                        ? "text-gray-700"
                                        : "text-white"
                                    }`}
                                  >
                                    Purchaser
                                  </label>
                                  <input
                                    type="text"
                                    name="Purchaser"
                                    value={formData.Purchaser || "TRANSOIL"}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        Purchaser: e.target.value,
                                      })
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
                                    htmlFor="PurchaserLeaseNo"
                                    className={`block text-sm font-medium leading-5 ${
                                      theme === "light"
                                        ? "text-gray-700"
                                        : "text-white"
                                    }`}
                                  >
                                    Purchaser Lease No
                                  </label>
                                  <input
                                    type="text"
                                    name="PurchaserLeaseNo"
                                    value={formData.PurchaserLeaseNo || "6096"}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        PurchaserLeaseNo: e.target.value,
                                      })
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
                                    htmlFor="MaxInj"
                                    className={`block text-sm font-medium leading-5 ${
                                      theme === "light"
                                        ? "text-gray-700"
                                        : "text-white"
                                    }`}
                                  >
                                    Max Inj
                                  </label>
                                  <input
                                    type="text"
                                    name="MaxInj"
                                    value={formData.MaxInj || "0"}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        MaxInj: e.target.value,
                                      })
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
                                    htmlFor="MaxPressure"
                                    className={`block text-sm font-medium leading-5 ${
                                      theme === "light"
                                        ? "text-gray-700"
                                        : "text-white"
                                    }`}
                                  >
                                    Max Pressure
                                  </label>
                                  <input
                                    type="text"
                                    name="MaxPressure"
                                    value={formData.MaxPressure || "0"}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        MaxPressure: e.target.value,
                                      })
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
                                    htmlFor="PropertyNum"
                                    className={`block text-sm font-medium leading-5 ${
                                      theme === "light"
                                        ? "text-gray-700"
                                        : "text-white"
                                    }`}
                                  >
                                    External Property #
                                  </label>
                                  <input
                                    type="text"
                                    name="PropertyNum"
                                    value={formData.PropertyNum || "1000"}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        PropertyNum: e.target.value,
                                      })
                                    }
                                    className={`mt-1 form-input block w-full px-3 py-2 ${
                                      theme === "light"
                                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 bg-gray-700 text-white"
                                    } transition duration-150 ease-in-out sm:text-sm sm:leading-5`}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${
                theme === "light" ? "bg-white" : "bg-gray-700 text-white"
              }`}
            >
              <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
                <button
                  type="submit"
                  className={`inline-flex justify-center w-full px-4 py-2 text-base leading-6 font-medium rounded-md ${
                    theme === "light"
                      ? "text-white bg-blue-500 hover:bg-blue-400 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue"
                      : "text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue"
                  } transition ease-in-out duration-150 sm:text-sm sm:leading-5`}
                >
                  Save
                </button>
              </span>
              <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className={`inline-flex justify-center w-full px-4 py-2 text-base leading-6 font-medium rounded-md ${
                    theme === "light"
                      ? "text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue"
                      : "text-white bg-gray-600 hover:bg-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue"
                  } transition ease-in-out duration-150 sm:text-sm sm:leading-5`}
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
