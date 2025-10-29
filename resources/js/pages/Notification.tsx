import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Menu, AlertTriangle, Check, X } from 'lucide-react';
import Swal from 'sweetalert2';
import Sidebar from '../components/Sidebar';
import NotificationBell, { Notification as NotificationType } from '../components/NotificationBell';
import { UserService } from '../services/userService';
import { NotificationService } from '../services/notificationService';
import { BranchInventoryService } from '../services/branchInventoryService';

// A more detailed interface for the full notification page
interface FullNotification {
    id: number | string;
    title: string;
    message: string;
    time: string;
    // In a real app, you might have an image URL or an icon component
    icon: React.ReactNode; 
    // optional metadata used for deduping and actions
    _meta?: { 
        source?: string; 
        requestId?: number | null; 
        referenceId?: number | null; 
        requestStatus?: string | null;
        fromBranchId?: number | null;
        toBranchId?: number | null;
    };
}

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


const Notification: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [dateTime, setDateTime] = useState<DateTimeData>(getCurrentDateTime());
    const [lowStockMedicines, setLowStockMedicines] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [bellNotifications, setBellNotifications] = useState<NotificationType[]>([]);
    const [fullNotifications, setFullNotifications] = useState<FullNotification[]>([]);
    // debug raw data removed

    // Check for low stock medicines by calling backend API
    const checkLowStockMedicines = async () => {
        try {
            setIsLoading(true);
            const currentUser = UserService.getCurrentUser();
            if (!currentUser || !currentUser.branch_id) return [];
            const low = await BranchInventoryService.getLowStockMedicinesMSSQL(currentUser.branch_id).catch(() => []);
            return Array.isArray(low) ? low : [];

        } catch (error) {
            console.error('Error checking low stock medicines:', error);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // Close dropdowns on mount and load notifications from backend
    // extract loadAll so it can be called after approve/reject actions as well
    const loadAll = async () => {
        const currentUser = UserService.getCurrentUser();
        if (!currentUser || !currentUser.branch_id) return;
        const branchId = currentUser.branch_id;

        try {
            // fetch low stock medicines from backend
            const lowStock = await checkLowStockMedicines().catch(() => []);
            setLowStockMedicines(lowStock);

            // fetch notifications for bell/full page
            const rows = await BranchInventoryService.getNotifications(branchId).catch(() => []);

            const bellNotifs = (rows || []).map((r: any) => ({
                id: r.notification_id ?? r.id ?? Math.random().toString(36).slice(2),
                type: (r.type === 'low_stock' ? 'warning' : (r.type === 'request' || r.type === 'request_approved' ? 'request' : 'info')) as any,
                message: r.message ?? '',
                isRead: !!r.is_read,
                createdAt: r.created_at ?? new Date().toISOString(),
                requestId: r.request_id ?? r.requestId ?? undefined,
                referenceId: r.reference_id ?? r.referenceId ?? r.medicine_id ?? undefined,
                requestStatus: r.request_status ?? r.requestStatus ?? undefined,
                fromBranchId: r.from_branch_id ?? undefined,
                toBranchId: r.to_branch_id ?? undefined,
            })) as NotificationType[];
            setBellNotifications(bellNotifs);

            // Build fullNotifications for the main page using the same data but with icons and titles
            const full = (bellNotifs || []).map(n => {
                let icon: React.ReactNode;
                let title = 'Notification';
                if (n.type === 'warning') { title = 'Low Stock Alert'; icon = <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-red-600" /></div>; }
                else if (n.type === 'success') { title = 'Success'; icon = <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center" />; }
                else if (n.type === 'request') { title = 'Branch Request'; icon = <img src="/images/nurse.jpg" alt="nurse" className="w-10 h-10 rounded-full object-cover" />; }
                else { title = 'Notification'; icon = <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-gray-600" /></div>; }

                const iso = (n as any).createdAt ? new Date((n as any).createdAt).toISOString() : new Date().toISOString();
                return {
                    id: n.id,
                    title,
                    message: n.message,
                    time: new Date((n as any).createdAt).toLocaleDateString(),
                    isoTime: iso,
                    icon,
                    _meta: { 
                        source: 'notification', 
                        requestId: (n as any).requestId ?? null, 
                        referenceId: (n as any).referenceId ?? null, 
                        requestStatus: (n as any).requestStatus ?? null,
                        fromBranchId: (n as any).fromBranchId ?? null,
                        toBranchId: (n as any).toBranchId ?? null
                    }
                } as any;
            });

            let combined: any[] = full.slice();

            // Additionally, fetch pending branch requests so they can be displayed as well
            const pending = await BranchInventoryService.getPendingBranchRequests(branchId).catch(() => []);
            if (Array.isArray(pending) && pending.length > 0) {
                const pendingNotifsRaw = pending.map((p: any) => ({
                    raw: p,
                    id: `req-${p.branch_request_id}`,
                    title: 'Branch Request',
                    message: `${p.requesting_branch_name ?? `Branch ${p.from_branch_id}`} requested ${p.quantity} unit${p.quantity > 1 ? 's' : ''} of ${p.medicine_name ?? `Medicine ${p.medicine_id}`}`,
                    time: new Date(p.created_at ?? Date.now()).toLocaleDateString(),
                    isoTime: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
                    icon: <img src="/images/nurse.jpg" alt="nurse" className="w-10 h-10 rounded-full object-cover" />,
                    _meta: { source: 'pending', requestId: p.branch_request_id ?? null, referenceId: p.medicine_id ?? null, requestStatus: p.request_status ?? p.status ?? p.requestStatus ?? null }
                } as any));

                const serverKeySet = new Set<string>();
                const serverNormalize = (it: any) => {
                    const rid = it._meta?.requestId ?? null;
                    if (rid) return `req:${rid}`;
                    const ref = it._meta?.referenceId ?? null;
                    if (ref) return `ref:${ref}`;
                    return null;
                };
                for (const it of combined) {
                    const k = serverNormalize(it);
                    if (k) serverKeySet.add(k);
                }

                const pendingNotifs = pendingNotifsRaw.filter((pn: any) => {
                    const k = serverNormalize(pn);
                    if (k && serverKeySet.has(k)) return false;
                    return true;
                });

                const normalizeKey = (it: any) => {
                    const rid = it._meta?.requestId ?? null;
                    if (rid) return `req:${rid}`;
                    const ref = it._meta?.referenceId ?? it.referenceId ?? null;
                    if (ref) return `ref:${ref}`;
                    return `msg:${(it.message || '').replace(/\s*\[req:\s*\d+\s*\]\s*/i, '').trim().toLowerCase()}`;
                };

                const map = new Map<string, any>();
                for (const it of combined) {
                    const k = normalizeKey(it);
                    if (!map.has(k)) map.set(k, it);
                }
                for (const it of pendingNotifs) {
                    const k = normalizeKey(it);
                    if (!map.has(k)) map.set(k, it);
                }

                combined = Array.from(map.values());
            }

            // Also fetch historical (approved/rejected) requests and merge them in
            const history = await BranchInventoryService.getBranchRequestHistory(branchId).catch(() => []);
            if (Array.isArray(history) && history.length > 0) {
                const currentUser = UserService.getCurrentUser();
                const currentBranchId = currentUser?.branch_id ?? null;
                const histNotifs = history.map((h: any) => {
                    // If current branch was the requester (from_branch_id), make the message personal
                    let message = `${h.requesting_branch_name ?? `Branch ${h.from_branch_id}`} requested ${h.quantity_requested} unit${h.quantity_requested > 1 ? 's' : ''} of ${h.medicine_name ?? `Medicine ${h.medicine_id}`}`;
                    if (currentBranchId && Number(h.from_branch_id) === Number(currentBranchId)) {
                        // Personalize message like: "Your request for 5 units of ALAXAN has been approved"
                        const statusText = (h.status ?? '').toLowerCase() === 'approved' ? 'approved' : ((h.status ?? '').toLowerCase() === 'rejected' ? 'rejected' : h.status ?? 'updated');
                        message = `Your request for ${h.quantity_requested} unit${h.quantity_requested > 1 ? 's' : ''} of ${h.medicine_name ?? `Medicine ${h.medicine_id}`} has been ${statusText}`;
                    } else if (currentBranchId && Number(h.to_branch_id) === Number(currentBranchId)) {
                        // If current branch was the approver/target, show a concise history message
                        message = `${h.requesting_branch_name ?? `Branch ${h.from_branch_id}`} requested ${h.quantity_requested} unit${h.quantity_requested > 1 ? 's' : ''} of ${h.medicine_name ?? `Medicine ${h.medicine_id}`} — ${h.status}`;
                    }

                        const iso = h.updated_at ? new Date(h.updated_at).toISOString() : (h.created_at ? new Date(h.created_at).toISOString() : new Date().toISOString());
                        return {
                            id: `hist-${h.branch_request_id}`,
                            title: 'Branch Request (Your Request)',
                            message,
                            time: new Date(h.updated_at ?? h.created_at ?? Date.now()).toLocaleDateString(),
                            isoTime: iso,
                            icon: <img src="/images/nurse.jpg" alt="nurse" className="w-10 h-10 rounded-full object-cover" />,
                            _meta: { source: 'history', requestId: h.branch_request_id ?? null, referenceId: h.medicine_id ?? null, requestStatus: h.status ?? null }
                        } as any;
                });

                const normalizeKey = (it: any) => {
                    const rid = it._meta?.requestId ?? null;
                    if (rid) return `req:${rid}`;
                    const ref = it._meta?.referenceId ?? it.referenceId ?? null;
                    if (ref) return `ref:${ref}`;
                    return `msg:${(it.message || '').replace(/\s*\[req:\s*\d+\s*\]\s*/i, '').trim().toLowerCase()}`;
                };

                const existingKeys = new Set<string>(combined.map(it => normalizeKey(it)));
                for (const hn of histNotifs) {
                    const k = normalizeKey(hn);
                    if (!existingKeys.has(k)) {
                        combined.push(hn);
                        existingKeys.add(k);
                    }
                }
            }

            // Sort combined by isoTime (newest first). If isoTime missing, fallback to Date parsing of time
            combined.sort((a: any, b: any) => {
                const ta = a.isoTime ? new Date(a.isoTime).getTime() : new Date(a.time).getTime();
                const tb = b.isoTime ? new Date(b.isoTime).getTime() : new Date(b.time).getTime();
                return tb - ta;
            });

            setFullNotifications(combined as FullNotification[]);
        } catch (err) {
            console.error('Error loading notifications', err);
        }
    };

    useEffect(() => { setSearchOpen(false); setInventoryOpen(false); loadAll(); }, []);

    // Handlers exposed to NotificationBell and full page
    const handleApproveRequest = async (requestId: number) => {
        const currentUser = UserService.getCurrentUser();
        if (!currentUser) return;
        try {
            const res = await BranchInventoryService.approveBranchRequest(requestId, currentUser.user_id);
            if (res && res.success) {
                Swal.fire({ icon: 'success', title: res.message || 'Approved', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
                await loadAll();
            } else {
                Swal.fire({ icon: 'error', title: res?.message || 'Failed to approve', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
            }
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Error approving request', text: err?.message || '', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
        }
    };

    const handleRejectRequest = async (requestId: number) => {
        const currentUser = UserService.getCurrentUser();
        if (!currentUser) return;
        try {
            const res = await BranchInventoryService.rejectBranchRequest(requestId, currentUser.user_id);
            if (res && res.success) {
                Swal.fire({ icon: 'success', title: res.message || 'Rejected', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
                await loadAll();
            } else {
                Swal.fire({ icon: 'error', title: res?.message || 'Failed to reject', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
            }
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Error rejecting request', text: err?.message || '', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
        }
    };

    // loadNotifications is handled by the useEffect above which queries the backend

    // Mark notifications as read: call backend and clear bell notifications
    const markNotificationsAsRead = async () => {
        try {
            const currentUser = UserService.getCurrentUser();
            if (!currentUser || !currentUser.branch_id) return;
            await BranchInventoryService.markNotificationsRead(currentUser.branch_id).catch(() => {});
            setBellNotifications([]);
        } catch (err) {
            console.error('Error marking notifications read', err);
        }
    };

    useEffect(() => {
        // Update time every second
        const timer = setInterval(() => {
            setDateTime(getCurrentDateTime());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

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

    const { date, time } = dateTime;

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
                activeMenu=""
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
                        {/* Notification Bell */}
                        <NotificationBell
                            notifications={bellNotifications}
                            onSeeAll={() => handleNavigation('/notification')}
                            onMarkAsRead={markNotificationsAsRead}
                            onApproveRequest={handleApproveRequest}
                            onRejectRequest={handleRejectRequest}
                        />
                    </div>
                </header>

                {/* Main Notification Container */}
                <main className="flex-1 p-6 overflow-y-auto bg-white">
                    {/* Page Title */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">Notification</h2>
                        <p className="text-gray-500 mt-1">Get notification what's the recent transaction</p>
                    </div>

                    {/* Notification List */}
                    <div className="max-w-4xl mx-auto">
                        <div className="space-y-4">
                            {fullNotifications.length > 0 ? (
                                fullNotifications.map(notification => (
                                    <div key={notification.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                {notification.icon}
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-md font-semibold text-gray-900">{notification.title}</p>
                                                <p className="text-sm text-gray-600">{notification.message}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p className="text-sm text-gray-400 whitespace-nowrap">{notification.time}</p>
                                            {/* Render approve/reject/receipt confirmation for request-type notifications */}
                                            {notification._meta && notification._meta.requestId && (
                                                (() => {
                                                    const id = Number(notification._meta.requestId);
                                                    const serverStatus = notification._meta.requestStatus ?? null;
                                                    const fromBranchId = notification._meta.fromBranchId ?? null;
                                                    const toBranchId = notification._meta.toBranchId ?? null;
                                                    
                                                    const currentUser = UserService.getCurrentUser();
                                                    const currentBranchId = currentUser?.branch_id ?? null;
                                                    
                                                    // Determine if current user is requester or supplier
                                                    const isRequester = currentBranchId === fromBranchId;
                                                    const isSupplier = currentBranchId === toBranchId;
                                                    
                                                    // SUPPLIER VIEW: Show Approve/Reject for pending, Approved badge for approved
                                                    if (isSupplier && serverStatus === 'pending') {
                                                        return (
                                                            <>
                                                                <button onClick={() => handleApproveRequest(id)} className="px-3 py-1 bg-green-600 text-white rounded-md text-sm flex items-center hover:bg-green-700">
                                                                    <Check className="w-4 h-4 mr-2" />Approve
                                                                </button>
                                                                <button onClick={() => handleRejectRequest(id)} className="px-3 py-1 bg-red-600 text-white rounded-md text-sm flex items-center hover:bg-red-700">
                                                                    <X className="w-4 h-4 mr-2" />Reject
                                                                </button>
                                                            </>
                                                        );
                                                    }
                                                    
                                                    if (isSupplier && serverStatus === 'approved') {
                                                        return <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm">Approved</span>;
                                                    }
                                                    
                                                    // REQUESTER VIEW: Show receipt confirmation buttons for approved
                                                    if (isRequester && serverStatus === 'approved') {
                                                        return (
                                                            <div className="flex gap-2">
                                                                <button 
                                                                    onClick={async () => {
                                                                        if (!currentUser) return;
                                                                        try {
                                                                            const res = await BranchInventoryService.confirmBranchRequestReceipt(id, true, currentUser.user_id);
                                                                            if (res && res.success) {
                                                                                Swal.fire({ icon: 'success', title: 'Receipt Confirmed', text: res.message, toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
                                                                                await loadAll();
                                                                            }
                                                                        } catch (err: any) {
                                                                            Swal.fire({ icon: 'error', title: 'Error', text: err?.message || '', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
                                                                        }
                                                                    }}
                                                                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm flex items-center hover:bg-blue-700"
                                                                >
                                                                    <Check className="w-4 h-4 mr-2" />Yes, received
                                                                </button>
                                                                <button 
                                                                    onClick={async () => {
                                                                        if (!currentUser) return;
                                                                        try {
                                                                            const res = await BranchInventoryService.confirmBranchRequestReceipt(id, false, currentUser.user_id);
                                                                            if (res && res.success) {
                                                                                Swal.fire({ icon: 'success', title: 'Request Cancelled', text: res.message, toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
                                                                                await loadAll();
                                                                            }
                                                                        } catch (err: any) {
                                                                            Swal.fire({ icon: 'error', title: 'Error', text: err?.message || '', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
                                                                        }
                                                                    }}
                                                                    className="px-3 py-1 bg-gray-400 text-white rounded-md text-sm flex items-center hover:bg-gray-500"
                                                                >
                                                                    <X className="w-4 h-4 mr-2" />No, Cancel
                                                                </button>
                                                            </div>
                                                        );
                                                    }
                                                    
                                                    // REQUESTER VIEW: Show Received badge for completed
                                                    if (isRequester && serverStatus === 'completed') {
                                                        return <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">Received</span>;
                                                    }
                                                    
                                                    // REQUESTER VIEW: Show Cancelled badge
                                                    if (isRequester && serverStatus === 'cancelled') {
                                                        return <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm">Cancelled</span>;
                                                    }
                                                    
                                                    // Show rejected badge for both parties
                                                    if (serverStatus === 'rejected') {
                                                        return <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm">Rejected</span>;
                                                    }
                                                    
                                                    return null;
                                                })()
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No notifications to display.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* raw DB inspection UI removed */}
                </main>
            </div>
        </div>
    );
};

export default Notification;