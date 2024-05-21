import React, { useState, useEffect, useRef } from "react";
import { useSpring, animated } from "react-spring";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faTimes,
  faPlus,
  faChevronUp,
  faChevronDown,
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

  const handleSubmit = async (e, data) => {
    e.preventDefault();
    try {
      const { tanks, wells } = data; // Extract tanks and wells from the data object

      const formDataTanks = formData.Tanks || [];
      const formDataWells = formData.Wells || [];

      // Filter out duplicates from formData
      const filteredTanks = tanks.filter(
        (tank) =>
          !formDataTanks.some((formTank) => formTank.UniqID === tank.UniqID)
      );
      const filteredWells = wells.filter(
        (well) =>
          !formDataWells.some((formWell) => formWell.UniqID === well.UniqID)
      );

      const updatedLease = {
        ...formData,
        Tanks: [...formDataTanks, ...filteredTanks],
        Wells: [...formDataWells, ...filteredWells],
      };

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

      console.log(`The updated lease:`);
      console.log(updatedLease);

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
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">{lease.LeaseName}</h2>
              {lease.LeaseID && (
                <p className="mb-2">
                  <strong>LeaseID:</strong> {lease.LeaseID}
                </p>
              )}
              {lease.PumperID && (
                <p className="mb-2">
                  <strong>Pumper:</strong> {lease.PumperID}
                </p>
              )}
              {lease.Active && (
                <p className="mb-2">
                  <strong>Active:</strong> {lease.Active}
                </p>
              )}
              {lease.ReliefID && (
                <p className="mb-2">
                  <strong>Relief:</strong> {lease.ReliefID}
                </p>
              )}
              {lease.District && (
                <p className="mb-2">
                  <strong>District:</strong> {lease.District}
                </p>
              )}
              {lease.RRC && (
                <p className="mb-2">
                  <strong>RRC:</strong> {lease.RRC}
                </p>
              )}
              {lease.FieldName && (
                <p className="mb-2">
                  <strong>Field Name:</strong> {lease.FieldName}
                </p>
              )}
              {lease.Tag1 && (
                <p className="mb-2">
                  <strong>Tag 1:</strong> {lease.Tag1}
                </p>
              )}
              {lease.Tag2 && (
                <p className="mb-2">
                  <strong>Tag 2:</strong> {lease.Tag2}
                </p>
              )}
              {lease.Tag3 && (
                <p className="mb-2">
                  <strong>Tag 3:</strong> {lease.Tag3}
                </p>
              )}
              {lease.Tag4 && (
                <p className="mb-2">
                  <strong>Tag 4:</strong> {lease.Tag4}
                </p>
              )}
              {lease.Purchaser && (
                <p className="mb-2">
                  <strong>Purchaser:</strong> {lease.Purchaser}
                </p>
              )}
              {lease.PurchaserLeaseNo && (
                <p className="mb-2">
                  <strong>Purchaser Lease No:</strong> {lease.PurchaserLeaseNo}
                </p>
              )}
              {lease.MaxInj && (
                <p className="mb-2">
                  <strong>Max Inj:</strong> {lease.MaxInj}
                </p>
              )}
              {lease.MaxPressure && (
                <p className="mb-2">
                  <strong>Max Pressure:</strong> {lease.MaxPressure}
                </p>
              )}
              {lease.PropertyNum && (
                <p className="mb-2">
                  <strong>External Property #:</strong> {lease.PropertyNum}
                </p>
              )}
              {lease.Wells && lease.Wells.length > 0 && (
                <p className="mb-2">
                  <strong>Wells:</strong>{" "}
                  {lease.Wells.map((well) => (
                    <span key={well.UniqID}> {well.WellID}</span>
                  ))}
                </p>
              )}
              {lease.Tanks && lease.Tanks.length > 0 && (
                <p className="mb-2">
                  <strong>Tanks:</strong>{" "}
                  {lease.Tanks.map((tank) => (
                    <span key={tank.UniqID}> {tank.TankID}</span>
                  ))}
                </p>
              )}
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
  const [tanks] = useState(lease.Tanks || []);
  const [wells] = useState(lease.Wells || []);
  const [expandedTankIndex, setExpandedTankIndex] = useState(null);
  const [expandedWellIndex, setExpandedWellIndex] = useState(null);
  const tankSectionRef = useRef(null);
  const wellSectionRef = useRef(null);

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

  const toggleExpandTank = (index) => {
    setExpandedTankIndex(expandedTankIndex === index ? null : index);
    if (expandedTankIndex !== index) {
      setTimeout(() => {
        tankSectionRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const toggleExpandWell = (index) => {
    setExpandedWellIndex(expandedWellIndex === index ? null : index);
    if (expandedWellIndex !== index) {
      setTimeout(() => {
        wellSectionRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleDeleteWell = async (wellId) => {
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

      const response = await axios.delete(`${baseUrl}/api/leases.php`, {
        data: { LeaseID: lease.LeaseID, Wells: [{ UniqID: wellId }] },
      });

      if (response.status === 200) {
        // Update the form data state to remove the deleted well
        setFormData({
          ...formData,
          Wells: formData.Wells.filter((well) => well.UniqID !== wellId),
        });
      } else {
        console.error("Error deleting well:", response.data.message);
        // Display an error message to the user
      }
    } catch (error) {
      console.error("Error deleting well:", error);
      // Display an error message to the user
    }
  };

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

  const handleAddTank = () => {
    setFormData({
      ...formData,
      Tanks: [
        ...formData.Tanks,
        {
          UniqID: "",
          LeaseID: lease.LeaseID,
          TankID: "",
          Size: "",
          BBLSperInch: "",
          Active: "Y",
          TankType: "T",
          GasCoeff: "",
          ExcludeDrawsFromProd: "N",
          WPTankNum: "",
        },
      ],
    });
    setTimeout(() => {
      tankSectionRef.current.scrollTop = tankSectionRef.current.scrollHeight;
    }, 100);
  };

  const handleDeleteTank = async (tankId) => {
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

      const response = await axios.delete(`${baseUrl}/api/leases.php`, {
        data: { LeaseID: lease.LeaseID, Tanks: [{ UniqID: tankId }] },
      });

      if (response.status === 200) {
        // Update the form data state to remove the deleted tank
        setFormData({
          ...formData,
          Tanks: formData.Tanks.filter((tank) => tank.UniqID !== tankId),
        });
      } else {
        console.error("Error deleting tank:", response.data.message);
        // Display an error message to the user
      }
    } catch (error) {
      console.error("Error deleting tank:", error);
      // Display an error message to the user
    }
  };

  const handleAddWell = () => {
    setFormData({
      ...formData,
      Wells: [
        ...formData.Wells,
        {
          UniqID: "",
          LeaseID: lease.LeaseID,
          WellID: "",
          Active: "Y",
          PropertyNum: "",
          AllocPct: "",
        },
      ],
    });
    setTimeout(() => {
      wellSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(e, { wells, tanks });
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
      <div
        className={`relative bg-transparent w-full max-w-3xl mx-auto p-6 rounded-lg ${
          theme === "light" ? "bg-white" : "bg-gray-700"
        }`}
        style={{ maxHeight: "800px", overflowY: "auto" }}
      >
        {/* <div
          className={`rounded-lg shadow-lg overflow-hidden transform transition-all ${
            theme === "light" ? "bg-white" : "bg-gray-700"
          }`}
        > */}
        <div
          className={`relative ${
            theme === "light" ? "bg-white" : "bg-gray-700"
          }`}
        >
          <form
            onSubmit={(e) => handleSubmit(e, tanks, wells)}
            className={`max-w-3xl mx-auto p-8 shadow-lg rounded-lg ${
              theme === "light" ? "bg-white" : "bg-gray-700"
            }`}
          >
            <div
              className={`flex justify-between items-center border-b pb-4 mb-6 ${
                theme === "light"
                  ? "text-gray-700 border-gray-300"
                  : "text-white border-gray-600"
              }`}
            >
              <h3
                className={`text-3xl font-semibold ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                Edit Lease
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-red-500 hover:text-red-700 focus:outline-none"
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>

            <div className="flex space-x-4 mb-8">
              {["basic", "additional", "tanks", "wells"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg focus:outline-none ${
                    activeTab === tab
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-gray-700"
                  } transition duration-150`}
                >
                  {tab === "basic"
                    ? "Basic Info"
                    : tab === "additional"
                    ? "Additional Info"
                    : tab === "tanks"
                    ? "Tanks"
                    : "Wells"}
                </button>
              ))}
            </div>

            {activeTab === "basic" && (
              <div className="grid grid-cols-2 gap-6">
                {/* Lease Name */}
                <div>
                  <label
                    htmlFor="LeaseName"
                    className={`block text-sm font-medium ${
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
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150`}
                  />
                </div>

                {/* Pumper */}
                <div>
                  <label
                    htmlFor="PumperID"
                    className={`block text-sm font-medium ${
                      theme === "light" ? "text-gray-700" : "text-white"
                    }`}
                  >
                    Pumper
                  </label>
                  <select
                    name="PumperID"
                    value={formData.PumperID}
                    onChange={(e) =>
                      setFormData({ ...formData, PumperID: e.target.value })
                    }
                    className={`mt-1 form-select block w-full px-3 py-2 ${
                      theme === "light"
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150`}
                  >
                    {pumperOptions.map((pumper) => (
                      <option key={pumper.UserID} value={pumper.UserID}>
                        {pumper.FullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Relief */}
                <div>
                  <label
                    htmlFor="ReliefID"
                    className={`block text-sm font-medium ${
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
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150`}
                  >
                    <option value="">
                      {formData.ReliefID ? "Remove Relief" : "Select Relief"}
                    </option>
                    {reliefOptions.map((relief) => (
                      <option key={relief.UserID} value={relief.UserID}>
                        {relief.FullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Active */}
                <div>
                  <label
                    htmlFor="Active"
                    className={`block text-sm font-medium ${
                      theme === "light" ? "text-gray-700" : "text-white"
                    }`}
                  >
                    Active
                  </label>
                  <select
                    name="Active"
                    value={formData.Active || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, Active: e.target.value })
                    }
                    className={`mt-1 form-select block w-full px-3 py-2 ${
                      theme === "light"
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150`}
                  >
                    <option value="Y">Yes</option>
                    <option value="N">No</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === "additional" && (
              <div className="grid grid-cols-2 gap-6">
                {/* Lease ID */}
                <div>
                  <label
                    htmlFor="LeaseID"
                    className={`block text-sm font-medium ${
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
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150`}
                  />
                </div>

                {/* Tags */}
                {[1, 2, 3, 4].map((tagNum) => (
                  <div key={tagNum}>
                    <label
                      htmlFor={`Tag${tagNum}`}
                      className={`block text-sm font-medium ${
                        theme === "light" ? "text-gray-700" : "text-white"
                      }`}
                    >
                      Tag {tagNum}
                    </label>
                    <select
                      name={`Tag${tagNum}`}
                      value={formData[`Tag${tagNum}`] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [`Tag${tagNum}`]: e.target.value,
                        })
                      }
                      className={`mt-1 form-select block w-full px-3 py-2 ${
                        theme === "light"
                          ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                          : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                      } transition duration-150`}
                    >
                      <option value="">
                        {formData[`Tag${tagNum}`] ? "Remove Tag" : "Select Tag"}
                      </option>
                      {tagOptions.map((tag) => (
                        <option key={tag.TagID} value={tag.TagID}>
                          {tag.TagID} - {tag.TagDesc}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

                {/* Purchaser */}
                <div>
                  <label
                    htmlFor="Purchaser"
                    className={`block text-sm font-medium ${
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
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150`}
                  >
                    <option value="">
                      {formData.Purchaser
                        ? "Remove Purchaser"
                        : "Select Purchaser"}
                    </option>
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

                {/* Purchaser Lease No */}
                <div>
                  <label
                    htmlFor="PurchaserLeaseNo"
                    className={`block text-sm font-medium ${
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
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150`}
                  />
                </div>

                {/* Max Inj */}
                <div>
                  <label
                    htmlFor="MaxInj"
                    className={`block text-sm font-medium ${
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
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150`}
                  />
                </div>

                {/* Max Pressure */}
                <div>
                  <label
                    htmlFor="MaxPressure"
                    className={`block text-sm font-medium ${
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
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150`}
                  />
                </div>

                {/* External Property # */}
                <div>
                  <label
                    htmlFor="PropertyNum"
                    className={`block text-sm font-medium ${
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
                        ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                        : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                    } transition duration-150`}
                  />
                </div>
              </div>
            )}

            {activeTab === "tanks" && (
              <>
                <div ref={tankSectionRef} className="space-y-4">
                  {formData.Tanks.map((tank, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div
                        onClick={() => toggleExpandTank(index)}
                        className="flex justify-between items-center cursor-pointer"
                      >
                        <span className="font-semibold">
                          Tank {tank.TankID}
                        </span>
                        <FontAwesomeIcon
                          icon={
                            expandedTankIndex === index
                              ? faChevronUp
                              : faChevronDown
                          }
                        />
                      </div>
                      {expandedTankIndex === index && (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label
                              htmlFor="TankID"
                              className={`block text-sm font-medium ${
                                theme === "light"
                                  ? "text-gray-700"
                                  : "text-white"
                              }`}
                            >
                              Tank ID
                            </label>

                            <input
                              type="text"
                              placeholder="Tank ID"
                              value={tank.TankID}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  Tanks: formData.Tanks.map((t, i) =>
                                    i === index
                                      ? { ...t, TankID: e.target.value }
                                      : t
                                  ),
                                })
                              }
                              className={`mt-1 form-input block w-full px-3 py-2 ${
                                theme === "light"
                                  ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                                  : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                              } transition duration-150`}
                              required
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="size"
                              className={`block text-sm font-medium ${
                                theme === "light"
                                  ? "text-gray-700"
                                  : "text-white"
                              }`}
                            >
                              Size
                            </label>

                            <input
                              type="number"
                              placeholder="Size"
                              value={tank.Size || 0}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  Tanks: formData.Tanks.map((t, i) =>
                                    i === index
                                      ? { ...t, Size: e.target.value }
                                      : t
                                  ),
                                })
                              }
                              className={`mt-1 form-input block w-full px-3 py-2 ${
                                theme === "light"
                                  ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                                  : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                              } transition duration-150`}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="BBL"
                              className={`block text-sm font-medium ${
                                theme === "light"
                                  ? "text-gray-700"
                                  : "text-white"
                              }`}
                            >
                              BBLSperInch
                            </label>

                            <input
                              type="number"
                              placeholder="BBLS per Inch"
                              value={tank.BBLSperInch}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  Tanks: formData.Tanks.map((t, i) =>
                                    i === index
                                      ? { ...t, BBLSperInch: e.target.value }
                                      : t
                                  ),
                                })
                              }
                              className={`mt-1 form-input block w-full px-3 py-2 ${
                                theme === "light"
                                  ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                                  : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                              } transition duration-150`}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="Type"
                              className={`block text-sm font-medium ${
                                theme === "light"
                                  ? "text-gray-700"
                                  : "text-white"
                              }`}
                            >
                              Type
                            </label>

                            <select
                              value={tank.TankType}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  Tanks: formData.Tanks.map((t, i) =>
                                    i === index
                                      ? { ...t, TankType: e.target.value }
                                      : t
                                  ),
                                })
                              }
                              className={`mt-1 form-input block w-full px-3 py-2 ${
                                theme === "light"
                                  ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                                  : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                              } transition duration-150`}
                            >
                              <option value="F">F</option>
                              <option value="T">T</option>
                              <option value="W">W</option>
                            </select>
                          </div>
                          <div>
                            <label
                              htmlFor="TankNum"
                              className={`block text-sm font-medium ${
                                theme === "light"
                                  ? "text-gray-700"
                                  : "text-white"
                              }`}
                            >
                              Tank Num
                            </label>

                            <input
                              type="text"
                              placeholder="WP Tank Num"
                              value={tank.WPTankNum}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  Tanks: formData.Tanks.map((t, i) =>
                                    i === index
                                      ? { ...t, WPTankNum: e.target.value }
                                      : t
                                  ),
                                })
                              }
                              className={`mt-1 form-input block w-full px-3 py-2 ${
                                theme === "light"
                                  ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                                  : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                              } transition duration-150`}
                            />
                          </div>
                          <div className="col-span-2">
                            <label
                              htmlFor="active"
                              className={`block text-sm font-medium ${
                                theme === "light"
                                  ? "text-gray-700"
                                  : "text-white"
                              }`}
                            >
                              Active
                            </label>
                            <select
                              value={tank.Active}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  Tanks: formData.Tanks.map((t, i) =>
                                    i === index
                                      ? { ...t, Active: e.target.value }
                                      : t
                                  ),
                                })
                              }
                              className={`mt-1 form-input block w-full px-3 py-2 ${
                                theme === "light"
                                  ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                                  : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                              } transition duration-150`}
                              required
                            >
                              <option value="Y">Active</option>
                              <option value="N">Inactive</option>
                            </select>
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleDeleteTank(tank.UniqID)}
                              className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "wells" && (
              <div ref={wellSectionRef} className="space-y-4 mt-6">
                {formData.Wells?.map((well, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div
                      onClick={() => toggleExpandWell(index)}
                      className="flex justify-between items-center cursor-pointer"
                    >
                      <span className="font-semibold">Well {well.WellID}</span>
                      <FontAwesomeIcon
                        icon={
                          expandedWellIndex === index
                            ? faChevronUp
                            : faChevronDown
                        }
                      />
                    </div>
                    {expandedWellIndex === index && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label
                            htmlFor="WellID"
                            className={`block text-sm font-medium ${
                              theme === "light" ? "text-gray-700" : "text-white"
                            }`}
                          >
                            Well ID
                          </label>
                          <input
                            type="text"
                            placeholder="Well ID"
                            value={well.WellID}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                Wells: formData.Wells.map((w, i) =>
                                  i === index
                                    ? { ...w, WellID: e.target.value }
                                    : w
                                ),
                              })
                            }
                            className={`mt-1 form-input block w-full px-3 py-2 ${
                              theme === "light"
                                ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                                : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                            } transition duration-150`}
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="AllocPct"
                            className={`block text-sm font-medium ${
                              theme === "light" ? "text-gray-700" : "text-white"
                            }`}
                          >
                            Allocation Percentage
                          </label>
                          <input
                            type="number"
                            placeholder="Allocation Percentage"
                            value={well.AllocPct}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                Wells: formData.Wells.map((w, i) =>
                                  i === index
                                    ? { ...w, AllocPct: e.target.value }
                                    : w
                                ),
                              })
                            }
                            className={`mt-1 form-input block w-full px-3 py-2 ${
                              theme === "light"
                                ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                                : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                            } transition duration-150`}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="Active"
                            className={`block text-sm font-medium ${
                              theme === "light" ? "text-gray-700" : "text-white"
                            }`}
                          >
                            Active
                          </label>
                          <select
                            value={well.Active}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                Wells: formData.Wells.map((w, i) =>
                                  i === index
                                    ? { ...w, Active: e.target.value }
                                    : w
                                ),
                              })
                            }
                            className={`mt-1 form-input block w-full px-3 py-2 ${
                              theme === "light"
                                ? "border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300"
                                : "border border-gray-600 rounded-md shadow-sm focus:outline-none focus:border-blue-300 bg-gray-700 text-white"
                            } transition duration-150`}
                            required
                          >
                            <option value="Y">Active</option>
                            <option value="N">Inactive</option>
                          </select>
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteWell(well.UniqID)}
                            className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div
              className={`sticky bottom-0 p-4 ${
                theme === "light"
                  ? "bg-white bg-opacity-90"
                  : "bg-gray-700 bg-opacity-90"
              }`}
            >
              <div className="flex justify-end space-x-4">
                {activeTab === "wells" && (
                  <button
                    type="button"
                    onClick={handleAddWell}
                    className="p-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  >
                    <FontAwesomeIcon icon={faPlus} /> Add Well
                  </button>
                )}
                {activeTab === "tanks" && (
                  <button
                    type="button"
                    onClick={handleAddTank}
                    className="p-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  >
                    <FontAwesomeIcon icon={faPlus} /> Add Tank
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                  }}
                  className="p-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
          {/* </div> */}
        </div>
      </div>
    </div>
  );
};

export default Leases;
