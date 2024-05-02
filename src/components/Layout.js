import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import styled, { css, createGlobalStyle } from "styled-components";
import { useTheme } from "./ThemeContext"; // Adjust the import path as needed
import { useUser } from "./UserContext";
import OutsideClickHandler from "react-outside-click-handler";
import logo from "../assets/100.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HomeIcon from "@mui/icons-material/Home";

// Define your NavBarContainer with a gradient and shadow for a modern look
const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Inter', sans-serif;
    color: ${({ theme }) =>
      theme === "dark"
        ? "#E0E0E0"
        : "#333"}; // Improve text visibility in dark mode
  }
`;

const NavBarContainer = styled(animated.nav)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  width: 100%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
  position: fixed; /* Changed from sticky to fixed for consistent stickiness */
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;

  ${({ theme }) =>
    theme === "dark" &&
    css`
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
    `}
`;

const DetailsButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 50px;
  background-color: ${({ theme }) =>
    theme === "dark"
      ? "#4E9F3D"
      : "#76C893"}; // A green shade that adapts to the theme
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: ${({ theme }) =>
      theme === "dark" ? "#3d7a2e" : "#5da671"}; // Darken on hover
    transform: translateY(-2px);
  }
`;

// Logo now includes a custom SVG for a more unique and artsy title
const Logo = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  svg,
  .fa-icon {
    font-size: 30px; /* Adjust the font size to reduce the icon size */
    fill: currentColor; // Adjusts based on theme
  }

  .fa-icon {
    color: ${({ theme }) =>
      theme === "dark"
        ? "#FFFFFF"
        : "#333"}; // Adjusts color based on the theme
    margin-right: 0.5rem; // Space between icon and text
  }

  span {
    font-weight: 600;
    font-size: 1.5rem;
    background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &:hover {
    transform: translateY(-2px); // Subtle hover effect
  }
`;

const NavItems = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  width: 200px;

  .material-symbols-outlined {
    font-size: 24px;
    cursor: pointer;
    &:hover {
      color: #ddd; // Lighten the icon on hover for interactivity
    }
  }
`;

// Styling for navigation items, including Material Icons
const NavItem = styled(animated.div)`
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  .material-symbols-outlined {
    font-size: 24px;
    color: inherit; /* Ensures icon color matches the theme */
  }
`;

const ThemeToggleButton = styled(NavItem)`
  transition: transform 0.5s ease;

  ${({ spinning }) =>
    spinning &&
    css`
      animation: spin 0.4s linear;
    `}

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ProfileCard = styled(animated.div)`
  position: absolute;
  top: 60px;
  right: 0;
  width: 300px;
  background: ${({ theme }) =>
    theme === "dark"
      ? "linear-gradient(145deg, #333, #2b2f37)"
      : "linear-gradient(145deg, #fff, #e6e6e6)"};
  color: ${({ theme }) => (theme === "dark" ? "#FFF" : "#000")};
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2), 0 10px 20px rgba(0, 0, 0, 0.15);
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  z-index: 1001;
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => (theme === "dark" ? "#444" : "#ddd")};
  transition: all 0.5s ease-in-out;
`;

const UserAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #ddd;
  margin-bottom: 20px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserName = styled.div`
  font-family: "Inter", sans-serif;

  font-size: 24px;
  font-weight: 700; // Use a bolder weight for more emphasis
  margin-bottom: 10px;
  color: ${({ theme }) =>
    theme === "dark"
      ? "#FFFFFF"
      : "#22222"}; // Ensure high contrast in both themes
`;

const UserRole = styled.div`
  font-family: "Inter", sans-serif;

  font-size: 16px;
  color: ${({ theme }) =>
    theme === "dark"
      ? "#AAAAAA"
      : "55555"}; // Adjust for better visibility in dark mode
  margin-bottom: 20px;
`;

const SignOutButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 50px;
  background-color: #ff4d4d;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #e60000;
  }
`;

const CloseIcon = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: ${({ theme }) => (theme === "dark" ? "#fff" : "#000")};
  transition: color 0.3s ease;

  &:hover {
    color: #ff4d4d;
  }
`;

function Layout({ children }) {
  let navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, setUser, userRole, userID } = useUser();
  const [spinning, setSpinning] = useState(false);
  const [profileCardVisible, setProfileCardVisible] = useState(false);

  // Profile card animation
  const profileCardAnimation = useSpring({
    opacity: profileCardVisible ? 1 : 0,
    transform: profileCardVisible ? "translateY(0)" : "translateY(-20px)",
    config: { mass: 1, tension: 210, friction: 20 },
  });
  const handleSignOut = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userID");
    setUser("", "");
    navigate("/");
  };

  const handleThemeToggle = () => {
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      toggleTheme();
    }, 1000);
  };
  const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  const navBarAnimation = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  const handleDetailsClick = () => {
    // Placeholder for functionality to show profile details or navigate to a details page
    console.log("Show Profile Details or Navigate");
  };

  // Toggle profile card visibility
  const toggleProfileCard = () => setProfileCardVisible(!profileCardVisible);

  return (
    <div
      className={
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }
    >
      <NavBarContainer style={navBarAnimation} theme={theme}>
        <Logo onClick={() => navigate("/home")} theme={theme}>
          <HomeIcon className="material-icon" />
          <span>ogFieldTicket</span>
        </Logo>
        <NavItems>
          <NavItem
            onClick={(e) => {
              e.stopPropagation(); // Stop the click from reaching the OutsideClickHandler
              setProfileCardVisible(!profileCardVisible);
            }}
            theme={theme}
          >
            <span className="material-symbols-outlined">account_circle</span>
          </NavItem>
          <ThemeToggleButton onClick={handleThemeToggle} spinning={spinning}>
            <span className="material-symbols-outlined">
              {theme === "dark" ? "dark_mode" : "light_mode"}
            </span>
          </ThemeToggleButton>
          <NavItem onClick={handleSignOut} theme={theme}>
            <span className="material-symbols-outlined">logout</span>
          </NavItem>
          {profileCardVisible && (
            <OutsideClickHandler
              onOutsideClick={() => setProfileCardVisible(false)}
            >
              <ProfileCard style={profileCardAnimation} theme={theme}>
                <CloseIcon onClick={toggleProfileCard}>
                  <span className="material-symbols-outlined">close</span>
                </CloseIcon>
                <UserAvatar>
                  <img src={logo} alt="Logo" />
                </UserAvatar>
                <UserName>{user ? user : "Signed in"}</UserName>
                <UserRole>Hello {capitalizeFirstLetter(userID)} !</UserRole>
                <DetailsButton onClick={handleDetailsClick}>
                  Profile Details
                </DetailsButton>
              </ProfileCard>
            </OutsideClickHandler>
          )}
        </NavItems>
      </NavBarContainer>
      <main style={{ paddingTop: "4rem" }}>{children}</main>
    </div>
  );
}
export default Layout;
