import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

// --- Auth Pages ---
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";

// --- Faculty Pages ---
import Dashboard from "./pages/faculty/Dashboard.jsx";
import NewSubmission from "./pages/faculty/NewSubmission.jsx";
import Submissions from "./pages/faculty/Submissions.jsx";
import Profile from "./pages/faculty/Profile.jsx";
import SimplePage from "./pages/faculty/SimplePage.jsx";
import Drafts from "./pages/faculty/Drafts.jsx";
import AIUpload from "./pages/faculty/AIUpload.jsx";

// --- Form Router ---
import SectionFormRouter from "./pages/forms/SectionFormRouter.jsx";

// --- Admin Pages ---
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminProfile from "./pages/admin/AdminProfile.jsx";
import AdminSimplePage from "./pages/admin/AdminSimplePage.jsx";

// --- NEW Admin Pages ---
import FacultyList from "./pages/admin/FacultyList.jsx";
import FacultyDetails from "./pages/admin/FacultyDetails.jsx";
import SubmissionCategories from "./pages/admin/SubmissionCategories.jsx";
import SubmissionTable from "./pages/admin/SubmissionTable.jsx";
import ReportsAnalytics from "./pages/admin/ReportsAnalytics.jsx";
import MagicLinkGenerator from "./pages/admin/MagicLinkGenerator.jsx";
import MagicLinkPage from "./pages/public/MagicLinkPage.jsx";


// Auth page for login/signup toggle
const AuthPage = ({ onLogin }) => {
  const [view, setView] = useState("login");
  const ViewComp = view === "login" ? Login : Signup;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundImage: "linear-gradient(135deg, #fce9e2 0%, #ffe9c6 100%)" }}
    >
      <div className="w-full max-w-5xl lg:max-w-6xl flex shadow-2xl rounded-xl overflow-hidden backdrop-blur-sm transform transition-transform duration-700 hover:scale-[1.01]">
        <div className="hidden md:flex flex-col justify-between bg-white p-12 md:w-5/12 lg:w-2/5 text-gray-800 rounded-tl-xl rounded-bl-xl">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
            AICTE Achievement Portal
          </h2>
          <p className="text-lg font-medium text-indigo-800 mb-6">
            Securely manage faculty achievements for NBA compliance.
          </p>
          <p className="text-xs text-gray-500">Powered by Prototype System</p>
        </div>

        <ViewComp
          onLogin={onLogin}
          switchToSignup={() => setView("signup")}
          switchToLogin={() => setView("login")}
        />
      </div>
    </div>
  );
};


const App = () => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();

  // Prevent double/triple execution in React StrictMode
  const hasFetched = useRef(false);

  // 1. Auto-check session on app load
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });

        console.log("Response status from /me:", res.status);

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          const errorText = await res.text();
          console.error(`Session check failed with status ${res.status}.Response: `, errorText);
          setUser(null);
        }
      } catch (e) {
        console.error("Network/Fetch error during session check:", e);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };
    checkSession();
  }, []);

  // 2. Handle Login
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    if (loggedInUser.role === "admin") navigate("/admin");
    else navigate("/faculty");
  };

  // 3. Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (e) {
      console.warn("Logout fetch failed (likely network error), proceeding with local logout.");
    } finally {
      setUser(null);
      navigate("/");
    }
  };

  // Loading Screen
  if (loadingUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Checking session...
      </div>
    );
  }

  // Helper component to check authentication and wrap admin routes
  const AdminRouteWrapper = ({ children }) => {
    if (user && user.role === "admin") return children;
    return <Navigate to="/" replace />;
  };

  return (
    <Routes>
      {/* Root login/signup */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === "admin" ? "/admin" : "/faculty"} replace />
          ) : (
            <AuthPage onLogin={handleLogin} />
          )
        }
      />

      {/* 🚀 FACULTY ROUTES */}
      <Route path="/faculty" element={user && user.role === "faculty" ? (<Dashboard user={user} onLogout={handleLogout} />) : (<Navigate to="/" replace />)} />
      <Route path="/faculty-submissions" element={user && user.role === "faculty" ? (<Submissions user={user} onLogout={handleLogout} />) : (<Navigate to="/" replace />)} />
      <Route path="/new-submission" element={user && user.role === "faculty" ? (<NewSubmission user={user} onBack={() => navigate("/faculty")} onLogout={handleLogout} />) : (<Navigate to="/" replace />)} />
      <Route path="/faculty-drafts" element={user && user.role === "faculty" ? (<Drafts user={user} onBack={() => navigate("/new-submission")} onLogout={handleLogout} />) : (<Navigate to="/" replace />)} />
      <Route path="/profile" element={user && user.role === "faculty" ? (<Profile user={user} onLogout={handleLogout} />) : (<Navigate to="/" replace />)} />
      <Route path="/new-submission/:sectionCode" element={user && user.role === "faculty" ? (<SectionFormRouter user={user} />) : (<Navigate to="/" replace />)} />

      {/* AI Upload - Real Implementation */}
      <Route path="/ai-upload" element={user && user.role === "faculty" ? (<AIUpload user={user} onLogout={handleLogout} />) : (<Navigate to="/" replace />)} />
      <Route path="/events" element={user && user.role === "faculty" ? (<SimplePage user={user} title="Upcoming Events" message="This page will list upcoming FDPs, workshops, conferences, and important internal deadlines." onLogout={handleLogout} />) : (<Navigate to="/" replace />)} />
      <Route path="/guidelines" element={user && user.role === "faculty" ? (<SimplePage user={user} title="Submission Guidelines" message="This page will provide detailed guidelines on acceptable contributions and proof documents." onLogout={handleLogout} />) : (<Navigate to="/" replace />)} />
      <Route path="/help" element={user && user.role === "faculty" ? (<SimplePage user={user} title="Help & Support" message="This page will contain FAQs and contact information for technical and NBA-related help." onLogout={handleLogout} />) : (<Navigate to="/" replace />)} />

      {/* 👑 ADMIN ROUTES */}
      <Route path="/admin" element={<AdminRouteWrapper><AdminDashboard user={user} onLogout={handleLogout} /></AdminRouteWrapper>} />

      {/* ADMIN SUB-ROUTES */}
      <Route path="/admin/submissions" element={<AdminRouteWrapper><SubmissionCategories user={user} onLogout={handleLogout} /></AdminRouteWrapper>} />
      <Route path="/admin/submissions/:categoryId" element={<AdminRouteWrapper><SubmissionTable user={user} onLogout={handleLogout} /></AdminRouteWrapper>} />

      <Route path="/admin/faculty" element={<AdminRouteWrapper><FacultyList user={user} onLogout={handleLogout} /></AdminRouteWrapper>} />
      <Route path="/admin/faculty/:facultyId" element={<AdminRouteWrapper><FacultyDetails user={user} onLogout={handleLogout} /></AdminRouteWrapper>} />

      <Route path="/admin/profile" element={<AdminRouteWrapper><AdminProfile user={user} onLogout={handleLogout} /></AdminRouteWrapper>} />

      {/* ADMIN Placeholders */}
      <Route path="/admin/reports" element={<AdminRouteWrapper><ReportsAnalytics user={user} onLogout={handleLogout} /></AdminRouteWrapper>} />
      <Route path="/admin/events" element={<AdminRouteWrapper><AdminSimplePage user={user} onLogout={handleLogout} title="Event Management" message="Tools to manage FDPs, STTPs, and deadlines." activeKey="event-management" /></AdminRouteWrapper>} />
      <Route path="/admin/system" element={<AdminRouteWrapper><AdminSimplePage user={user} onLogout={handleLogout} title="System Utilities" message="Tools for database status and system maintenance." activeKey="system-utilities" /></AdminRouteWrapper>} />
      <Route path="/admin/magic-links" element={<AdminRouteWrapper><MagicLinkGenerator user={user} onLogout={handleLogout} /></AdminRouteWrapper>} />

      {/* 🪄 PUBLIC MAGIC LINKS */}
      <Route path="/portal/secure-entry/:token" element={<MagicLinkPage />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;