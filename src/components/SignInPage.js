import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import logo from "../assets/logo.jpg";
import Particles from "react-tsparticles";

function SignInPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const formAnimation = useSpring({
    opacity: 1,
    transform: "translateY(0)",
    from: { opacity: 0, transform: "translateY(50px)" },
    config: { mass: 1, tension: 200, friction: 20 },
  });

  async function handleSignIn(e) {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://ogfieldticket.com/api/login_api.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );
      const data = await response.json();
      if (data.success) {
        // Store user information in local storage or state management solution
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/home");
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error signing in:", error);
      setError("An error occurred while signing in.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200">
      <Particles
        className="absolute top-0 left-0 right-0 bottom-0"
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 60,
          interactivity: {
            detectsOn: "canvas",
            events: {
              onClick: {
                enable: true,
                mode: "push",
              },
              onHover: {
                enable: true,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              bubble: {
                distance: 400,
                duration: 2,
                opacity: 0.8,
                size: 40,
              },
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: ["#6c757d", "#495057", "#343a40"],
            },
            links: {
              color: "#6c757d",
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            collisions: {
              enable: true,
            },
            move: {
              direction: "none",
              enable: true,
              outMode: "bounce",
              random: false,
              speed: 2,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                value_area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle",
            },
            size: {
              random: true,
              value: 5,
            },
          },
          detectRetina: true,
        }}
      />
      <animated.div
        style={formAnimation}
        className="bg-white shadow-2xl rounded-lg px-12 py-14 max-w-md w-full transform hover:scale-105 transition-transform duration-500 relative z-10"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gray-400 to-gray-500 rounded-t-lg animate-pulse"></div>
        <img
          src={logo}
          className="w-32 mx-auto mb-8 rounded-full border-4 border-white shadow-md animate-float"
          alt="logo"
        />
        <form className="space-y-8" onSubmit={handleSignIn}>
          <div>
            <label
              className="block text-gray-700 font-semibold mb-2 text-lg"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="w-full border-gray-300 border-2 rounded-md px-5 py-3 text-lg focus:outline-none focus:ring-4 focus:ring-gray-400 focus:border-transparent transition-all duration-300"
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label
              className="block text-gray-700 font-semibold mb-2 text-lg"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="w-full border-gray-300 border-2 rounded-md px-5 py-3 text-lg focus:outline-none focus:ring-4 focus:ring-gray-400 focus:border-transparent transition-all duration-300"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-red-500 text-lg animate-pulse">{error}</p>
          )}
          <button
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-4 px-8 rounded-full hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-gray-600 transform hover:scale-105 transition-transform duration-500 shadow-lg text-xl"
            type="submit"
          >
            Sign In
          </button>
          <p className="text-gray-600 text-center text-lg">
            <a
              className="text-gray-700 hover:text-gray-800 underline transition-colors duration-300"
              href="#"
            >
              Forgot Password?
            </a>
          </p>
        </form>
      </animated.div>
    </div>
  );
}

export default SignInPage;
