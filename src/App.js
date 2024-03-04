import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInPage from "./components/SignInPage";
import HomePage from "./components/HomePage";
import CreateFieldTicket from "./components/CreateFieldTicket"; // Assuming you've added this
import Layout from "./components/Layout";
import "./index.css";
import FieldTicketEntry from "./components/FieldTicketEntry";
import { TicketsProvider } from "./components/TicketsContext";
import Summary from "./components/Summary";

function App() {
  return (
    <Router>
      <TicketsProvider>
        <Routes>
          <Route path="/" element={<SignInPage />} />
          <Route
            path="/home"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />
          <Route
            path="/create-field-ticket"
            element={
              <Layout>
                <CreateFieldTicket />
              </Layout>
            }
          />
          <Route
            path="/view-field-ticket"
            element={
              <Layout>
                <Summary />
              </Layout>
            }
          />

          <Route
            path="/field-ticket-entry"
            element={
              <Layout>
                <FieldTicketEntry />
              </Layout>
            }
          />
          {/* Add more routes as needed */}
        </Routes>
      </TicketsProvider>
    </Router>
  );
}

export default App;
