import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import FacultySidebar from "../components/FacultySidebar";
import {
  getDefaultFacultyNavItems,
  getProfileNavItem,
  getHelpNavItem,
} from "../utils/facultyNav";
import axios from "axios";

const InfoField = ({ label, value, name, isEditing, onChange, type = "text" }) => (
  <div className="p-4 border-b border-gray-100">
    <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
    {isEditing ? (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 w-full text-base font-medium text-slate-900 rounded-lg border border-indigo-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
        disabled={name === 'email'} // Email usually remains fixed
      />
    ) : (
      <p className="mt-1 text-base font-medium text-slate-900">{value || "-"}</p>
    )}
  </div>
);

const Profile = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const navItems = getDefaultFacultyNavItems(navigate, "profile");
  const profileItem = getProfileNavItem(navigate, true);
  const helpItem = getHelpNavItem(navigate);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    designation: "",
    department: "",
    phone: "",
    experience: 0,
    phdStatus: "Completed (2020)",
    profileImage: null,
    joinedYear: new Date().getFullYear(),
  });
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/api/profile", {
        withCredentials: true,
      });
      setProfileData(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch profile", err);
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // 1. Upload image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        await axios.post("/api/profile/image", formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // 2. Update profile details
      await axios.put("/api/profile", profileData, {
        withCredentials: true,
      });

      setIsEditing(false);
      fetchProfile(); // Refresh data
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile.");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile(); // Revert changes
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      // Create preview
      setProfileData({ ...profileData, profileImage: URL.createObjectURL(e.target.files[0]) });
    }
  };

  if (loading) return <div className="p-10 text-center">Loading profile...</div>;

  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundImage: "linear-gradient(135deg, #f8f2ff 0%, #fff4ea 100%)",
      }}
    >
      <FacultySidebar
        navItems={navItems}
        profileItem={profileItem}
        helpItem={helpItem}
        onLogout={onLogout}
      />

      {/* ➡️ RIGHT: Content Area */}
      <div className="flex-1 flex flex-col md:ml-80">
        <Header title="Faculty Profile" user={user} onLogout={onLogout} />

        <button
          type="button"
          onClick={() => navigate("/faculty")}
          className="inline-flex items-center gap-2 text-sm text-indigo-700 hover:text-indigo-500 transition-colors mb-3 px-4 sm:px-8 mt-4"
        >
          <span className="text-xl">←</span>
          <span>Back to Dashboard</span>
        </button>

        <main className="flex-1 px-4 sm:px-8 py-6">
          <form onSubmit={handleSave} className="max-w-4xl mx-auto flex flex-col gap-6">

            {/* Profile Card Header (Professional Look) */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-indigo-200 flex items-center justify-center text-3xl font-bold text-indigo-800 shadow-inner overflow-hidden">
                  {profileData.profileImage && !profileData.profileImage.startsWith("blob:") ? (
                    <img
                      src={`/api/profile/image/${profileData.profileImage}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = "" }} // Fallback if load fails
                    />
                  ) : profileData.profileImage && profileData.profileImage.startsWith("blob:") ? (
                    <img src={profileData.profileImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    (profileData.name || "U").slice(0, 1).toUpperCase()
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-indigo-700 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{profileData.name}</h2>
                <p className="text-base text-slate-600 mt-0.5">{profileData.designation}, {profileData.department}</p>
                <p className="text-sm text-slate-500 mt-1">Joined: {profileData.joinedYear}</p>
              </div>
              <div className="sm:ml-auto pt-3 sm:pt-0">
                {isEditing ? (
                  <div className="flex gap-3">
                    <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition">
                      Save Changes
                    </button>
                    <button type="button" onClick={handleCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-slate-700 hover:bg-gray-100 transition">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={handleEdit} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-md">
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Profile Details Grid (Aligned with NBA Criteria) */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 divide-y divide-gray-100 overflow-hidden">
              <h3 className="px-6 py-4 text-lg font-semibold bg-slate-50 text-slate-700 border-b">Contact & Academic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2">
                <InfoField
                  label="Full Name"
                  name="name"
                  value={profileData.name}
                  isEditing={isEditing}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
                <InfoField
                  label="Official Email"
                  name="email"
                  value={profileData.email}
                  isEditing={isEditing}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
                <InfoField
                  label="Designation"
                  name="designation"
                  value={profileData.designation}
                  isEditing={isEditing}
                  onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
                />
                <InfoField
                  label="Department"
                  name="department"
                  value={profileData.department}
                  isEditing={isEditing}
                  onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                />
                <InfoField
                  label="Phone Number"
                  name="phone"
                  value={profileData.phone}
                  isEditing={isEditing}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
                <InfoField
                  label="Total Experience (Years)"
                  name="experience"
                  value={profileData.experience}
                  isEditing={isEditing}
                  type="number"
                  onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                />
              </div>
            </div>

            {/* PhD Status Card (FQI Relevant) */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Doctorate/Terminal Degree Status</h3>
              <InfoField
                label="PhD Status"
                name="phdStatus"
                value={profileData.phdStatus}
                isEditing={isEditing}
                onChange={(e) => setProfileData({ ...profileData, phdStatus: e.target.value })}
              />
              <p className="text-xs text-slate-500 mt-2">
                Updating these details helps calculate Faculty Qualification Index (FQI) as required by NBA Criterion 5.
              </p>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
};

export default Profile;