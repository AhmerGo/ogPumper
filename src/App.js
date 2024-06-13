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
import JobForm from "./components/JobTypeForm";
import Details from "./components/Details";
import MasterList from "./components/ItemMasterList";
import { UserProvider } from "./components/UserContext";
import Admin from "./components/admin";
function App() {
  return (
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
            path="/create-field-ticket/:highestTicketNumber"
            element={
              <Layout>
                <CreateFieldTicket />{" "}
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
          <Route
            path="/job-form"
            element={
              <Layout>
                <JobForm />
              </Layout>
            }
          />
          <Route
            path="/profile-details"
            element={
              <Layout>
                <Details />
              </Layout>
            }
          />
          <Route
            path="/admin-panel"
            element={
              <Layout>
                <Admin />
              </Layout>
            }
          />
        </Routes>
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;
