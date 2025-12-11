// src/pages/admin/AdminProfile.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// FIX: Explicit relative path to AdminLayout
import AdminLayout from "../../components/admin/AdminLayout.jsx";

const AdminProfile = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // Mock data for the Admin profile state
  const [profileData, setProfileData] = useState({
    name: user?.name || "Chief Administrator",
    email: user?.email || "admin@aicteportal.edu",
    role: "System Administrator",
    phone: "9988776655",
    lastLogin: "2025-11-20 08:30 AM",
    accessLevel: "Full System",
  });

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Admin Profile saved! (API call placeholder)", profileData);
    setIsEditing(false);
  };

  const InfoField = ({ label, value, name, isEditing, onChange }) => (
    <div className="p-4 border-b border-gray-100">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      {isEditing ? (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="mt-1 w-full text-base font-medium text-slate-900 rounded-lg border border-red-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-300 transition"
          disabled={name === 'email' || name === 'role'}
        />
      ) : (
        <p className="mt-1 text-base font-medium text-slate-900">{value}</p>
      )}
    </div>
  );

  return (
    <AdminLayout user={user} onLogout={onLogout} title="Your Profile" activeKey="profile">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        {/* Back Button */}
        <button
          onClick={() => navigate("/admin")}
          className="self-start inline-flex items-center gap-2 text-sm text-slate-600 hover:text-fuchsia-700 transition-colors"
        >
          <span className="text-lg">←</span> Back to Dashboard
        </button>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-red-200 flex items-center justify-center text-3xl font-bold text-red-800 shadow-inner">
              {(user?.name || "A").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">{profileData.name}</h2>
              <p className="text-base text-slate-600 mt-0.5">{profileData.role}</p>
            </div>
            <div className="sm:ml-auto pt-3 sm:pt-0">
              {isEditing ? (
                <div className="flex gap-3">
                  <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition">
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-slate-700 hover:bg-gray-100 transition">
                    Cancel
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setIsEditing(true)} className="px-4 py-2 rounded-lg bg-fuchsia-600 text-white font-medium hover:bg-fuchsia-700 transition shadow-md">
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 divide-y divide-gray-100 overflow-hidden">
            <h3 className="px-6 py-4 text-lg font-semibold bg-slate-50 text-slate-700 border-b">Access and Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <InfoField
                label="Admin Name"
                name="name"
                value={profileData.name}
                isEditing={isEditing}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
              <InfoField
                label="System Role"
                name="role"
                value={profileData.role}
                isEditing={isEditing}
                onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
              />
              <InfoField
                label="Official Email"
                name="email"
                value={profileData.email}
                isEditing={isEditing}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
              <InfoField
                label="Phone Number"
                name="phone"
                value={profileData.phone}
                isEditing={isEditing}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
              <InfoField
                label="Last System Login (Mock)"
                name="lastLogin"
                value={profileData.lastLogin}
                isEditing={false}
              />
              <InfoField
                label="Access Level"
                name="accessLevel"
                value={profileData.accessLevel}
                isEditing={false}
              />
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;