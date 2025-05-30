import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import styled, { css, createGlobalStyle } from "styled-components";
import { useTheme } from "ogcommon";
import { useUser } from "ogcommon";
import OutsideClickHandler from "react-outside-click-handler";
import logo from "../assets/100.png";
import HomeIcon from "@mui/icons-material/Home";
import Footer from "./Footer";
const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Inter', sans-serif;
    color: ${({ theme }) => (theme === "dark" ? "#E0E0E0" : "#333")};
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
  position: fixed;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;

  ${({ theme }) =>
    theme === "dark" &&
    css`
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
    `}

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 1rem;
  }
`;

const DetailsButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 50px;
  background-color: ${({ theme }) =>
    theme === "dark" ? "#4E9F3D" : "#76C893"};
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: ${({ theme }) =>
      theme === "dark" ? "#3d7a2e" : "#5da671"};
    transform: translateY(-2px);
  }
`;

const AdminButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background-color: ${({ theme }) =>
    theme === "dark" ? "#4285F4" : "#FFFFFF"};
  color: ${({ theme }) => (theme === "dark" ? "#FFFFFF" : "#4285F4")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: box-shadow 0.3s ease, background-color 0.3s ease, color 0.3s ease,
    transform 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
    background-color: ${({ theme }) =>
      theme === "dark" ? "#3367D6" : "#F2F2F2"};
  }

  @media (max-width: 768px) {
    display: none;
  }

  svg {
    margin-right: 8px;
    transition: transform 0.5s ease;
  }

  &:hover svg {
    transform: rotate(360deg);
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  svg,
  .fa-icon {
    font-size: 30px;
    fill: currentColor;
  }

  .fa-icon {
    color: ${({ theme }) => (theme === "dark" ? "#FFFFFF" : "#333")};
    margin-right: 0.5rem;
  }

  span {
    font-weight: 600;
    font-size: 1.5rem;
    background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &:hover {
    transform: translateY(-2px);
  }
`;

const VersionText = styled.span`
  font-size: 0.75rem;
  margin-left: 0.5rem;
  opacity: 0.7;
`;

const NavItems = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-evenly;
    margin-top: 0.5rem;
  }

  .material-symbols-outlined {
    font-size: 24px;
    cursor: pointer;
    &:hover {
      color: #ddd;
    }
  }
`;

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
    color: inherit;
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
      ? "linear-gradient(145deg, #1a202c, #2d3748)"
      : "linear-gradient(145deg, #f7fafc, #edf2f7)"};
  color: ${({ theme }) => (theme === "dark" ? "#f7fafc" : "#1a202c")};
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2), 0 10px 20px rgba(0, 0, 0, 0.15);
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  z-index: 1001;
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => (theme === "dark" ? "#4a5568" : "#cbd5e0")};
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
  font-weight: 700;
  margin-bottom: 10px;
  color: ${({ theme }) => (theme === "dark" ? "#FFFFFF" : "#22222")};
`;

const UserRole = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 16px;
  color: ${({ theme }) => (theme === "dark" ? "#AAAAAA" : "#55555")};
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
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { userRole, userID, setUser, companyName } = useUser();

  // STEP: read version from meta tag in index.html
  const appVersion =
    document?.querySelector('meta[name="app-version"]')?.content || "???";

  const [spinning, setSpinning] = useState(false);
  const [profileCardVisible, setProfileCardVisible] = useState(false);

  const profileCardAnimation = useSpring({
    opacity: profileCardVisible ? 1 : 0,
    transform: profileCardVisible ? "translateY(0)" : "translateY(-20px)",
    config: { mass: 1, tension: 210, friction: 20 },
  });

  const handleSignOut = useCallback(() => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userID");
    setUser("", "");
    navigate("/");
  }, [navigate, setUser]);

  const handleThemeToggle = useCallback(() => {
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      toggleTheme();
    }, 1000);
  }, [toggleTheme]);

  const capitalizeFirstLetter = useCallback((string) => {
    if (string && typeof string === "string") {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    return "";
  }, []);

  const navBarAnimation = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  const handleDetailsClick = useCallback(() => {
    navigate("/profile-details");
    setProfileCardVisible(false);
  }, [navigate]);

  const toggleProfileCard = useCallback(
    () => setProfileCardVisible(!profileCardVisible),
    [profileCardVisible]
  );

  return (
    <div
      className={
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }
    >
      <GlobalStyle theme={theme} />

      <NavBarContainer style={navBarAnimation} theme={theme}>
        {/* Logo / Brand Name / Version */}
        <Logo onClick={() => navigate("/home")} theme={theme}>
          <HomeIcon className="material-icon" />
          <span>
            {companyName && companyName.length > 3
              ? companyName
              : "ogFieldTicket"}
          </span>
          {/* Display the version here */}
          <VersionText>v{appVersion}</VersionText>
        </Logo>

        <NavItems>
          {userRole !== "P" && (
            <AdminButton theme={theme} onClick={() => navigate("/admin-panel")}>
              <span className="material-symbols-outlined">
                admin_panel_settings
              </span>
            </AdminButton>
          )}

          <NavItem onClick={toggleProfileCard} theme={theme}>
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
                <UserName>{userID ? userID : "Signed in"}</UserName>
                <UserRole>Hello {capitalizeFirstLetter(userID)}!</UserRole>
                <DetailsButton onClick={handleDetailsClick} theme={theme}>
                  Profile Details
                </DetailsButton>
              </ProfileCard>
            </OutsideClickHandler>
          )}
        </NavItems>
      </NavBarContainer>

      <main style={{ paddingTop: "4rem" }}>{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
