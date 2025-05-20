/* -----------------------------------------------------------------
 * App.jsx – root of OG Field Ticket front-end
 * ----------------------------------------------------------------- */
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import SignInPage from "./components/SignInPage";
import HomePage from "./components/HomePage";
import CreateFieldTicket from "./components/CreateFieldTicket";
import FieldTicketEntry from "./components/FieldTicketEntry";
import Summary from "./components/Summary";
import JobForm from "./components/JobTypeForm";
import MasterList from "./components/ItemMasterList";
import TicketGrid from "./components/TicketGrid";
import Admin from "./components/admin";
import Layout from "./components/Layout";

import { Details, UserProvider, ThemeProvider, RequireCreds } from "ogcommon";

import "./index.css";

function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <Routes>
          {/* ───────────── Public ───────────── */}
          <Route path="/" element={<SignInPage />} />

          {/* ─────────── Protected ─────────── */}
          <Route element={<RequireCreds />}>
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
                  <CreateFieldTicket />
                </Layout>
              }
            />
            <Route
              path="/ticketGrid"
              element={
                <Layout>
                  <TicketGrid />
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
          </Route>
        </Routes>
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;
