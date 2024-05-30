import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import * as serviceWorker from "./serviceWorker";
import ConfirmModal from "./components/ConfirmModal";

const root = ReactDOM.createRoot(document.getElementById("root"));
const RootComponent = () => {
  const [showReloadModal, setShowReloadModal] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setShowReloadModal(true);
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const handleReloadConfirm = () => {
    window.location.reload();
    setShowReloadModal(false);
  };

  const handleReloadCancel = () => {
    setShowReloadModal(false);
  };

  return (
    <React.StrictMode>
      <Router>
        <App />
        <ConfirmModal
          show={showReloadModal}
          onConfirm={handleReloadConfirm}
          onCancel={handleReloadCancel}
          message="You are back online. Reload the page to see the latest updates."
        />
      </Router>
    </React.StrictMode>
  );
};

root.render(<RootComponent />);

serviceWorker.register();
