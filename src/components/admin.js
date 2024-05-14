import React, { useState } from "react";
import { useSpring, animated } from "react-spring";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faFileContract,
  faBriefcase,
  faTachometerAlt,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import axios from "axios";
import { useTheme } from "./ThemeContext";
import JobListPage from "./JobTypeForm";
import Leases from "./Leases";
import ControlUsers from "./ControlUsers"; // Make sure this imports UsersPage component correctly

Modal.setAppElement("#root");

const Admin = () => {
  const { theme } = useTheme();
  const [activePanel, setActivePanel] = useState("jobs");

  const panelAnimation = useSpring({
    to: { opacity: 1 },
    from: { opacity: 0 },
    config: { tension: 220, friction: 20 },
  });

  const sidePanelClass =
    theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  const sidePanelHoverClass =
    theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100";
  const activePanelClass =
    theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-200 text-black";

  const handleChangePanel = (panel) => {
    setActivePanel(panel);
  };

  return (
    <div
      className={`min-h-screen flex ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Side Panel Container */}
      <div className={`w-64 ${sidePanelClass} fixed h-full shadow-2xl`}>
        <animated.div style={{ ...panelAnimation }} className="p-6">
          {/* Control Panel Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold border-b-4 border-indigo-120 pb-3">
              Control Panel
            </h1>
          </div>
          <ul className="space-y-2">
            {["jobs", "leases", "users"].map((item, index) => (
              <li
                key={index}
                className={`px-6 py-4 rounded-lg flex items-center gap-3 cursor-pointer transition-colors duration-200 ${sidePanelHoverClass} ${
                  activePanel === item ? activePanelClass : ""
                }`}
                onClick={() => handleChangePanel(item)}
              >
                <FontAwesomeIcon
                  icon={
                    item === "jobs"
                      ? faBriefcase
                      : item === "leases"
                      ? faFileContract
                      : item === "users"
                      ? faUsers
                      : faTachometerAlt // Assuming this is for 'dashboard' if included.
                  }
                  className="text-xl"
                />
                <span className="text-lg font-medium">
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </span>
              </li>
            ))}
          </ul>
        </animated.div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow pl-72 p-10 overflow-y-auto">
        <animated.div style={{ ...panelAnimation }}>
          {activePanel === "jobs" ? (
            <JobListPage />
          ) : activePanel === "leases" ? (
            <Leases />
          ) : (
            <ControlUsers />
          )}
        </animated.div>
      </div>
    </div>
  );
};

export default Admin;
