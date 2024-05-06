import React, { useState } from "react";
import { useSpring, animated } from "react-spring";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faFileContract,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import axios from "axios";
import { useTheme } from "./ThemeContext";
import JobListPage from "./JobTypeForm";
import Leases from "./Leases";
Modal.setAppElement("#root");

const Admin = () => {
  const { theme } = useTheme();
  const [activePanel, setActivePanel] = useState("jobs");

  const panelAnimation = useSpring({
    to: { opacity: 1 },
    from: { opacity: 0 },
    config: { tension: 220, friction: 20 },
  });

  // Determine background color based on theme
  const sidePanelClass = theme === "dark" ? "bg-gray-700" : "bg-gray-200";
  const sidePanelHoverClass =
    theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-300";
  const activePanelClass = theme === "dark" ? "bg-gray-500" : "bg-gray-400";

  const handleChangePanel = (panel) => {
    setActivePanel(panel);
  };

  return (
    <div
      className={`min-h-screen flex ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800"
      }`}
    >
      {/* Side Panel */}
      <animated.div
        style={{ ...panelAnimation, marginTop: "20px" }} // Lower the side panel slightly
        className={`w-64 ${sidePanelClass}`}
      >
        <ul className="space-y-2 text-lg font-semibold">
          {["jobs", "leases", "users"].map((item, index) => (
            <li
              key={index}
              className={`px-6 py-3 flex items-center gap-2 cursor-pointer ${sidePanelHoverClass}
                          ${activePanel === item ? activePanelClass : ""}`}
              onClick={() => handleChangePanel(item)}
            >
              <FontAwesomeIcon
                icon={
                  item === "jobs"
                    ? faBriefcase
                    : item === "leases"
                    ? faFileContract
                    : faUsers
                }
              />
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </li>
          ))}
        </ul>
      </animated.div>

      {/* Main Content Area */}
      <animated.div style={panelAnimation} className="flex-grow p-10">
        {activePanel === "jobs" ? (
          <JobListPage />
        ) : activePanel === "leases" ? (
          <Leases />
        ) : (
          <Users />
        )}
      </animated.div>
    </div>
  );
};

const Users = () => (
  <div>
    <h1 className="text-xl font-bold">User Management</h1>
    <p>
      Manage user accounts and permissions. Monitor activity and set access
      levels for different roles.
    </p>
  </div>
);

export default Admin;
