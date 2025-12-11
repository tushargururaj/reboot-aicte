import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import { getSystemAnalytics } from "../../utils/adminClient.js";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const ReportsAnalytics = ({ user, onLogout }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const data = await getSystemAnalytics();
            setStats(data);
            setLoading(false);
        };
        fetchStats();
    }, []);

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

    if (loading) {
        return (
            <AdminLayout
                user={user}
                onLogout={onLogout}
                title="Reports & Analytics"
                activeKey="reports"
            >
                <div className="p-8 text-center text-slate-500">
                    Loading analytics...
                </div>
            </AdminLayout>
        );
    }

    if (!stats) {
        return (
            <AdminLayout
                user={user}
                onLogout={onLogout}
                title="Reports & Analytics"
                activeKey="reports"
            >
                <div className="p-8 text-center text-red-500">
                    Failed to load analytics data.
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            user={user}
            onLogout={onLogout}
            title="Reports & Analytics"
            activeKey="reports"
        >
            <div className="flex flex-col gap-8">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-slate-500 font-medium uppercase text-xs tracking-wider">
                            Total Faculty
                        </h3>
                        <p className="text-3xl font-bold text-slate-900 mt-2">
                            {stats.totalFaculty}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-slate-500 font-medium uppercase text-xs tracking-wider">
                            Total Submissions
                        </h3>
                        <p className="text-3xl font-bold text-fuchsia-600 mt-2">
                            {stats.submissionCounts.reduce((acc, curr) => acc + curr.count, 0)}
                        </p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Bar Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-6">
                            Submissions by Category
                        </h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={stats.submissionCounts}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#8884d8" name="Submissions" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-6">
                            Distribution
                        </h3>
                        <div className="h-80 w-full flex justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.submissionCounts}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name} ${(percent * 100).toFixed(0)}%`
                                        }
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {stats.submissionCounts.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ReportsAnalytics;
