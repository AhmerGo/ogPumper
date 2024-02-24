import React, { createContext, useContext, useState } from "react";

const TicketsContext = createContext();

export const useTickets = () => useContext(TicketsContext);

const defaultTickets = [
  {
    id: 123125125,
    ticketDate: "2023-01-01",
    lease: "Lease A",
    well: "Well 1",
    ticketType: "Type 1",
    ticketNumber: "001",
    items: [],
  },
  {
    id: 152123534,
    ticketDate: "2023-01-02",
    lease: "Lease B",
    well: "Well 2",
    ticketType: "Type 2",
    ticketNumber: "002",
    items: [],
  },
  {
    id: 246512462,
    ticketDate: "2023-01-03",
    lease: "Lease C",
    well: "Well 3",
    ticketType: "Type 3",
    ticketNumber: "003",
    items: [],
  },
  {
    id: 246512462,
    ticketDate: "2023-01-03",
    lease: "Lease C",
    well: "Well 3",
    ticketType: "Type 3",
    ticketNumber: "003",
    items: [],
  },
];

export const TicketsProvider = ({ children }) => {
  const [tickets, setTickets] = useState(defaultTickets);

  const addTicket = (newTicket) => {
    setTickets((prevTickets) => [
      ...prevTickets,
      { ...newTicket, id: Date.now() },
    ]);
  };

  return (
    <TicketsContext.Provider value={{ tickets, addTicket }}>
      {children}
    </TicketsContext.Provider>
  );
};
