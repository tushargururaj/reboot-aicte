// src/components/faculty/FacultyLayout.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../common/Header";
import FacultySidebar from "./FacultySidebar";
import {
  getDefaultFacultyNavItems,
  getProfileNavItem,
  getHelpNavItem,
} from "../../utils/facultyNav";

const FacultyLayout = ({ user, activeKey, children, onLogout, title = "Faculty Portal" }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Generate nav items
  const navItems = getDefaultFacultyNavItems(navigate, activeKey);
  const profileItem = getProfileNavItem(navigate, activeKey === "profile");
  const helpItem = getHelpNavItem(navigate);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar - Responsive */}
      <FacultySidebar
        navItems={navItems}
        profileItem={profileItem}
        helpItem={helpItem}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-80 min-h-screen transition-all duration-300">
        <Header
          title={title}
          user={user}
          onLogout={onLogout}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 px-4 sm:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default FacultyLayout;
