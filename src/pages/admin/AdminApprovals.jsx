// src/pages/admin/AdminApprovals.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../adm_components/AdminLayout.jsx";
import StatusBadge from "../../components/StatusBadge.jsx"; 
import EmptyState from "../../components/EmptyState.jsx"; 

// Mock data for approved history
const mockHistory = [
  { id: 101, faculty: "Dr. A. Sharma", title: "Professional Society Membership (IEEE)", code: "6.1.1.1", approvalDate: "2024-10-12", approvedBy: "Admin" },
  { id: 102, faculty: "Prof. S. Khan", title: "FDP Resource Person (AI/ML)", code: "6.1.2.1.1", approvalDate: "2024-09-28", approvedBy: "Admin" },
  { id: 105, faculty: "Dr. P. Varma", title: "MOOC Certification (Swayam)", code: "6.1.4.1", approvalDate: "2024-08-15", approvedBy: "System" },
];

const AdminApprovals = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = useMemo(() => {
    if (!searchTerm) return mockHistory;
    return mockHistory.filter(
      (item) =>
        item.faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <AdminLayout user={user} onLogout={onLogout} title="Approvals History" activeKey="view-approvals">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin")}
          className="self-start inline-flex items-center gap-2 text-sm text-slate-600 hover:text-fuchsia-700 transition-colors"
        >
          <span className="text-lg">←</span> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Approved Contributions</h1>
            <p className="text-base text-slate-700">Archive of all faculty submissions accepted into the system.</p>
          </div>
          
          {/* Search Bar */}
          <input 
            type="text" 
            placeholder="Search faculty or title..." 
            className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 w-full md:w-72"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Approvals Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          {filteredHistory.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Faculty Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contribution</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Section</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Approval Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-fuchsia-50/30 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.faculty}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 truncate max-w-[200px]">{item.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden sm:table-cell">{item.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.approvalDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <StatusBadge status="Approved" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState title="No Approvals Found" description="Try adjusting your search terms." />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminApprovals;