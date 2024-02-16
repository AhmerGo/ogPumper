import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg"; // Ensure your logo path is correct

function SignInPage() {
  let navigate = useNavigate();

  function handleSignIn() {
    navigate("/home"); // Navigate to the HomePage upon sign in
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-purple-600 to-blue-500">
      <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-lg px-10 pt-8 pb-10 mb-4 flex flex-col items-center">
        <img src={logo} className="w-32 mb-6" alt="logo" />
        <form className="w-full max-w-sm" onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username"
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="******************"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={handleSignIn}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:-translate-y-1"
              type="button"
            >
              Sign In
            </button>
            <a
              className="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800"
              href="#"
            >
              Forgot Password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignInPage;
