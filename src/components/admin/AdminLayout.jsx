// src/components/admin/AdminLayout.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader.jsx";
import AdminSidebar from "./AdminSidebar.jsx";

const AdminLayout = ({ user, activeKey, title, onLogout, children }) => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div
            className="min-h-screen flex text-[1.08rem] sm:text-[1.13rem]"
            style={{
                backgroundImage: "linear-gradient(135deg, #fef5f4 0%, #fff7f7 100%)",
            }}
        >
            {/* Responsive Sidebar */}
            <AdminSidebar
                activeKey={activeKey}
                navigate={navigate}
                onLogout={onLogout}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Content Area */}
            <div className="flex-1 flex flex-col md:ml-80 pt-24 transition-all duration-300">
                <AdminHeader
                    title={title}
                    user={user}
                    onLogout={onLogout}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />
                <main className="flex-1 px-4 sm:px-12 py-8">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;