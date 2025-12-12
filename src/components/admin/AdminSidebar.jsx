import React from "react";
import AdminSidebarItem from "./AdminSidebarItem";

// Icons (Simple SVGs for premium look)
const Icons = {
    Dashboard: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    ),
    Submissions: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    ),
    Faculty: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    ),
    Reports: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    ),
    Events: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    ),
    Profile: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    ),
    Help: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    Magic: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    ),
    ArrowRight: () => (
        <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
    )
};

// Define Admin Navigation Links
const ADMIN_NAV_ITEMS = [
    { key: "dashboard", label: "Dashboard", path: "/admin", icon: <Icons.Dashboard /> },
    { key: "review-submissions", label: "Submissions", path: "/admin/submissions", icon: <Icons.Submissions /> },
    { key: "magic-links", label: "Magic Links", path: "/admin/magic-links", icon: <Icons.Magic /> },
    { key: "manage-faculty", label: "Faculty List", path: "/admin/faculty", icon: <Icons.Faculty /> },
    { key: "reports", label: "Reports & Analytics", path: "/admin/reports", icon: <Icons.Reports /> },
    { key: "event-management", label: "Manage Events", path: "/admin/events", icon: <Icons.Events /> },
];

const AdminSidebar = ({
    activeKey,
    navigate,
    onLogout,
    isOpen,
    onClose
}) => {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
                    fixed top-0 left-0 h-screen bg-gradient-to-b from-red-900 to-fuchsia-900 text-white shadow-2xl z-50 text-[1.08rem]
                    transition-transform duration-300 ease-in-out w-80 flex flex-col
                    ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                <div className="px-8 pt-10 pb-7 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <div className="text-base font-semibold uppercase tracking-[0.22em] text-white/60 mb-1">
                            AICTE Portal
                        </div>
                        <div className="text-3xl font-semibold tracking-wide">
                            Admin Panel
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 px-5 pt-7 space-y-2 text-xl overflow-y-auto">
                    {ADMIN_NAV_ITEMS.map(item => (
                        <AdminSidebarItem
                            key={item.key}
                            label={item.label}
                            icon={item.icon}
                            active={item.key === activeKey}
                            onClick={() => {
                                navigate(item.path);
                                if (onClose) onClose();
                            }}
                            rightIcon={<Icons.ArrowRight />}
                        />
                    ))}
                </nav>

                {/* Bottom Section: Profile, Help, Logout */}
                <div className="px-5 pb-8 pt-6 border-t border-white/10 space-y-3 text-xl">
                    <AdminSidebarItem
                        label="Your Profile"
                        icon={<Icons.Profile />}
                        onClick={() => {
                            navigate("/admin/profile");
                            if (onClose) onClose();
                        }}
                        active={activeKey === "profile"}
                    />
                    <AdminSidebarItem
                        label="Help & Support"
                        icon={<Icons.Help />}
                        onClick={() => {
                            alert("Admin help module will open.");
                            if (onClose) onClose();
                        }}
                    />
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left text-red-100 hover:bg-red-700/50 hover:text-white font-semibold transition-all duration-150 text-lg"
                    >
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
