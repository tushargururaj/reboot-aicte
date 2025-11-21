// src/pages/admin/AdminFacultyManagement.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../adm_components/AdminLayout.jsx";

const mockFaculty = [
  { id: 1, name: "Dr. Anjali Sharma", email: "anjali.s@institute.edu", department: "CSE", designation: "Associate Professor", status: "Active" },
  { id: 2, name: "Prof. Rajesh Kumar", email: "rajesh.k@institute.edu", department: "ME", designation: "Professor", status: "Active" },
  { id: 3, name: "Ms. Sneha Gupta", email: "sneha.g@institute.edu", department: "ECE", designation: "Assistant Professor", status: "On Leave" },
  { id: 4, name: "Dr. Vikram Singh", email: "vikram.s@institute.edu", department: "Civil", designation: "HOD", status: "Active" },
];

const AdminFacultyManagement = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState(mockFaculty);

  const handleDeactivate = (id) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      setUsers(users.map(u => u.id === id ? { ...u, status: "Inactive" } : u));
    }
  };

  return (
    <AdminLayout user={user} onLogout={onLogout} title="Faculty Management" activeKey="manage-faculty">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin")}
          className="self-start inline-flex items-center gap-2 text-sm text-slate-600 hover:text-fuchsia-700 transition-colors"
        >
          <span className="text-lg">←</span> Back to Dashboard
        </button>

        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Registered Faculty</h2>
            <p className="text-slate-600">Manage accounts, roles, and access permissions.</p>
          </div>
          <button 
            onClick={() => alert("Add Faculty Modal would open here")}
            className="px-4 py-2 bg-fuchsia-700 text-white rounded-lg font-medium hover:bg-fuchsia-800 shadow-md transition"
          >
            + Add New Faculty
          </button>
        </div>

        {/* Faculty Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name / Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Designation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900">{u.name}</span>
                      <span className="text-xs text-slate-500">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{u.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden sm:table-cell">{u.designation}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                    <button onClick={() => handleDeactivate(u.id)} className="text-red-600 hover:text-red-900">Deactivate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFacultyManagement;