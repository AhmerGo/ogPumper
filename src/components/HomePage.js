import React from "react";

function HomePage() {
  const navItems = [
    {
      name: "Current Production & Injection",
      link: "#current-production-injection",
    },
    { name: "Inventory by Lease", link: "#inventory-by-lease" },
    { name: "Reports", link: "#reports" },
    { name: "Well Tests", link: "#well-tests" },
    { name: "Inventory by Tank", link: "#inventory-by-tank" },
    { name: "Notes", link: "#notes" },
    { name: "Wells Down", link: "#wells-down" },
    { name: "Gauge Entry", link: "#gauge-entry" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-500 via-blue-600 to-teal-500">
      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-5xl lg:text-6xl font-extrabold text-white mb-10 text-center">
          Hi, Admin!
        </h1>
        <div className="grid grid-cols-2 gap-6">
          {navItems.map((item, index) => (
            <a
              href={item.link}
              key={item.name}
              className={`flex flex-col justify-between p-6 bg-white bg-opacity-90 rounded-lg border border-gray-200 shadow-lg hover:shadow-xl transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-105 ${
                index === 0 || index === navItems.length - 1
                  ? "col-span-2 text-center"
                  : "text-center"
              }`}
            >
              <h5 className="text-lg font-bold text-gray-800 hover:text-blue-600">
                {item.name}
              </h5>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
