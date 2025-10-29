// resources/js/pages/Consultation/WalkIn.tsx
import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ChevronLeft, Menu } from 'lucide-react';
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import { getPatientById, addConsultation, addRemark } from '../../data';

const WalkIn: React.FC = () => {
    const { props } = usePage();
    const id = (props as any).id as string;

    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);

    // Form states
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [referToDoctor, setReferToDoctor] = useState(false);
    const [bloodPressure, setBloodPressure] = useState('');
    const [pulse, setPulse] = useState('');
    const [temperature, setTemperature] = useState('');
    const [weight, setWeight] = useState('');
    const [lastMenstrualPeriod, setLastMenstrualPeriod] = useState('');
    const [complaints, setComplaints] = useState('');
    const [remarks, setRemarks] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [patient, setPatient] = useState<any>(null);

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            setDate(now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }));
            setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
        };
        updateDateTime();
        const timer = setInterval(updateDateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (id) {
            const p = getPatientById(id);
            if (p) setPatient(p);
        }
    }, [id]);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
    const handleNavigation = (path: string) => router.visit(path);
    const handleLogout = () => router.post('/logout');
    const handleBack = () => window.history.back();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !patient) return;

        const consultationRecord = { date: date || new Date().toISOString(), notes: complaints };
        const remarkRecord = { date: date || new Date().toISOString(), note: remarks || `BP: ${bloodPressure}, Pulse: ${pulse}, Temp: ${temperature}°C, Weight: ${weight}kg${referToDoctor ? ', Referred to Doctor' : ''}` };

        addConsultation(id, consultationRecord);
        addRemark(id, remarkRecord);

        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            if (patient.type === 'student') router.visit(`/consultation/student/${id}`);
            else router.visit(`/consultation/employee/${id}`);
        }, 2000);
    };

    const notifications: NotificationType[] = [
        { id: 1, type: 'info', message: 'Consultation Submitted', isRead: false, createdAt: new Date().toISOString() },
    ];

    if (!patient) return (<div className="flex h-screen items-center justify-center"><p className="text-xl text-gray-600">Patient not found</p></div>);

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
                        <div className="flex items-center">
                            <button onClick={handleBack} className="text-white p-2 rounded-full hover:bg-white/20 mr-3"><ChevronLeft className="w-6 h-6" /></button>
                            <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20"><Menu className="w-6 h-6" /></button>
                        </div>
                        <div className="flex items-center"><img src="/images/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/><h1 className="text-white text-[28px] font-semibold">UIC MediCare</h1></div>
                        <NotificationBell onSeeAll={() => router.visit('../Notification')} />
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto bg-white">
                    <div className="flex items-center mb-6">
                        <h1 className="text-3xl font-bold text-black">Walk-in Consultation - {patient.name}</h1>
                    </div>

                    {showSuccess && (
                        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">Consultation Submitted!</div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-black text-sm font-bold mb-2">Date</label>
                                <input type="text" value={date} readOnly className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-black" />
                            </div>
                            <div>
                                <label className="block text-black text-sm font-bold mb-2">Time</label>
                                <input type="text" value={time} readOnly className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-black" />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="flex items-center">
                                <input type="checkbox" checked={referToDoctor} onChange={(e) => setReferToDoctor(e.target.checked)} className="w-5 h-5 text-[#A3386C] rounded focus:ring-[#A3386C]" />
                                <span className="ml-2 text-black font-bold">Refer to Doctor?</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-black text-sm font-bold mb-2">Blood Pressure</label>
                                <input type="text" value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3386C] text-black" placeholder="e.g., 120/80" />
                            </div>
                            <div>
                                <label className="block text-black text-sm font-bold mb-2">Pulse (BPM)</label>
                                <input type="number" value={pulse} onChange={(e) => setPulse(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3386C] text-black" placeholder="e.g., 72" />
                            </div>
                            <div>
                                <label className="block text-black text-sm font-bold mb-2">Temperature (°C)</label>
                                <input type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3386C] text-black" placeholder="e.g., 36.5" />
                            </div>
                            <div>
                                <label className="block text-black text-sm font-bold mb-2">Weight (kg)</label>
                                <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3386C] text-black" placeholder="e.g., 65.5" />
                            </div>
                        </div>

                        {patient.gender === 'Female' && (
                            <div className="mb-6">
                                <label className="block text-black text-sm font-bold mb-2">Last Menstrual Period</label>
                                <input type="date" value={lastMenstrualPeriod} onChange={(e) => setLastMenstrualPeriod(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3386C] text-black" />
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-black text-sm font-bold mb-2">Complaints</label>
                            <textarea value={complaints} onChange={(e) => setComplaints(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3386C] text-black" rows={3} required />
                        </div>

                        <div className="mb-6">
                            <label className="block text-black text-sm font-bold mb-2">Remarks</label>
                            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3386C] text-black" rows={3} />
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="bg-[#A3386C] text-white px-6 py-3 rounded-lg hover:bg-[#77536A] font-semibold">Submit</button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default WalkIn;
