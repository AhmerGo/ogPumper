import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUser } from "./UserContext";
import {
  faMapMarkerAlt,
  faCalendarAlt,
  faBriefcase,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const TicketItem = React.memo(
  ({ ticket, index, theme, onClick, searchQuery }) => {
    const [hoverAnimation, setHoverAnimation] = useSpring(() => ({
      scale: 1,
      config: { tension: 300, friction: 10 },
    }));

    const { userRole } = useUser();
    const [year, month, day] = ticket.TicketDate.split("-");
    const localDate = new Date(year, month - 1, day);

    const formattedDate = useMemo(
      () =>
        localDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      [localDate]
    );

    const highlightText = (text) => {
      if (!searchQuery) return text;
      const regex = new RegExp(`(${searchQuery})`, "gi");
      return text.split(regex).map((part, i) =>
        i % 2 === 0 ? (
          part
        ) : (
          <mark key={i} className="bg-yellow-200 text-black">
            {part}
          </mark>
        )
      );
    };

    return (
      <animated.li
        className={`flex flex-col md:flex-row justify-between items-center p-6 ${
          index % 2 === 0
            ? theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800"
            : theme === "dark"
            ? "bg-gray-700 text-white"
            : "bg-gray-100 text-gray-800"
        } rounded-lg m-4 shadow-lg cursor-pointer`}
        style={{
          transform: hoverAnimation.scale.to((s) => `scale(${s})`),
        }}
        onMouseEnter={() => setHoverAnimation({ scale: 1.05 })}
        onMouseLeave={() => setHoverAnimation({ scale: 1 })}
        onClick={onClick}
      >
        <div className="flex-grow mb-4 md:mb-0">
          <h3 className="text-2xl md:text-3xl font-bold mb-2 text-center md:text-left">
            <Link
              to="/view-field-ticket"
              state={ticket}
              className="text-blue-500 hover:text-blue-600"
            >
              Ticket: {ticket.Ticket}
            </Link>
          </h3>
          <div className="text-gray-500 mt-2 text-lg md:text-xl">
            <div className="flex items-center justify-center md:justify-start">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="mr-2"
                fixedWidth
              />
              <>
                {ticket.WellID !== null ? (
                  <span>
                    {ticket.LeaseName} # {ticket.WellID}
                  </span>
                ) : (
                  <span>{ticket.LeaseName}</span>
                )}
              </>
            </div>
            <div className="flex items-center justify-center md:justify-start">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="mr-2"
                fixedWidth
              />
              <span> {formattedDate}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start">
              <FontAwesomeIcon icon={faBriefcase} className="mr-2" fixedWidth />
              <span> {ticket.JobDescription}</span>
            </div>

            {userRole !== "P" && (
              <div className="flex items-center justify-center md:justify-start">
                <FontAwesomeIcon icon={faUser} className="mr-2" fixedWidth />
                <span className="font-semibold">
                  {" "}
                  {ticket.UserID
                    ? ticket.UserID.charAt(0).toUpperCase() +
                      ticket.UserID.slice(1)
                    : "N/A"}
                </span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="text-lg md:text-xl text-primary-500 hover:text-primary-600 font-semibold py-2 px-4 rounded-lg border border-primary-500 hover:border-primary-600 transition duration-150 ease-in-out"
        >
          View Details →
        </button>
      </animated.li>
    );
  }
);

export default TicketItem;
