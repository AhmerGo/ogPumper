import React, { useState, useEffect } from "react";
import { useSpring, animated } from "react-spring";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faFileContract,
  faBriefcase,
  faList,
  faCalculator,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import { useTheme } from "ogcommon";
import JobListPage from "./JobTypeForm";
import ControlUsers from "./ControlUsers";
import MasterList from "./ItemMasterList";
import { Leases } from "ogcommon";
import { baseUrl } from "./config";

Modal.setAppElement("#root");

const Admin = () => {
  const { theme } = useTheme();
  const [activePanel, setActivePanel] = useState("jobs");
  const [activeSubPanel, setActiveSubPanel] = useState("jobList");

  const panelAnimation = useSpring({
    to: { opacity: 1 },
    from: { opacity: 0 },
    config: { tension: 220, friction: 20 },
  });

  // Tailwind theme helpers
  const variant = (dark, light) => (theme === "dark" ? dark : light);
  const sidePanelClass = variant(
    "bg-gray-900 text-white",
    "bg-white text-gray-900"
  );
  const sidePanelHoverClass = variant("hover:bg-gray-700", "hover:bg-gray-100");
  const activePanelClass = variant(
    "bg-gray-700 text-white",
    "bg-gray-200 text-black"
  );

  const handleChangePanel = (panel, subPanel = "") => {
    setActivePanel(panel);
    setActiveSubPanel(subPanel);
  };

  useEffect(() => {
    setActivePanel("jobs");
    setActiveSubPanel("jobList");
  }, []);

  return (
    <div
      className={`min-h-screen flex ${variant("bg-gray-900", "bg-gray-50")}`}
    >
      {/* Side Panel */}
      <div className={`w-64 ${sidePanelClass} fixed h-full shadow-2xl`}>
        <animated.div style={panelAnimation} className="p-6">
          <h1 className="text-2xl font-extrabold border-b-4 border-indigo-500 pb-3 mb-8">
            Control Panel
          </h1>

          <nav className="space-y-2">
            {/* JOBS */}
            <button
              className={`w-full px-6 py-4 rounded-lg flex items-center gap-3 transition-colors duration-200 ${sidePanelHoverClass} ${
                activePanel === "jobs" ? activePanelClass : ""
              }`}
              onClick={() => handleChangePanel("jobs", "jobList")}
            >
              <FontAwesomeIcon
                icon={faBriefcase}
                className="text-xl shrink-0"
              />
              <span className="text-lg font-medium">Jobs</span>
            </button>

            {/* Job sub‑nav */}
            {activePanel === "jobs" && (
              <div className="pl-8 space-y-2">
                <button
                  className={`w-full px-6 py-4 rounded-lg flex items-center gap-3 transition-colors duration-200 ${sidePanelHoverClass} ${
                    activeSubPanel === "jobList" ? activePanelClass : ""
                  }`}
                  onClick={() => handleChangePanel("jobs", "jobList")}
                >
                  <FontAwesomeIcon icon={faList} className="text-lg shrink-0" />
                  <span className="text-md">Job List</span>
                </button>

                <button
                  className={`w-full px-6 py-4 rounded-lg flex items-center gap-3 transition-colors duration-200 ${sidePanelHoverClass} ${
                    activeSubPanel === "masterList" ? activePanelClass : ""
                  }`}
                  onClick={() => handleChangePanel("jobs", "masterList")}
                >
                  <FontAwesomeIcon icon={faList} className="text-lg shrink-0" />
                  <span className="text-md">Master List</span>
                </button>
              </div>
            )}

            {/* LEASES */}
            <button
              className={`w-full px-6 py-4 rounded-lg flex items-center gap-3 transition-colors duration-200 ${sidePanelHoverClass} ${
                activePanel === "leases" ? activePanelClass : ""
              }`}
              onClick={() => handleChangePanel("leases", "leaseList")}
            >
              <FontAwesomeIcon
                icon={faFileContract}
                className="text-xl shrink-0"
              />
              <span className="text-lg font-medium">Leases</span>
            </button>

            {activePanel === "leases" && (
              <div className="pl-8 space-y-2">
                <button
                  className={`w-full px-6 py-4 rounded-lg flex items-center gap-3 transition-colors duration-200 ${sidePanelHoverClass} ${
                    activeSubPanel === "leaseList" ? activePanelClass : ""
                  }`}
                  onClick={() => handleChangePanel("leases", "leaseList")}
                >
                  <FontAwesomeIcon icon={faList} className="text-lg shrink-0" />
                  <span className="text-md">Lease List</span>
                </button>
              </div>
            )}

            {/* USERS */}
            <button
              className={`w-full px-6 py-4 rounded-lg flex items-center gap-3 transition-colors duration-200 ${sidePanelHoverClass} ${
                activePanel === "users" ? activePanelClass : ""
              }`}
              onClick={() => handleChangePanel("users", "userList")}
            >
              <FontAwesomeIcon icon={faUsers} className="text-xl shrink-0" />
              <span className="text-lg font-medium">Users</span>
            </button>

            {activePanel === "users" && (
              <div className="pl-8 space-y-2">
                <button
                  className={`w-full px-6 py-4 rounded-lg flex items-center gap-3 transition-colors duration-200 ${sidePanelHoverClass} ${
                    activeSubPanel === "userList" ? activePanelClass : ""
                  }`}
                  onClick={() => handleChangePanel("users", "userList")}
                >
                  <FontAwesomeIcon icon={faList} className="text-lg shrink-0" />
                  <span className="text-md">User List</span>
                </button>
              </div>
            )}
          </nav>
        </animated.div>
      </div>

      {/* Main Content */}
      <div className="flex-grow pl-72 p-10 overflow-y-auto">
        <animated.div style={panelAnimation}>
          {activePanel === "jobs" && activeSubPanel === "jobList" && (
            <JobListPage />
          )}
          {activePanel === "jobs" && activeSubPanel === "masterList" && (
            <MasterList />
          )}
          {activePanel === "leases" && activeSubPanel === "leaseList" && (
            <Leases baseUrl={baseUrl} />
          )}
          {activePanel === "users" && activeSubPanel === "userList" && (
            <ControlUsers />
          )}
        </animated.div>
      </div>
    </div>
  );
};

export default Admin;
