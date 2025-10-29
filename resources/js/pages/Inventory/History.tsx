import React, { useState, useEffect } from 'react';
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import { router } from '@inertiajs/react';
import { UserService } from '../../services/userService';
import { NotificationService } from '../../services/notificationService';
import { HistoryLogService, HistoryLog } from '../../services/HistoryLogService';
import {
    History as HistoryIcon,
    Search,
    Menu,
    Plus,
    Minus,
    Package,
    Archive,
    RefreshCcw,
    Activity,
    Calendar,
    Clock,
    User,
    Trash2
} from 'lucide-react';

const History: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Load current user
    useEffect(() => {
        const user = UserService.getCurrentUser();
        if (!user) {
            router.visit('/');
            return;
        }
        setCurrentUser(user);
    }, []);

    // Load history data from database
    const loadHistoryData = async () => {
        try {
            setIsLoading(true);
            
            if (!currentUser) return;

            console.log('Loading history log data for branch:', currentUser.branch_id);

            // Fetch history logs from the database
            const logs = await HistoryLogService.getBranchHistoryLogs(currentUser.branch_id, 200);
            setHistoryLogs(logs);
            console.log('Loaded history logs:', logs.length);

        } catch (error) {
            console.error('Error loading history data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) {
            loadHistoryData();
        }
    }, [currentUser]);

    // NotificationBell handles loading and marking notifications; local dummy data removed

    // Filter and sort the history logs
    const getFilteredAndSortedHistoryLogs = () => {
        let filtered = historyLogs
            .filter(log =>
                (log.medicine_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.activity || '').toLowerCase().includes(searchTerm.toLowerCase())
            );

        if (sortBy === 'date') {
            filtered = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sortBy === 'medicine') {
            filtered = filtered.sort((a, b) => (a.medicine_name || '').localeCompare(b.medicine_name || ''));
        } else if (sortBy === 'quantity') {
            filtered = filtered.sort((a, b) => b.quantity - a.quantity);
        } else if (sortBy === 'activity') {
            filtered = filtered.sort((a, b) => a.activity.localeCompare(b.activity));
        }

        return filtered;
    };

    // Pagination logic
    const getPaginatedHistoryLogs = () => {
        const filtered = getFilteredAndSortedHistoryLogs();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filtered.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(getFilteredAndSortedHistoryLogs().length / itemsPerPage);

    // Reset to page 1 when search term or sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortBy]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Get activity icon and color
    const getActivityIcon = (activity: string) => {
        switch (activity) {
            case 'dispensed':
                return <Minus className="w-4 h-4 text-blue-600" />;
            case 'restocked':
                return <RefreshCcw className="w-4 h-4 text-orange-600" />;
            case 'added':
                return <Plus className="w-4 h-4 text-green-600" />;
            case 'removed':
                return <Trash2 className="w-4 h-4 text-red-600" />;
            default:
                return <Package className="w-4 h-4 text-gray-600" />;
        }
    };

    // Get activity label
    const getActivityLabel = (activity: string) => {
        switch (activity) {
            case 'dispensed':
                return 'Dispensed';
            case 'restocked':
                return 'Restocked';
            case 'added':
                return 'Added';
            case 'removed':
                return 'Removed';
            default:
                return 'Unknown';
        }
    };

    // Get activity color class
    const getActivityColorClass = (activity: string) => {
        switch (activity) {
            case 'dispensed':
                return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300';
            case 'restocked':
                return 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300';
            case 'added':
                return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300';
            case 'removed':
                return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300';
            default:
                return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
        }
    };

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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value);
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
                activeMenu="inventory-history"
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 z-10">
                    <div className="flex items-center justify-between">
                        <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center">
                            <img src="/images/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/>
                            <h1 className="text-white text-[28px] font-semibold">UIC MediCare</h1>
                        </div>
                        {/* Notification Bell (self-fetching) */}
                        <NotificationBell onSeeAll={() => handleNavigation('../Notification')} />
                    </div>
                </header>

                {/* Main History Container */}
                <main className="flex-1 flex flex-col p-6 overflow-hidden bg-white">
                    {/* Activity Summary Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <Plus className="w-8 h-8 text-green-600 mr-3" />
                                <div>
                                    <h3 className="text-lg font-medium text-green-800">Added</h3>
                                    <p className="text-2xl font-bold text-green-900">
                                        {historyLogs.filter(h => h.activity === 'added').length}
                                    </p>
                                    <p className="text-sm text-green-600">New medicines added</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <RefreshCcw className="w-8 h-8 text-orange-600 mr-3" />
                                <div>
                                    <h3 className="text-lg font-medium text-orange-800">Restocked</h3>
                                    <p className="text-2xl font-bold text-orange-900">
                                        {historyLogs.filter(h => h.activity === 'restocked').length}
                                    </p>
                                    <p className="text-sm text-orange-600">Medicine inventory restocked</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <Minus className="w-8 h-8 text-blue-600 mr-3" />
                                <div>
                                    <h3 className="text-lg font-medium text-blue-800">Dispensed</h3>
                                    <p className="text-2xl font-bold text-blue-900">
                                        {historyLogs.filter(h => h.activity === 'dispensed').length}
                                    </p>
                                    <p className="text-sm text-blue-600">Medicines dispensed to patients</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <Trash2 className="w-8 h-8 text-red-600 mr-3" />
                                <div>
                                    <h3 className="text-lg font-medium text-red-800">Removed</h3>
                                    <p className="text-2xl font-bold text-red-900">
                                        {historyLogs.filter(h => h.activity === 'removed').length}
                                    </p>
                                    <p className="text-sm text-red-600">Medicines permanently removed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Page Title and Filters */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-normal text-black">Activity History</h2>
                            <p className="text-gray-600 text-sm">Complete inventory activity log from history_log database</p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={loadHistoryData}
                                disabled={isLoading}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-[#A3386C] disabled:opacity-50"
                            >
                                <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <div className="relative">
                                <select 
                                    value={sortBy}
                                    onChange={handleSortChange}
                                    className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#A3386C] focus:border-[#A3386C] text-black bg-white"
                                >
                                    <option value="date">Date (Newest First)</option>
                                    <option value="medicine">Medicine Name (A-Z)</option>
                                    <option value="quantity">Quantity (High to Low)</option>
                                    <option value="activity">Activity Type</option>
                                </select>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search Medicine or Activity"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a3386c] focus:border-transparent text-sm text-black placeholder-gray-500 bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-gray-500">Loading activity history...</div>
                        </div>
                    )}

                    {/* History Table */}
                    {!isLoading && (
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="bg-white rounded-lg shadow-md border border-gray-200 flex-1 flex flex-col overflow-hidden">
                                {/* Table Header - Fixed */}
                                <div className="flex-shrink-0 border-b border-gray-200">
                                    <table className="min-w-full">
                                        <thead className="bg-[#F9E7F0] text-black">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider w-1/5">DATE & TIME</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider w-1/6">ACTIVITY</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider w-1/4">MEDICINE NAME</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider w-1/6">QUANTITY</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider w-1/3 max-w-xs">DESCRIPTION</th>
                                            </tr>
                                        </thead>
                                    </table>
                                </div>
                                
                                {/* Table Body - Scrollable */}
                                <div className="flex-1 overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    <table className="min-w-full">
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {getPaginatedHistoryLogs().map((log: HistoryLog, index: number) => (
                                                <tr key={log.history_id} className="hover:bg-gray-50 transition-colors duration-200">
                                                    <td className="px-6 py-4 text-sm text-gray-900 w-1/5">
                                                        <div>
                                                            <div className="font-medium">
                                                                {new Date(log.created_at).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {new Date(log.created_at).toLocaleTimeString('en-US', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm w-1/6">
                                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getActivityColorClass(log.activity)}`}>
                                                            {getActivityIcon(log.activity)}
                                                            <span className="ml-2 font-medium">{getActivityLabel(log.activity)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 w-1/4">
                                                        <div className="truncate" title={log.medicine_name || 'Unknown Medicine'}>
                                                            {log.medicine_name || 'Unknown Medicine'}
                                                        </div>
                                                        {log.medicine_category && (
                                                            <div className="text-xs text-gray-500">{log.medicine_category}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 w-1/6">
                                                        <span className="font-medium">{log.quantity}</span> units
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 w-1/3 max-w-xs">
                                                        <div className="truncate max-w-xs" title={log.description}>
                                                            {log.description}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {getFilteredAndSortedHistoryLogs().length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                                                        <div className="flex flex-col items-center space-y-2">
                                                            <Package className="w-8 h-8 text-gray-400" />
                                                            <span>{isLoading ? 'Loading your activities...' : 'No activity history found matching your search criteria.'}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Pagination Controls */}
                                {getFilteredAndSortedHistoryLogs().length > itemsPerPage && (
                                    <div className="flex-shrink-0 px-4 py-3 bg-gray-50 border-t border-gray-200">
                                        <div className="flex justify-center items-center space-x-2">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Previous
                                            </button>
                                            
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-4 py-2 border rounded-md transition-colors ${
                                                        currentPage === page
                                                            ? 'bg-[#a3386c] text-white border-[#a3386c]'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                            
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Next
                                            </button>
                                            
                                            <span className="text-sm text-gray-600 ml-4">
                                                Page {currentPage} of {totalPages} | Showing {getPaginatedHistoryLogs().length} of {getFilteredAndSortedHistoryLogs().length} activities
                                            </span>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Optional: Record count indicator */}
                                {getFilteredAndSortedHistoryLogs().length <= itemsPerPage && (
                                    <div className="flex-shrink-0 px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                                        Showing {getFilteredAndSortedHistoryLogs().length} of {historyLogs.length} activities
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default History;