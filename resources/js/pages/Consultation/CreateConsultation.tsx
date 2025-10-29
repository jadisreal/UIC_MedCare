// resources/js/pages/Consultation/CreateConsultation.tsx
import React from 'react';
import { router, usePage } from '@inertiajs/react';
import { ChevronLeft, Menu } from 'lucide-react';
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import { addConsultation, getPatientById } from '../../data';

const CreateConsultation: React.FC = () => {
    const { props } = usePage();
    const id = (props as any).id as string;

    const [isSidebarOpen, setSidebarOpen] = React.useState(true);
    const [isSearchOpen, setSearchOpen] = React.useState(false);
    const [isInventoryOpen, setInventoryOpen] = React.useState(false);
    const [consultationText, setConsultationText] = React.useState('');

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
    const handleBack = () => window.history.back();

    const handleSave = () => {
        addConsultation(id, {
            date: new Date().toISOString(),
            notes: consultationText,
        });
        router.visit(`/consultation/student/${id}`);
    };

    const handleWalkIn = () => {
        // Determine whether this is a student or employee and navigate to the proper "create/walk-in" route
        const patient = getPatientById(id);
        const base = patient && patient.type === 'employee' ? `/consultation/employee/${id}/create` : `/consultation/student/${id}/create`;
        router.visit(`${base}/walk-in`);
    };

    const handleScheduled = () => {
        const patient = getPatientById(id);
        const base = patient && patient.type === 'employee' ? `/consultation/employee/${id}/create` : `/consultation/student/${id}/create`;
        router.visit(`${base}/scheduled`);
    };

    const notifications: NotificationType[] = [
        { id: 1, type: 'info', message: 'Consultation saved', isRead: false, createdAt: new Date().toISOString() },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isSearchOpen={isSearchOpen}
                setSearchOpen={setSearchOpen}
                isInventoryOpen={isInventoryOpen}
                setInventoryOpen={setInventoryOpen}
                handleNavigation={(p) => router.visit(p)}
                handleLogout={() => router.post('/logout')}
                activeMenu="search"
            />

            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 z-10">
                    <div className="flex items-center justify-between">
                        <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20"><Menu className="w-6 h-6" /></button>
                        <div className="flex items-center"><img src="/images/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/><h1 className="text-white text-[28px] font-semibold">UIC MediCare</h1></div>
                        <NotificationBell onSeeAll={() => router.visit('../Notification')} />
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto bg-white">
                    <div className="flex items-center mb-6">
                        <button className="mr-4 text-gray-600 hover:text-black" onClick={handleBack}>
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-semibold">Create Consultation Record</h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-black mb-4">Consultation Type:</h2>
                        <div className="space-y-4">
                            <button
                                className="bg-[#A3386C] text-white p-4 rounded-lg hover:bg-[#77536A] w-full"
                                onClick={handleWalkIn}
                            >
                                Walk-in
                            </button>
                            <button
                                className="bg-[#A3386C] text-white p-4 rounded-lg hover:bg-[#77536A] w-full"
                                onClick={handleScheduled}
                            >
                                Scheduled
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CreateConsultation;