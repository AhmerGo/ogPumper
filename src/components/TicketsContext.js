import React, { createContext, useContext, useState } from "react";

const TicketsContext = createContext();

export const useTickets = () => useContext(TicketsContext);

const defaultItems = [
  { id: 1, name: "ACID PUMP CHARGE", quantity: 0, unit: "", notes: "" },
  { id: 2, name: "ACID (10%)", quantity: 0, unit: "", notes: "" },
  { id: 3, name: "WATER", quantity: 0, unit: "gal", notes: "" },
  { id: 4, name: "WATER TRUCK", quantity: 0, unit: "", notes: "" },
  {
    id: 5,
    name: "OPERATOR TRUCK MILEAGE",
    quantity: 0,
    unit: "miles",
    notes: "",
  },
];

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

const shuffleArray = (array) => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

const addRandomItemsToTickets = (tickets) => {
  const shuffledItems = shuffleArray([...defaultItems]); // Clone and shuffle items

  return tickets.map((ticket) => ({
    ...ticket,
    items: shuffledItems, // Assign the shuffled list of items to each ticket
  }));
};

const defaultTicketsWithItems = addRandomItemsToTickets(defaultTickets);

const generateRandomTicket = () => {
  return {
    id: Math.floor(Math.random() * 10000), // Generates a random ID
    ticketDate: new Date().toISOString().split("T")[0], // Today's date
    lease: `Lease ${Math.ceil(Math.random() * 10)}`, // Random lease number
    well: `Well ${Math.ceil(Math.random() * 5)}`, // Random well number
    ticketType: `Type ${Math.ceil(Math.random() * 3)}`, // Random ticket type
    ticketNumber: `${Math.floor(100 + Math.random() * 900)}`, // Random ticket number
    items: [
      // You could add random items here if needed
    ],
  };
};

export const TicketsProvider = ({ children }) => {
  const [tickets, setTickets] = useState(defaultTicketsWithItems);

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
