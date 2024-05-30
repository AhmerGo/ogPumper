import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import * as serviceWorker from "./serviceWorker";
import ConfirmModal from "./components//ConfirmModal";

const Root = () => {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "UPDATE_AVAILABLE") {
        setMessage(event.data.message);
        setShowModal(true);
      }
    });
  }

  const handleConfirm = () => {
    window.location.reload();
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <React.StrictMode>
      {showModal && (
        <ConfirmModal
          message={message}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      <Router>
        <App />
      </Router>
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root />);

serviceWorker.register();
