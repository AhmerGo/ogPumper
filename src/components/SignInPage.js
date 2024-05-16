import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import logo from "../assets/logo.jpg";
import { useUser } from "./UserContext";

function SignInPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setUser } = useUser();
  const [successMessage, setSuccessMessage] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(null);
  const [userID, setUserID] = useState("");
  const [token, setToken] = useState("");

  const formAnimation = useSpring({
    opacity: 1,
    transform: "translateY(0)",
    from: { opacity: 0, transform: "translateY(50px)" },
    config: { mass: 1, tension: 200, friction: 20 },
  });

  useEffect(() => {
    const extractSubdomain = () => {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        setSubdomain(subdomainPart);
      } else {
        setSubdomain("");
      }
    };

    extractSubdomain();
  }, []);

  const handleForgotPassword = async () => {
    if (username.trim() === "") {
      setError("Please Enter Username");
      return;
    }

    try {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let baseUrl;

      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        baseUrl = `https://${subdomainPart}.ogpumper.net`;
      } else {
        baseUrl = "https://ogfieldticket.com";
      }

      const response = await fetch(`${baseUrl}/api/passwordreset.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID: username }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage("Password reset email sent successfully");
        setError(""); // Clear any previous error message
      } else {
        setError("Failed to send password reset email");
        setSuccessMessage(""); // Clear any previous success message
      }
    } catch (error) {
      setError("An error occurred while sending password reset email.");
      setSuccessMessage(""); // Clear any previous success message
    }
  };

  async function handleSignIn(e) {
    e.preventDefault();
    try {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let baseUrl;

      if (parts.length > 2) {
        const subdomainPart = parts.shift();
        baseUrl = `https://${subdomainPart}.ogpumper.net`;
      } else {
        baseUrl = "https://ogfieldticket.com";
      }

      const response = await fetch(`${baseUrl}/api/login_api.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      const { success, message, user } = data;
      if (success) {
        setUser(user.Role, user.UserID);
        localStorage.setItem("userRole", user.Role);
        localStorage.setItem("userID", user.UserID);
        navigate("/home");
      } else {
        setError(message);
      }
    } catch (error) {
      setError("An error occurred while signing in.");
    }
  }

  const handleGoogleLoginSuccess = (response) => {
    const token = response.credential;
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    let baseUrl;

    if (parts.length > 2) {
      const subdomainPart = parts.shift();
      baseUrl = `https://${subdomainPart}.ogpumper.net`;
    } else {
      baseUrl = "https://ogfieldticket.com";
    }

    fetch(`${baseUrl}/api/google_login.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const { user } = data;
          setUser(user.Role, user.UserID);
          localStorage.setItem("userRole", user.Role);
          localStorage.setItem("userID", user.UserID);
          navigate("/home");
        } else if (data.message === "User not found") {
          setShowPrompt(true);
          setToken(token);
        } else {
          setError("Google Sign-In failed.");
        }
      })
      .catch((error) => {
        setError("An error occurred during Google Sign-In.");
      });
  };

  const handleGoogleLoginError = () => {
    setError("Google Sign-In failed.");
  };

  const handleExistingUserSubmit = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    let baseUrl;

    if (parts.length > 2) {
      const subdomainPart = parts.shift();
      baseUrl = `https://${subdomainPart}.ogpumper.net`;
    } else {
      baseUrl = "https://ogfieldticket.com";
    }

    fetch(`${baseUrl}/api/google_login.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, userID }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const { user } = data;
          setUser(user.Role, user.UserID);
          localStorage.setItem("userRole", user.Role);
          localStorage.setItem("userID", user.UserID);
          navigate("/home");
        } else {
          setError("Google Sign-In failed.");
        }
      })
      .catch((error) => {
        setError("An error occurred during Google Sign-In.");
      });

    setShowPrompt(false);
  };

  return (
    <GoogleOAuthProvider clientId="43210536118-10g29la6m8pfd5epk6u16851igpnlrqc.apps.googleusercontent.com">
      <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200">
        <animated.div
          style={formAnimation}
          className="bg-white shadow-2xl rounded-lg px-6 py-10 sm:px-12 sm:py-14 max-w-md w-full transform hover:scale-105 transition-transform duration-500 relative z-10 flex flex-col justify-center min-h-screen sm:min-h-0"
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gray-400 to-gray-500 rounded-t-lg animate-pulse"></div>
          <img
            src={logo}
            className="w-40 sm:w-32 mx-auto mb-6 sm:mb-8 rounded-full border-4 border-white shadow-md animate-float"
            alt="logo"
          />
          <form className="space-y-6 sm:space-y-8" onSubmit={handleSignIn}>
            <div>
              <label
                className="block text-gray-700 font-semibold mb-2 text-base sm:text-lg"
                htmlFor="username"
              >
                Username
              </label>
              <input
                className="w-full border-gray-300 border-2 rounded-md px-4 py-2 sm:px-5 sm:py-3 text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-gray-400 focus:border-transparent transition-all duration-300"
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label
                className="block text-gray-700 font-semibold mb-2 text-base sm:text-lg"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="w-full border-gray-300 border-2 rounded-md px-4 py-2 sm:px-5 sm:py-3 text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-gray-400 focus:border-transparent transition-all duration-300"
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {successMessage && (
              <p className="text-green-500 text-base sm:text-lg animate-pulse">
                {successMessage}
              </p>
            )}

            {error && (
              <p className="text-red-500 text-base sm:text-lg animate-pulse">
                {error}
              </p>
            )}
            <button
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-gray-600 transform hover:scale-105 transition-transform duration-500 shadow-lg text-lg sm:text-xl"
              type="submit"
            >
              Sign In
            </button>
            <p className="text-gray-600 text-center text-base sm:text-lg">
              <a
                className="text-gray-700 hover:text-gray-800 underline transition-colors duration-300"
                href="#"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </a>
            </p>
          </form>
          {subdomain === "" && (
            <div className="flex justify-center mt-6">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                scope="openid profile email"
                className="w-full"
              />
            </div>
          )}
        </animated.div>

        {showPrompt && (
          <div className="modal">
            <div className="modal-content">
              <h2>Are you an existing user?</h2>
              <button onClick={() => setIsExistingUser(true)}>Yes</button>
              <button onClick={() => setIsExistingUser(false)}>No</button>
            </div>
          </div>
        )}

        {isExistingUser && (
          <div className="modal">
            <div className="modal-content">
              <h2>Enter your User ID</h2>
              <input
                type="text"
                value={userID}
                onChange={(e) => setUserID(e.target.value)}
              />
              <button onClick={handleExistingUserSubmit}>Submit</button>
            </div>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default SignInPage;
