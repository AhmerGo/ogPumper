// components/Footer.js
import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4">
      <div className="container mx-auto text-center">
        {/* Contact Information */}
        <div className="mb-4">
          <p>Phone: 325-261-0394</p>
          <p>Email: support@ogPumper.com</p>
        </div>

        {/* Company Name & Address */}
        <div className="text-sm">
          ogEndeavors, LLC, PO Box 7091, Abilene, TX 79608
        </div>
      </div>
    </footer>
  );
}

export default Footer;
