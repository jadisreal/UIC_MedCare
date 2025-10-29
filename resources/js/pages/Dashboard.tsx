import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Sidebar from '../components/Sidebar';
import NotificationBell, { Notification as NotificationType } from '../components/NotificationBell';
import {
    Bell,
    User,
    LayoutDashboard,
    Archive,
    FileText,
    History,
    ShieldQuestion,
    Search,
    Printer,
    GraduationCap,
    Briefcase,
    ChevronDown,
    Menu,
    Users,
    Stethoscope,
    Calendar,
    MessageSquare
} from 'lucide-react';
import { getStudents, getEmployees } from '../data/mockData';

interface DateTimeData {
    date: string;
    time: string;
}

function getCurrentDateTime(): DateTimeData {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const time = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    return { date, time };
}

const Dashboard: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [dateTime, setDateTime] = useState<DateTimeData>(getCurrentDateTime());

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(getCurrentDateTime());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const { date, time } = dateTime;

    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleLogout = (): void => {
        router.post('/logout');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // Get patient counts
    const students = getStudents();
    const employees = getEmployees();
    const totalPatients = students.length + employees.length;

    // Recent activity mock data
    const recentActivities = [
        { 
            id: 1, 
            patient: "Juan Dela Cruz", 
            type: "Walk-in Consultation", 
            time: "10:30 AM", 
            status: "Completed" 
        },
        { 
            id: 2, 
            patient: "Maria Santos", 
            type: "Scheduled Consultation", 
            time: "9:15 AM", 
            status: "Completed" 
        },
        { 
            id: 3, 
            patient: "Dr. Roberto Garcia", 
            type: "Follow-up", 
            time: "Yesterday", 
            status: "Pending" 
        }
    ];

    // NotificationBell will fetch notifications itself; no local dummy data needed

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar component */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isSearchOpen={isSearchOpen}
                setSearchOpen={setSearchOpen}
                isInventoryOpen={isInventoryOpen}
                setInventoryOpen={setInventoryOpen}
                handleNavigation={handleNavigation}
                handleLogout={handleLogout}
                activeMenu="dashboard"
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 z-10">
                    <div className="flex items-center justify-between">
                        <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20"><Menu className="w-6 h-6" /></button>
                    <div className="flex items-center"><img src="/images/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/><h1 className="text-white text-[28px] font-semibold">MEDICARE</h1></div>
                    <div className="flex items-center"><NotificationBell onSeeAll={() => handleNavigation('../Notification')} /></div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 p-6 overflow-y-auto bg-white">
                    <div className="flex flex-col items-center mb-8">
                        <p className="text-[22px] font-normal text-black">{date}</p>
                        <p className="text-[17px] text-base text-gray-500 mt-1">{time}</p>
                        <div className="w-[130px] h-0.5 mt-3 bg-[#A3386C]"></div>
                    </div>

                    <h1 className="text-5xl font-bold text-black mb-8">Dashboard</h1>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-800">{totalPatients}</p>
                                    <p className="text-gray-600">Total Patients</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-100 text-green-600">
                                    <Stethoscope className="w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-800">2</p>
                                    <p className="text-gray-600">Today's Consultations</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-800">1</p>
                                    <p className="text-gray-600">Pending Appointments</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Test Section removed per user request */}

                    {/* Current Consultations */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-normal text-black mb-4">Current Consultations:</h2>
                        <div className="space-y-4">
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center">
                                <p className="text-4xl font-bold text-[#A3386C] mr-4">0</p>
                                <p className="text-xl text-gray-700">Walk-in/Scheduled Consultation</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center">
                                <p className="text-4xl font-bold text-[#A3386C] mr-4">0</p>
                                <p className="text-xl text-gray-700">Referred Consultation</p>
                            </div>
                        </div>
                    </section>

                    {/* Recent Activity */}
                    <section>
                        <h2 className="text-2xl font-normal text-black mb-4">Recent Activity:</h2>
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentActivities.map((activity) => (
                                        <tr key={activity.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.patient}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.time}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    activity.status === 'Completed' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {activity.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;