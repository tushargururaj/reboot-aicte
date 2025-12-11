// src/pages/Signup.jsx
import React, { useState } from "react";
const ADMIN_KEY = "shradhaforever";

// password strength helpers
const evaluatePasswordStrength = (password) => {
  let score = 0;
  if (password.length > 7) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score < 2) return { text: "Weak", colorClass: "text-red-400", widthPct: "20%" };
  if (score < 4) return { text: "Medium", colorClass: "text-yellow-300", widthPct: "60%" };
  return { text: "Strong", colorClass: "text-green-300", widthPct: "100%" };
};

const PasswordStrengthBar = ({ password }) => {
  const s = evaluatePasswordStrength(password);
  return (
    <div className="mt-1">
      <div className="h-2 rounded-full bg-gray-600">
        <div style={{ width: s.widthPct }} className="h-2 rounded-full bg-current" />
      </div>
      <p className={`text-xs mt-1 ${s.colorClass}`}>{password.length > 0 ? s.text : ""}</p>
    </div>
  );
};

const Signup = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "faculty",
    password: "",
    confirmPassword: "",
    adminCoreKey: "",
  });

  const [view, setView] = useState("form");
  const [otpInput, setOtpInput] = useState("");
  const MOCK_OTP = "123456";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const labelClasses = "block text-base md:text-lg font-medium text-gray-100";
  const fieldClasses =
    "mt-2 block w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 backdrop-blur text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400/40 focus:border-pink-200 shadow-inner transition";
  const passwordFieldClasses =
    "mt-2 block w-full px-4 py-3 rounded-2xl border border-white/60 bg-gradient-to-br from-purple-900/70 to-indigo-900/70 backdrop-blur text-white placeholder-white/85 focus:outline-none focus:ring-2 focus:ring-pink-400/60 focus:border-pink-100 shadow-lg transition";

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords does not match.");
      return;
    }

    if (formData.role === "admin" && formData.adminCoreKey !== ADMIN_KEY) {
      setError("Admin Core Key is invalid. Please confirm the key.");
      return;
    }

    console.log(`Mock OTP sent to ${formData.email}: ${MOCK_OTP}`);
    setView("otp");
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (otpInput !== MOCK_OTP) {
        setError("Invalid OTP.");
        setLoading(false);
        return;
      }

      // 🔥 REAL BACKEND REQUEST
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // only if backend sets cookies
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          adminCoreKey: formData.adminCoreKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      alert("Signup successful! You can now log in.");
      switchToLogin();

    } catch (err) {
      console.error(err);
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-10 rounded-xl md:rounded-l-none bg-gradient-to-br from-indigo-800 to-purple-900 text-white transition-all duration-700 ease-in-out transform">
      <h3 className="text-4xl md:text-5xl font-semibold tracking-wide text-white mb-10 text-left pt-2">
        Create Account
      </h3>

      {error && (
        <div className="p-3 text-sm font-medium text-red-100 bg-red-700/50 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={view === "form" ? handleInitialSubmit : handleVerify}
        className="space-y-5"
      >
        {view === "form" ? (
          <>
            {/* Full Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>
                  Full Name (Mandatory)
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={fieldClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>
                  Email Address (Mandatory)
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={fieldClasses}
                />
              </div>
            </div>

            {/* Role + Admin Key */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>
                  Role (Mandatory)
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-2 block w-full px-4 py-3 rounded-xl border border-white/30 bg-indigo-900/70 text-white focus:outline-none focus:ring-2 focus:ring-pink-400/40 focus:border-pink-200 transition"
                >
                  <option className="text-gray-900 bg-white" value="faculty">
                    Faculty
                  </option>
                  <option className="text-gray-900 bg-white" value="admin">
                    Admin
                  </option>
                </select>
              </div>

              {formData.role === "admin" ? (
                <div>
                  <label className={labelClasses}>
                    Admin Core Key (Mandatory)
                  </label>
                  <input
                    name="adminCoreKey"
                    type="password"
                    required
                    onChange={handleChange}
                    placeholder="Enter admin key"
                    className={passwordFieldClasses}
                  />
                </div>
              ) : (
                <div />
              )}
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>
                  Password (Mandatory)
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  onChange={handleChange}
                  placeholder="Create a password"
                  className={passwordFieldClasses}
                />
                <PasswordStrengthBar password={formData.password} />
              </div>

              <div>
                <label className={labelClasses}>
                  Confirm Password (Mandatory)
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={passwordFieldClasses}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-6 rounded-2xl text-xl font-semibold text-gray-900 bg-white hover:bg-pink-50 transition duration-300 shadow-xl mt-6"
            >
              Continue (Verify Email)
            </button>
          </>
        ) : (
          <>
            {/* OTP View */}
            <div className="pt-6">
              <label className={labelClasses + " mb-2"}>
                Enter OTP (Mock: {MOCK_OTP})
              </label>
              <input
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                maxLength={6}
                className="mt-2 block w-full px-6 py-3 rounded-2xl border border-white/40 bg-white/10 backdrop-blur text-white text-center text-2xl tracking-[0.6em] focus:outline-none focus:ring-2 focus:ring-pink-400/40 focus:border-pink-200 shadow-lg"
              />

              <p className="mt-4 text-base text-gray-200 text-right">
                <button
                  type="button"
                  onClick={() =>
                    alert(`Mock OTP resent to ${formData.email}: ${MOCK_OTP}`)
                  }
                  className="hover:text-pink-300"
                >
                  Resend OTP
                </button>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-6 rounded-2xl text-xl font-semibold text-gray-900 bg-white hover:bg-pink-50 transition duration-300 shadow-xl mt-8 disabled:bg-gray-400 disabled:text-gray-200"
            >
              {loading ? "Registering..." : "Verify & Sign Up"}
            </button>
          </>
        )}
      </form>

      <div className="mt-8 text-center">
        <button
          onClick={switchToLogin}
          className="text-base font-medium text-gray-200 hover:text-pink-300 transition duration-300"
        >
          Already have an account? Sign In
        </button>
      </div>
    </div>
  );
};

export default Signup;
