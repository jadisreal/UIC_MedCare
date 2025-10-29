import React, { useState, useEffect } from 'react';
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import { router } from '@inertiajs/react';
import { AlertTriangle, Menu, Package, Minus, Calendar } from 'lucide-react';
import { BranchInventoryService, BranchStockSummary, MedicineStockIn } from '../../services/branchInventoryService';
import { UserService } from '../../services/userService';

interface DateTimeData {
    date: string;
    time: string;
}

interface SoonToExpireMedicine {
    medicine_name: string;
    expiration_date: string;
    days_until_expiry: number;
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

const MeditrackDashboard: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(true);
    const [isNotificationOpen, setNotificationOpen] = useState(false);
    const [dateTime, setDateTime] = useState<DateTimeData>(getCurrentDateTime());
    const [lowStockMedicines, setLowStockMedicines] = useState<BranchStockSummary[]>([]);
    const [soonToExpireMedicines, setSoonToExpireMedicines] = useState<SoonToExpireMedicine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingExpiry, setIsLoadingExpiry] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // NotificationBell will fetch notifications itself

    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(getCurrentDateTime());
        }, 1000);

        // Load current user
        const user = UserService.getCurrentUser();
        if (!user) {
            router.visit('/');
            return;
        }
        setCurrentUser(user);

        // Cleanup interval on component unmount
        return () => {
            clearInterval(timer);
        };
    }, []);

    // Load low stock medicines when user is available
    useEffect(() => {
        if (currentUser) {
            loadLowStockMedicines();
            loadSoonToExpireMedicines();
        }
    }, [currentUser]);

    const loadLowStockMedicines = async () => {
        try {
            setIsLoading(true);
            // Use the backend API that aggregates total quantities per medicine
            const lowStockData = await BranchInventoryService.getLowStockMedicinesMSSQL(currentUser.branch_id);
            
            // Sort by quantity (lowest first) and take top 5
            const sortedLowStock = lowStockData
                .sort((a, b) => a.quantity - b.quantity)
                .slice(0, 5);

            setLowStockMedicines(sortedLowStock);
        } catch (error) {
            console.error('Error loading low stock medicines:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadSoonToExpireMedicines = async () => {
        try {
            setIsLoadingExpiry(true);
            const expiringMedicines = await BranchInventoryService.getSoonToExpireMedicinesMSSQL(currentUser.branch_id);
            
            // Take the top 5 most urgent medicines
            const sortedExpiring = expiringMedicines
                .sort((a, b) => a.days_until_expiry - b.days_until_expiry)
                .slice(0, 5);

            setSoonToExpireMedicines(sortedExpiring);
        } catch (error) {
            console.error('Error loading soon to expire medicines:', error);
        } finally {
            setIsLoadingExpiry(false);
        }
    };

    const { date, time } = dateTime;

    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleLogout = (): void => {
        localStorage.removeItem("isLoggedIn");
        router.visit("/");
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const toggleNotification = () => {
        setNotificationOpen(!isNotificationOpen);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isSearchOpen={isSearchOpen}
                setSearchOpen={setSearchOpen}
                isInventoryOpen={isInventoryOpen}
                setInventoryOpen={setInventoryOpen}
                handleNavigation={handleNavigation}
                handleLogout={handleLogout}
                activeMenu="inventory-dashboard"
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 z-10">
                    <div className="flex items-center justify-between">
                        {/* Sidebar Toggle Button */}
                        <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center">
                            <img src="/images/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/>
                            <h1 className="text-white text-[28px] font-semibold">UIC MediCare</h1>
                        </div>
                        {/* Notification Bell */}
                        <NotificationBell onSeeAll={() => handleNavigation('../Notification')} />
                    </div>
                </header>

                {/* Main Dashboard */}
                <main className="bg-white main-dashboard p-6 flex-1 overflow-hidden">
                    {/* Date and Time */}
                    <div className="flex justify-center mb-4">
                        <div className="flex flex-col items-center">
                            <p className="text-[22px] font-normal text-black">{date}</p>
                            <p className="text-[17px] text-base text-gray-500 mt-1">{time}</p>
                            <div className="w-[130px] h-0.5 mt-3 bg-[#A3386C]"></div>
                        </div>
                    </div>

                    {/* Dashboard Title */}
                    <div className="mb-6">
                        <h2 className="font-normal text-black text-[26px]">Dashboard</h2>
                    </div>
                    <div className="w-full h-px bg-[#A3386C] mb-6"></div>

                    {/* Dashboard Content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                            {/* Left Column */}
                            <div className="flex flex-col space-y-4 min-h-0">
                                {/* Soon-to-Expire Medicines (Top 5 vertical list) */}
                                <div className="border border-[#A3386C] bg-white flex-1 flex flex-col min-h-0">
                                    <div className="p-4 border-b border-[#A3386C] flex-shrink-0">
                                        <h3 className="font-normal text-black text-base text-center flex items-center justify-center">
                                            <Calendar className="w-4 h-4 mr-2 text-[#A3386C]" />
                                            Soon-to-Expire Medications
                                        </h3>
                                        <p className="font-light text-gray-600 text-xs text-center mt-2">Most urgent expiries within 30 days</p>
                                    </div>
                                    <div className="flex-1 p-2 overflow-y-auto">
                                        {isLoadingExpiry ? (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3386C]"></div>
                                            </div>
                                        ) : soonToExpireMedicines.length > 0 ? (
                                            <div className="space-y-2 p-3 pb-3">
                                                {soonToExpireMedicines.slice(0,5).map((medicine, index) => (
                                                    <div key={`${medicine.medicine_name}-${index}`} className="flex items-center justify-between py-5 px-4 bg-orange-50 border border-orange-200 rounded-md h-13">
                                                        <div className="flex items-center flex-1 min-w-0 overflow-hidden">
                                                            <div className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-semibold mr-3 flex-shrink-0">
                                                                {index + 1}
                                                            </div>
                                                            <div className="min-w-0 overflow-hidden">
                                                                <p className="font-medium text-gray-900 text-sm truncate" title={medicine.medicine_name}>
                                                                    {medicine.medicine_name}
                                                                </p>
                                                                <p className="text-xs text-gray-500 truncate">Expires: {new Date(medicine.expiration_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right ml-3 flex-shrink-0 w-20">
                                                            <div className="flex items-center justify-end">
                                                                <Calendar className="w-3.5 h-3.5 text-orange-600 mr-1" />
                                                                <span className="font-bold text-orange-600 text-base">{medicine.days_until_expiry}</span>
                                                            </div>
                                                            <span className="text-[11px] text-gray-500 block">{medicine.days_until_expiry === 0 ? 'expires today' : (medicine.days_until_expiry === 1 ? 'day left' : 'days left')}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                                <Calendar className="w-10 h-10 text-gray-300 mb-2" />
                                                <p className="text-base font-medium mb-1">No medicines expiring soon!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Top 5 Medicines Need Reorder */}
                            <div className="flex flex-col min-h-0">
                                <div className="border border-[#A3386C] bg-white flex-1 flex flex-col min-h-0">
                                    <div className="p-4 border-b border-[#A3386C] flex-shrink-0">
                                        <h3 className="font-normal text-black text-base text-center flex items-center justify-center">
                                            <Package className="w-4 h-4 mr-2 text-[#A3386C]" />
                                            Medicines Need Reorder
                                        </h3>
                                        <p className="font-light text-gray-600 text-xs text-center mt-2">Stock Level ≤ 50 units</p>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center h-32">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3386C]"></div>
                                            </div>
                                        ) : lowStockMedicines.length > 0 ? (
                                            <div className="space-y-2 p-3 pb-3">
                                                {lowStockMedicines.slice(0,5).map((medicine, index) => (
                                                    <div key={medicine.medicine_id} className="flex items-center justify-between py-2 px-3 bg-red-50 border border-red-200 rounded-md">
                                                        <div className="flex items-center flex-1 min-w-0">
                                                            <div className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-semibold mr-3 flex-shrink-0">
                                                                {index + 1}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-medium text-gray-900 text-sm truncate" title={medicine.medicine_name}>
                                                                    {medicine.medicine_name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">{medicine.medicine_category}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right ml-3 flex-shrink-0">
                                                            <div className="flex items-center">
                                                                <Minus className="w-3.5 h-3.5 text-red-600 mr-1" />
                                                                <span className="font-bold text-red-600 text-base">{medicine.quantity}</span>
                                                            </div>
                                                            <span className="text-[11px] text-gray-500">units left</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                                                <Package className="w-12 h-12 text-gray-300 mb-2" />
                                                <p className="text-sm font-medium">All medicines are well stocked!</p>
                                                <p className="text-xs">No medicines need reordering at this time.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MeditrackDashboard;