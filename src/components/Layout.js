import { React, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import styled, { css } from "styled-components";
import { useTheme } from "./ThemeContext"; // Adjust the import path as needed
import { useUserRole } from "./UserContext";

// Define your NavBarContainer with a gradient and shadow for a modern look
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

// Logo now includes a custom SVG for a more unique and artsy title
const Logo = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  svg {
    height: 40px; /* Adjust based on your logo */
    fill: currentColor; /* Adjusts based on theme */
  }

  span {
    font-weight: 600;
    font-size: 1.5rem;
    margin-left: 0.5rem;
    background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &:hover {
    transform: translateY(-2px); /* Subtle hover effect */
  }
`;

const NavItems = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

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

function Layout({ children }) {
  let navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { setUserRole } = useUserRole();
  const [spinning, setSpinning] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem("userRole");
    setUserRole("");
    navigate("/");
  };

  const handleThemeToggle = () => {
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      toggleTheme();
    }, 1000);
  };

  const navBarAnimation = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

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
          {/* Insert your custom SVG logo here */}
          <span>OgFieldDemo</span>
        </Logo>
        <NavItems>
          <NavItem onClick={() => navigate("/profile")} theme={theme}>
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
        </NavItems>
      </NavBarContainer>
      <main style={{ paddingTop: "4rem" }}>{children}</main>
    </div>
  );
}

export default Layout;
