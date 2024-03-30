import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInPage from "./components/SignInPage";
import HomePage from "./components/HomePage";
import CreateFieldTicket from "./components/CreateFieldTicket";
import Layout from "./components/Layout";
import "./index.css";
import FieldTicketEntry from "./components/FieldTicketEntry";
import { ThemeProvider } from "./components/ThemeContext";
import Summary from "./components/Summary";
import { UserProvider } from "./components/UserContext";

function App() {
  return (
    <Router>
      <UserProvider>
        <ThemeProvider>
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
        </ThemeProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
