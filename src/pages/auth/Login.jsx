// src/pages/auth/Login.jsx
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
      const res = await fetch("/api/auth/login", {
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
    <div className="flex-1 p-10 rounded-tr-xl rounded-br-xl shadow-2xl bg-gradient-to-br from-indigo-800 to-purple-900 transition-all duration-700 ease-in-out transform">
      <h3 className="text-4xl md:text-5xl font-semibold tracking-wide text-white mb-10 text-left pt-2">
        Login
      </h3>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-base md:text-lg font-medium text-gray-100">
            Username (Email)
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="mt-2 block w-full px-5 py-3 rounded-xl border border-white/40 bg-white/10 backdrop-blur text-white text-lg placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400/40 focus:border-pink-300 shadow-inner transition"
          />
        </div>

        <div>
          <label className="block text-base md:text-lg font-medium text-gray-100">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="mt-2 block w-full px-5 py-3 rounded-2xl border border-white/60 bg-gradient-to-br from-purple-900/70 to-indigo-900/70 backdrop-blur text-white text-lg placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-200 shadow-lg transition"
          />
        </div>

        <div className="flex flex-col items-end pt-2">
          <button
            type="button"
            onClick={() =>
              alert("Forgot password is not implemented yet.")
            }
            className="text-sm font-medium text-gray-200 hover:text-pink-300 mb-4 transition"
          >
            Forgot your password?
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-6 rounded-2xl text-xl font-semibold text-gray-900 bg-white hover:bg-pink-50 transition duration-300 shadow-xl disabled:bg-gray-400 disabled:text-gray-200"
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
          className="text-base md:text-lg font-semibold tracking-wide text-gray-100 hover:text-pink-300 transition duration-300"
        >
          New user? Click here to Sign Up
        </button>
      </div>
    </div>
  );
};

export default Login;
