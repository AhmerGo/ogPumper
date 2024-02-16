import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInPage from "./components/SignInPage";
import HomePage from "./components/HomePage";
import Layout from "./components/Layout"; // Import Layout component
import "./index.css";

function App() {
  return (
    <Routes>
      {/* Direct route for SignInPage, without Layout */}
      <Route path="/" element={<SignInPage />} />

      {/* Nested routes within Layout for pages requiring the header/nav */}
      <Route
        path="/home"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />
      {/* You can add more protected routes here, wrapping them inside <Layout> as well */}
    </Routes>
  );
}

export default App;
