// Layout.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import { useTheme } from "./ThemeContext";

function Layout({ children }) {
  let navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  function handleSignOut() {
    console.log("User signed out");
    navigate("/");
  }

  const navBarAnimation = useSpring({
    backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
    color: theme === "dark" ? "#d1d5db" : "#1f2937",
    config: { mass: 1, tension: 200, friction: 20 },
  });

  const toggleButtonAnimation = useSpring({
    backgroundColor: theme === "dark" ? "#4b5563" : "#e5e7eb",
    color: theme === "dark" ? "#f9fafb" : "#374151",
    transform: `rotate(${theme === "dark" ? "0deg" : "180deg"})`,
    config: { mass: 1, tension: 300, friction: 20 },
  });

  const signOutButtonAnimation = useSpring({
    backgroundColor: theme === "dark" ? "#374151" : "#e5e7eb",
    color: theme === "dark" ? "#f9fafb" : "#374151",
    config: { mass: 1, tension: 200, friction: 20 },
  });

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <animated.nav
        style={navBarAnimation}
        className="flex justify-between items-center px-4 py-2 lg:px-16 lg:py-4 shadow-lg transition-colors duration-500"
        aria-label="Navigation bar"
      >
        <h1
          className="text-2xl lg:text-3xl font-extrabold cursor-pointer transition duration-500 hover:text-indigo-500 dark:hover:text-indigo-400 text-shadow"
          onClick={() => navigate("/home")}
        >
          OgFieldDemo
        </h1>
        <div className="flex items-center">
          <animated.button
            style={toggleButtonAnimation}
            onClick={toggleTheme}
            className="mr-2 lg:mr-4 flex items-center justify-center w-8 h-8 lg:w-12 lg:h-12 rounded-full shadow-inner cursor-pointer transition-all duration-500 relative overflow-hidden"
            aria-label="Toggle Dark Mode"
          >
            <span className="material-icons-outlined">
              {theme === "dark" ? "dark_mode" : "wb_sunny"}
            </span>
            <span
              className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              aria-hidden="true"
            ></span>
          </animated.button>
          <animated.button
            style={signOutButtonAnimation}
            onClick={handleSignOut}
            className="flex items-center justify-center px-2 py-1 lg:px-3 lg:py-2 rounded-md bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-gray-500 transition duration-300"
          >
            <span className="material-icons-outlined text-lg lg:mr-2">
              exit_to_app
            </span>
            <span className="hidden lg:inline font-medium">Sign Out</span>
          </animated.button>
        </div>
      </animated.nav>
      <main className="flex-grow">{children}</main>
      {/* Your Footer Component */}
    </div>
  );
}

export default Layout;
