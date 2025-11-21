// src/pages/Login.jsx
import React, { useState } from "react";

const Login = ({ onLogin, switchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // required if backend sets cookies
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      // Example expected backend response:
      // { success: true, user: { id, name, role, email } }
      if (!data.user) {
        throw new Error("User object missing in server response.");
      }

      onLogin(data.user);  // send logged-in user to App.jsx

    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 rounded-tr-xl rounded-br-xl shadow-2xl bg-gradient-to-br from-indigo-800 to-purple-900 transition-all duration-700 ease-in-out transform">
      <h3 className="text-3xl font-light text-white mb-10 text-left pt-2">
        Login
      </h3>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-light text-gray-300">
            Username (Email)
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="mt-1 block w-full px-4 py-2 border-b-2 border-gray-600 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-pink-400"
          />
        </div>

        <div>
          <label className="block text-sm font-light text-gray-300">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="mt-1 block w-full px-4 py-2 border-b-2 border-gray-600 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-pink-400"
          />
        </div>

        <div className="flex flex-col items-end pt-2">
          <button
            type="button"
            onClick={() =>
              alert("Forgot password is not implemented yet.")
            }
            className="text-xs font-light text-gray-300 hover:text-pink-300 mb-4"
          >
            Forgot your password?
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 rounded-lg text-lg font-semibold text-gray-800 bg-gray-100 hover:bg-white transition duration-300 shadow-md disabled:bg-gray-400"
          >
            {loading ? "Logging In..." : "Login"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 text-sm font-medium text-red-100 bg-red-700/50 rounded-lg">
          {error}
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={switchToSignup}
          className="text-sm font-light text-gray-300 hover:text-pink-300 transition duration-300"
        >
          New user? Click here to Sign Up
        </button>
      </div>
    </div>
  );
};

export default Login;
