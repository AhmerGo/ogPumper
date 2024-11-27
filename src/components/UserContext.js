// UserContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProviderr = ({ children }) => {
  const [userRole, setUserRole] = useState("");
  const [userID, setUserID] = useState(null);
  const [companyName, setCompanyName] = useState(null);
  const [jobRole, setJobRole] = useState("");

  useEffect(() => {
    const storedUserRole = localStorage.getItem("userRole");
    if (storedUserRole) {
      setUserRole(storedUserRole);
    }

    const storedJobRole = localStorage.getItem("jobRole");
    if (storedJobRole) {
      setJobRole(storedJobRole);
    }

    const storedUserID = localStorage.getItem("userID");
    if (storedUserID) {
      setUserID(storedUserID);
    }

    const storedCompanyName = localStorage.getItem("companyName");
    if (storedCompanyName) {
      setCompanyName(storedCompanyName);
    }
  }, []);

  const setUser = (role, id, companyName, jobRole) => {
    setUserRole(role);
    setUserID(id);
    setCompanyName(companyName);
    setJobRole(jobRole);

    localStorage.setItem("userRole", role);
    localStorage.setItem("userID", id);
    localStorage.setItem("companyName", companyName);
    localStorage.setItem("jobRole", jobRole);
  };

  return (
    <UserContext.Provider
      value={{ userRole, userID, companyName, jobRole, setUser }}
    >
      {children}
    </UserContext.Provider>
  );
};
