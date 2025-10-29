// resources/js/pages/Consultation/EmployeeProfile.tsx
import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
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
    Plus,
    MessageSquare
} from 'lucide-react';
import { getPatientById } from '../../data';
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';

const EmployeeProfile: React.FC = () => {
    // Get the id from Inertia's page props (passed from Laravel controller)
    const { props } = usePage();
    const id = (props as any).id as string;
    
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false); 
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('medicalHistory');
    const [showCreateOptions, setShowCreateOptions] = useState(false);

    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleLogout = (): void => {
        router.post('/logout');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // Get employee data from centralized mock data
    const employee = id ? getPatientById(id) : undefined;

    if (!employee || employee.type !== 'employee') {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-xl text-gray-600">Employee not found</p>
            </div>
        );
    }

    // Add the type annotation to fix the error
    const tabContent: Record<string, React.ReactNode> = {
        medicalHistory: (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#D4A5B8] text-black">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Condition</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Diagnosed</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employee.medicalHistory.map((item: any, index: number) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{item.condition}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{item.diagnosed}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ),
        consultations: (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#D4A5B8] text-black">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employee.consultations.map((item: any, index: number) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{item.date}</td>
                                <td className="px-6 py-4 text-sm text-black">{item.notes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ),
        remarks: (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#D4A5B8] text-black">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Note</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employee.remarks.map((item: any, index: number) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{item.date}</td>
                                <td className="px-6 py-4 text-sm text-black">{item.note}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ),
        additionalProfile: (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Last Name</p>
                        <p className="font-medium text-black">{employee.additionalProfile.lastName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">First Name</p>
                        <p className="font-medium text-black">{employee.additionalProfile.firstName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Middle Initial</p>
                        <p className="font-medium text-black">{employee.additionalProfile.middleInitial}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Suffix</p>
                        <p className="font-medium text-black">{employee.additionalProfile.suffix || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium text-black">{employee.additionalProfile.dateOfBirth}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Nationality/Citizenship</p>
                        <p className="font-medium text-black">{employee.additionalProfile.nationality}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Civil Status</p>
                        <p className="font-medium text-black">{employee.additionalProfile.civilStatus}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium text-black">{employee.additionalProfile.address}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Guardian's Name</p>
                        <p className="font-medium text-black">{employee.additionalProfile.guardianName || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Guardian's Contact Number</p>
                        <p className="font-medium text-black">{employee.additionalProfile.guardianContact || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Blood Type</p>
                        <p className="font-medium text-black">{employee.additionalProfile.bloodType}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Height</p>
                        <p className="font-medium text-black">{employee.additionalProfile.height}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Religion/Faith</p>
                        <p className="font-medium text-black">{employee.additionalProfile.religion}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Eye Color</p>
                        <p className="font-medium text-black">{employee.additionalProfile.eyeColor}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Chronic Condition(s)</p>
                        <p className="font-medium text-black">{employee.additionalProfile.chronicConditions.join(", ") || "None"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Known Allergies</p>
                        <p className="font-medium text-black">{employee.additionalProfile.knownAllergies.join(", ") || "None"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Disabilities</p>
                        <p className="font-medium text-black">{employee.additionalProfile.disabilities}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Immunization History</p>
                        <p className="font-medium text-black">{employee.additionalProfile.immunizationHistory.join(", ") || "None"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Genetic Conditions</p>
                        <p className="font-medium text-black">{employee.additionalProfile.geneticConditions}</p>
                    </div>
                </div>
            </div>
        )
    };

    const notifications: NotificationType[] = [
        { id: 1, type: 'info', message: 'New medicine stock added', isRead: false, createdAt: new Date().toISOString() },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isSearchOpen={isSearchOpen}
                setSearchOpen={setSearchOpen}
                isInventoryOpen={isInventoryOpen}
                setInventoryOpen={setInventoryOpen}
                handleNavigation={handleNavigation}
                handleLogout={handleLogout}
                activeMenu="search"
            />

            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 z-10">
                    <div className="flex items-center justify-between">
                        <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20"><Menu className="w-6 h-6" /></button>
                        <div className="flex items-center"><img src="/images/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/><h1 className="text-white text-[28px] font-semibold">UIC MediCare</h1></div>
                        <NotificationBell onSeeAll={() => handleNavigation('../Notification')} />
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto bg-white">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-black">Employee Profile: {employee.name}</h1>
                        <div>
                            <button
                                className="bg-[#A3386C] text-white p-2 rounded-full hover:bg-[#77536A]"
                                onClick={() => handleNavigation(`/consultation/employee/${id}/create`)}
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                        {/* Employee Info */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-black mb-4">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium text-black">{employee.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Age</p>
                                    <p className="font-medium text-black">{employee.age}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Gender</p>
                                    <p className="font-medium text-black">{employee.gender}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Department</p>
                                    <p className="font-medium text-black">{employee.department}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Position</p>
                                    <p className="font-medium text-black">{employee.position}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Contact</p>
                                    <p className="font-medium text-black">{employee.contact}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="font-medium text-black">{employee.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Create Options Card (Main Content) */}
                        {showCreateOptions && (
                            <div className="mb-8 flex justify-center">
                                <div className="w-full max-w-2xl bg-white rounded-lg shadow-md border border-gray-200 p-6">
                                    <h2 className="text-xl font-semibold text-black mb-4">Create Consultation</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            className="w-full bg-[#A3386C] text-white py-3 rounded-lg hover:bg-[#77536A]"
                                            onClick={() => handleNavigation(`/consultation/employee/${id}/walk-in`)}
                                        >
                                            Walk-in
                                        </button>
                                        <button
                                            className="w-full bg-white text-[#A3386C] border border-[#A3386C] py-3 rounded-lg hover:bg-[#f9f5f6]"
                                            onClick={() => handleNavigation(`/consultation/employee/${id}/scheduled`)}
                                        >
                                            Scheduled
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tabbed Interface */}
                        <div className="mb-8">
                            <div className="flex space-x-4 mb-4">
                                <button
                                    className={`px-4 py-2 rounded-lg ${activeTab === 'medicalHistory' ? 'bg-[#D4A5B8] text-black' : 'hover:bg-[#D4A5B8] text-black'}`}
                                    onClick={() => setActiveTab('medicalHistory')}
                                >
                                    Medical History
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg ${activeTab === 'consultations' ? 'bg-[#D4A5B8] text-black' : 'hover:bg-[#D4A5B8] text-black'}`}
                                    onClick={() => setActiveTab('consultations')}
                                >
                                    Past Consultations
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg ${activeTab === 'remarks' ? 'bg-[#D4A5B8] text-black' : 'hover:bg-[#D4A5B8] text-black'}`}
                                    onClick={() => setActiveTab('remarks')}
                                >
                                    Remark Records
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg ${activeTab === 'additionalProfile' ? 'bg-[#D4A5B8] text-black' : 'hover:bg-[#D4A5B8] text-black'}`}
                                    onClick={() => setActiveTab('additionalProfile')}
                                >
                                    Additional Profile
                                </button>
                            </div>
                            <div>{tabContent[activeTab]}</div>
                        </div>
                    </main>
                </div>
            </div>
    );
};

export default EmployeeProfile;