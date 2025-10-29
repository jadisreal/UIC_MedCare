import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, X, Check } from 'lucide-react';
import Swal from 'sweetalert2';
import { BranchInventoryService } from '../services/branchInventoryService';
import ReactDOM from 'react-dom';
import { UserService } from '../services/userService';
import { NotificationService } from '../services/notificationService';

export interface Notification {
    id: number | string;
    type: 'info' | 'warning' | 'success' | 'error' | 'request';
    message: string;
    title?: string;
    description?: string;
    isRead: boolean;
    createdAt: string;
    // optional associated branch_request id
    requestId?: number;
}

export interface LowStockMedicine {
    medicine_id: number;
    medicine_name: string;
    quantity: number;
    medicine_category?: string;
}

interface NotificationBellProps {
    notifications?: Notification[];
    lowStockMedicines?: LowStockMedicine[];
    onSeeAll?: () => void;
    onMarkAsRead?: () => void;
    // optional callbacks for handling branch request actions
    onApproveRequest?: (requestId: number) => Promise<void> | void;
    onRejectRequest?: (requestId: number) => Promise<void> | void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, lowStockMedicines = [], onSeeAll, onMarkAsRead, onApproveRequest, onRejectRequest }) => {
    const [isNotificationOpen, setNotificationOpen] = useState(false);
    const [showLowStockAlert, setShowLowStockAlert] = useState(false);
    const [alertShownBefore, setAlertShownBefore] = useState(false);
    const [lowStockNotificationsCreated, setLowStockNotificationsCreated] = useState(false);
    const [fetchedNotifications, setFetchedNotifications] = useState<Notification[]>([]);
    const [fetchedLowStock, setFetchedLowStock] = useState<LowStockMedicine[]>([]);
    const [branchesMap, setBranchesMap] = useState<Record<number, string>>({});
    // local optimistic status map for requests: { [requestId]: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' }
    const [requestActionStatus, setRequestActionStatus] = useState<Record<number, 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'>>({});
    // When true, the bell badge is hidden optimistically while we persist the read state.
    const [optimisticAllRead, setOptimisticAllRead] = useState(false);
    // Track pending branch requests count
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
    // Track approved requests awaiting receipt confirmation (for requester branch)
    const [awaitingReceiptCount, setAwaitingReceiptCount] = useState(0);
    // debug raw view removed

    // We will rely on the database notifications for low-stock and requests.
    // The server inserts deduplicated low-stock notifications into the
    // `notifications` table (type = 'low_stock'). The UI will fetch those and
    // display them. LocalStorage is still used only to avoid showing the same
    // toast repeatedly in a single browser for already-seen low-stock items.

    // Decide source: use props if provided, otherwise use fetched data
    const effectiveNotifications = (notifications && notifications.length > 0) ? notifications : fetchedNotifications;

    // All notifications come only from the database (server). low_stock rows
    // in the `notifications` table will be shown as warning notifications.
    const allNotifications = effectiveNotifications;

    // Helper: replace 'Branch <n>' placeholders (or fallback) with real branch names using branchesMap
    const resolveBranchNamesInMessage = (msg: string) => {
        if (!msg || Object.keys(branchesMap).length === 0) return msg;
        // match 'Branch <digits>' (case-insensitive)
        return msg.replace(/Branch\s*(\d+)/gi, (m, p1) => {
            const id = Number(p1);
            return branchesMap[id] ?? `Branch ${id}`;
        });
    };

    // Show unread count instead of total count for the badge. If we've
    // optimistically marked all as read, return 0 so the badge hides
    // immediately while the backend request runs.
    const unreadNotificationsCount = optimisticAllRead ? 0 : allNotifications.filter(n => !(n as any).isRead).length;
    
    // Total unread count includes: unread notifications + pending branch requests + approved requests awaiting receipt
    const unreadCount = unreadNotificationsCount + pendingRequestsCount + awaitingReceiptCount;
    
    // Show red dot indicator when: unread notifications OR pending requests OR approved requests awaiting receipt confirmation
    const shouldShowRedDot = unreadCount > 0;

    // Auto-show low stock alert when there are medicines with 50 or below units
    // Show the alert only once per medicine by persisting shown IDs in localStorage
    useEffect(() => {
        // Derive low-stock notifications from fetched DB notifications (type === 'low_stock')
        const lowStockRows = allNotifications.filter(n => (n as any).type === 'low_stock' || (n as any).type === 'warning');
        if (!lowStockRows || lowStockRows.length === 0) return;

        try {
            const storageKey = 'hims_low_stock_shown_v1';
            const raw = localStorage.getItem(storageKey);
            const shownMap = raw ? JSON.parse(raw) : {};

            // Parse reference_id or try to extract medicine id from message id
            const parsed = lowStockRows.map(r => {
                const referenceId = (r as any).reference_id ?? undefined;
                // Attempt to parse from id like 'low-stock-123' when reference_id missing
                let parsedId: number | undefined = undefined;
                if (!referenceId && typeof r.id === 'string') {
                    const m = r.id.match(/low-stock-(\d+)/);
                    if (m) parsedId = Number(m[1]);
                }
                return { row: r, medicine_id: referenceId ?? parsedId };
            }).filter(x => x.medicine_id !== undefined) as Array<{ row: any, medicine_id: number }>;

            const unseen = parsed.filter(p => !shownMap[String(p.medicine_id)]);
            if (unseen.length === 0) return;

            unseen.forEach(p => { shownMap[String(p.medicine_id)] = true; });
            localStorage.setItem(storageKey, JSON.stringify(shownMap));
            setLowStockNotificationsCreated(true);

            const listItems = parsed.slice(0, 5).map(p => {
                const r = p.row;
                // message format from server expected to contain the medicine name line
                const lines = (r.message || '').split('\n');
                const secondLine = lines[1] ?? lines[0] ?? '';
                return `<li style=\"margin-bottom:4px\">${secondLine}</li>`;
            }).join('');

            const toastHtml = `
                <div style="text-align:left;box-sizing:border-box;width:100%;">
                    <div style="font-weight:700;margin-bottom:6px;color:#7f1d1d">Low Stock Alert</div>
                    <div style="font-size:13px;color:#7f1d1d;margin-bottom:6px">${parsed.length} medicine${parsed.length > 1 ? 's' : ''} need reordering (≤50 units)</div>
                    <div style="font-size:12px;color:#7f1d1d;max-height:96px;overflow:auto;word-break:break-word;white-space:normal;">
                        <ul style="padding-left:12px;margin:0">${listItems}</ul>
                        ${parsed.length > 5 ? `<div style=\"margin-top:6px\">... and ${parsed.length - 5} more</div>` : ''}
                    </div>
                </div>
            `;

            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true,
                width: '320px',
                customClass: { popup: 'rounded-lg shadow-lg' }
            });

            Toast.fire({ html: toastHtml, icon: 'warning' });
        } catch (err) {
            console.error('Low stock toast error', err);
        }
    }, [allNotifications]);

    // Previously this component would also persist low-stock notifications to the backend.
    // To avoid duplicate creation we rely on the server-side low-stock endpoint to insert
    // notifications (UserController@getLowStockMedicines). The UI still shows the toast
    // above when low stock is detected, but creation is centralized on the backend.

    // Fetch notifications and low stock if parent didn't provide them
    // Also set up periodic checking to trigger backend low-stock detection
    useEffect(() => {
        let mounted = true;
        const currentUser = UserService.getCurrentUser();
        if (!currentUser || !currentUser.branch_id) return;

        const branchId = currentUser.branch_id;

        const fetchData = async () => {
            try {
                // IMPORTANT: Call getLowStockMedicinesMSSQL first to trigger backend detection
                // This endpoint checks inventory and automatically creates notifications in the database
                console.log('NotificationBell: Checking for low stock...');
                const low = await BranchInventoryService.getLowStockMedicinesMSSQL(branchId).catch((err) => {
                    console.error('Error fetching low stock:', err);
                    return [];
                });
                if (!mounted) return;
                if (!lowStockMedicines || lowStockMedicines.length === 0) {
                    setFetchedLowStock(Array.isArray(low) ? low.map((l: any) => ({ 
                        medicine_id: l.medicine_id, 
                        medicine_name: l.medicine_name, 
                        quantity: l.quantity,
                        medicine_category: l.medicine_category 
                    })) : []);
                }
                console.log('NotificationBell: Found', low.length, 'low stock medicines');

                // Now fetch notifications (including newly created low-stock notifications)
                if (!notifications || notifications.length === 0) {
                    const rows = await BranchInventoryService.getNotifications(branchId);
                    if (!mounted) return;
                    console.log('NotificationBell: Fetched', rows?.length || 0, 'notifications from database');
                    // normalize to Notification shape minimally
                    const normalized = (rows || []).map((r: any) => ({
                        id: r.notification_id ?? r.id ?? Math.random().toString(36).slice(2),
                        type: (r.type === 'low_stock' ? 'warning' : (r.type === 'request' || r.type === 'request_approved' ? 'request' : 'info')) as any,
                        message: r.message ?? '',
                        isRead: !!r.is_read,
                        createdAt: r.created_at ?? new Date().toISOString(),
                        requestId: r.request_id ?? undefined,
                        // include server-provided request status and branch context
                        requestStatus: r.request_status ?? r.requestStatus ?? undefined,
                        fromBranchId: r.from_branch_id ?? undefined,
                        toBranchId: r.to_branch_id ?? undefined,
                        // preserve reference_id for low-stock deduplication in toast
                        reference_id: r.reference_id ?? undefined,
                    })) as Notification[];
                    setFetchedNotifications(normalized);
                    
                    // Count approved requests awaiting receipt confirmation (where current user is requester)
                    const awaitingReceipt = normalized.filter((n: any) => {
                        return n.requestStatus === 'approved' && n.fromBranchId === branchId;
                    }).length;
                    console.log('NotificationBell: Found', awaitingReceipt, 'approved requests awaiting receipt');
                    setAwaitingReceiptCount(awaitingReceipt);
                }

                // Fetch pending branch requests to determine if red dot should show
                // Red dot shows when: is_read=0 in notifications OR status='pending' in branch_requests
                const pendingRequests = await BranchInventoryService.getPendingBranchRequests(branchId).catch(() => []);
                if (!mounted) return;
                console.log('NotificationBell: Found', pendingRequests?.length || 0, 'pending branch requests');
                setPendingRequestsCount(pendingRequests?.length || 0);

                // fetch branches once to resolve branch names in messages
                const branches = await BranchInventoryService.getAllBranches().catch(() => []);
                if (!mounted) return;
                const map: Record<number, string> = {};
                (branches || []).forEach((b: any) => { if (b && b.branch_id) map[Number(b.branch_id)] = b.branch_name || `Branch ${b.branch_id}`; });
                setBranchesMap(map);
            } catch (err) {
                console.error('NotificationBell fetch error', err);
            }
        };

        // Initial fetch
        fetchData();

        // Set up periodic checking every 2 minutes to detect new low stock and refresh notifications
        const intervalId = setInterval(() => {
            console.log('NotificationBell: Periodic check triggered');
            fetchData();
        }, 2 * 60 * 1000); // 2 minutes

        return () => { 
            mounted = false;
            clearInterval(intervalId);
        };
    }, []);

    const toggleNotification = () => {
        const opening = !isNotificationOpen;
        setNotificationOpen(opening);

        // When opening, optimistically mark notifications as read so the
        // badge disappears immediately and the user sees instant feedback.
        if (opening && allNotifications.length > 0) {
            // hide badge locally
            setOptimisticAllRead(true);

            // set local fetched notifications as read so any list inside the
            // dropdown shows the updated state immediately (if we're using
            // fetchedNotifications as the source). This won't mutate props.
            setFetchedNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

            // call parent callback if provided
            if (onMarkAsRead) {
                try { onMarkAsRead(); } catch (e) { console.warn('onMarkAsRead threw', e); }
            } else {
                // otherwise call backend to persist the read state. If it fails,
                // roll back the optimistic UI change so the badge returns.
                const currentUser = UserService.getCurrentUser();
                if (currentUser && currentUser.branch_id) {
                    BranchInventoryService.markNotificationsRead(currentUser.branch_id)
                        .then(() => {
                            // success: nothing to do, optimistic state matches server
                        })
                        .catch(err => {
                            console.error('Failed to mark notifications read:', err);
                            // revert optimistic hide so the badge reappears
                            setOptimisticAllRead(false);
                            // also attempt to refetch notifications to restore accurate state
                            BranchInventoryService.getNotifications(currentUser.branch_id)
                                .then(rows => {
                                    const normalized = (rows || []).map((r: any) => ({ id: r.notification_id ?? r.id ?? Math.random().toString(36).slice(2), type: (r.type === 'low_stock' ? 'warning' : (r.type === 'request' ? 'request' : 'info')) as any, message: r.message ?? '', isRead: !!r.is_read, createdAt: r.created_at ?? new Date().toISOString(), requestId: r.request_id ?? undefined, reference_id: r.reference_id ?? undefined })) as Notification[];
                                    setFetchedNotifications(normalized);
                                })
                                .catch(() => {/* ignore refetch error */});
                        });
                }
            }
        }
    };

    const closeLowStockAlert = () => {
        setShowLowStockAlert(false);
    };

    // Show only first 2 notifications in the bell, rest go to notification page
    // As a final safeguard, dedupe request notifications here preferring items
    // that already have a requestStatus (approved/rejected) over plain pending ones
    const dedupeRequestNotifications = (list: Notification[]) => {
        const map = new Map<string, Notification>();
        for (const n of list) {
            // build a key by requestId if present, otherwise by message
            const rid = (n as any).requestId ?? (n as any).request_id ?? null;
            const key = rid ? `req:${rid}` : `msg:${(n.message || '').replace(/\s*\[req:\s*\d+\s*\]\s*/i, '').trim().toLowerCase()}`;

            // if we already have an entry for this key, prefer the one with requestStatus
            if (map.has(key)) {
                const existing = map.get(key)!;
                const existingHasStatus = !!((existing as any).requestStatus || (existing as any).request_status);
                const currentHasStatus = !!((n as any).requestStatus || (n as any).request_status);
                if (currentHasStatus && !existingHasStatus) map.set(key, n);
            } else {
                map.set(key, n);
            }
        }
        return Array.from(map.values());
    };

    const safeList = dedupeRequestNotifications(allNotifications);
    const displayedNotifications = safeList.slice(0, 2);
    const hasMoreNotifications = safeList.length > 2;

    // Approve/reject handlers when NotificationBell owns the calls
    const handleApprove = async (requestId: number) => {
        // if parent provided a handler, call it (assume parent handles messages)
        if (onApproveRequest) return onApproveRequest(requestId);

        const currentUser = UserService.getCurrentUser();
        if (!currentUser) return;

        // indicate loading state optimistically
        setRequestActionStatus(prev => ({ ...prev, [requestId]: 'approved' }));

        try {
            const res = await BranchInventoryService.approveBranchRequest(requestId, currentUser.user_id);
            if (res && res.success) {
                // show server message or generic
                Swal.fire({ icon: 'success', title: res.message || 'Approved', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
                
                // Refetch notifications and pending requests to update red dot state
                const rows = await BranchInventoryService.getNotifications(currentUser.branch_id);
                const normalized = (rows || []).map((r: any) => ({ 
                    id: r.notification_id ?? r.id, 
                    type: (r.type === 'low_stock' ? 'warning' : (r.type === 'request' || r.type === 'request_approved' ? 'request' : 'info')) as any, 
                    message: r.message ?? '', 
                    isRead: !!r.is_read, 
                    createdAt: r.created_at,
                    requestId: r.request_id ?? undefined,
                    requestStatus: r.request_status ?? undefined,
                    fromBranchId: r.from_branch_id ?? undefined,
                    toBranchId: r.to_branch_id ?? undefined,
                    reference_id: r.reference_id ?? undefined,
                })) as Notification[];
                setFetchedNotifications(normalized);
                
                // Update pending requests count so red dot disappears if all are confirmed
                const pendingRequests = await BranchInventoryService.getPendingBranchRequests(currentUser.branch_id).catch(() => []);
                setPendingRequestsCount(pendingRequests?.length || 0);
            } else {
                // show server error and revert UI status
                setRequestActionStatus(prev => { const copy = { ...prev }; delete copy[requestId]; return copy; });
                Swal.fire({ icon: 'error', title: res?.message || 'Failed to approve', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
            }
        } catch (err: any) {
            setRequestActionStatus(prev => { const copy = { ...prev }; delete copy[requestId]; return copy; });
            Swal.fire({ icon: 'error', title: 'Error approving request', text: err?.message || '', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
        }
    };

    const handleReject = async (requestId: number) => {
        if (onRejectRequest) return onRejectRequest(requestId);

        const currentUser = UserService.getCurrentUser();
        if (!currentUser) return;

        setRequestActionStatus(prev => ({ ...prev, [requestId]: 'rejected' }));

        try {
            const res = await BranchInventoryService.rejectBranchRequest(requestId, currentUser.user_id);
            if (res && res.success) {
                Swal.fire({ icon: 'success', title: res.message || 'Rejected', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
                
                // Refetch notifications and pending requests to update red dot state
                const rows = await BranchInventoryService.getNotifications(currentUser.branch_id);
                const normalized = (rows || []).map((r: any) => ({ 
                    id: r.notification_id ?? r.id, 
                    type: (r.type === 'low_stock' ? 'warning' : (r.type === 'request' || r.type === 'request_approved' ? 'request' : 'info')) as any, 
                    message: r.message ?? '', 
                    isRead: !!r.is_read, 
                    createdAt: r.created_at,
                    requestId: r.request_id ?? undefined,
                    requestStatus: r.request_status ?? undefined,
                    fromBranchId: r.from_branch_id ?? undefined,
                    toBranchId: r.to_branch_id ?? undefined,
                    reference_id: r.reference_id ?? undefined,
                })) as Notification[];
                setFetchedNotifications(normalized);
                
                // Update pending requests count so red dot disappears if all are confirmed
                const pendingRequests = await BranchInventoryService.getPendingBranchRequests(currentUser.branch_id).catch(() => []);
                setPendingRequestsCount(pendingRequests?.length || 0);
            } else {
                setRequestActionStatus(prev => { const copy = { ...prev }; delete copy[requestId]; return copy; });
                Swal.fire({ icon: 'error', title: res?.message || 'Failed to reject', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
            }
        } catch (err: any) {
            setRequestActionStatus(prev => { const copy = { ...prev }; delete copy[requestId]; return copy; });
            Swal.fire({ icon: 'error', title: 'Error rejecting request', text: err?.message || '', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
        }
    };

    const handleConfirmReceipt = async (requestId: number, received: boolean) => {
        const currentUser = UserService.getCurrentUser();
        if (!currentUser) return;

        // Set optimistic status
        setRequestActionStatus(prev => ({ ...prev, [requestId]: received ? 'completed' : 'cancelled' }));

        try {
            const res = await BranchInventoryService.confirmBranchRequestReceipt(requestId, received, currentUser.user_id);
            if (res && res.success) {
                Swal.fire({ 
                    icon: 'success', 
                    title: received ? 'Receipt Confirmed' : 'Request Cancelled', 
                    text: res.message, 
                    toast: true, 
                    position: 'top-end', 
                    timer: 2000, 
                    showConfirmButton: false 
                });
                
                // Refetch notifications to update UI
                const rows = await BranchInventoryService.getNotifications(currentUser.branch_id);
                const normalized = (rows || []).map((r: any) => ({ 
                    id: r.notification_id ?? r.id, 
                    type: (r.type === 'low_stock' ? 'warning' : (r.type === 'request' || r.type === 'request_approved' ? 'request' : 'info')) as any, 
                    message: r.message ?? '', 
                    isRead: !!r.is_read, 
                    createdAt: r.created_at,
                    requestId: r.request_id ?? undefined,
                    requestStatus: r.request_status ?? undefined,
                    fromBranchId: r.from_branch_id ?? undefined,
                    toBranchId: r.to_branch_id ?? undefined,
                    reference_id: r.reference_id ?? undefined,
                })) as Notification[];
                setFetchedNotifications(normalized);
                
                // Update awaiting receipt count (cancelled requests shouldn't count)
                const awaitingReceipt = normalized.filter((n: any) => {
                    return n.requestStatus === 'approved' && n.fromBranchId === currentUser.branch_id;
                }).length;
                setAwaitingReceiptCount(awaitingReceipt);
            } else {
                // Revert optimistic status
                setRequestActionStatus(prev => { const copy = { ...prev }; delete copy[requestId]; return copy; });
                Swal.fire({ icon: 'error', title: res?.message || 'Failed to confirm receipt', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
            }
        } catch (err: any) {
            setRequestActionStatus(prev => { const copy = { ...prev }; delete copy[requestId]; return copy; });
            Swal.fire({ icon: 'error', title: 'Error confirming receipt', text: err?.message || '', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
        }
    };

    return (
        <div className="relative">
            {/* Low Stock Alert Popup */}
            {showLowStockAlert && (
                <div className="fixed top-4 right-4 z-50 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-right duration-300">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-red-800 mb-1">
                                Low Stock Alert!
                            </h3>
                            <p className="text-sm text-red-700 mb-2">
                                {lowStockMedicines.length} medicine{lowStockMedicines.length > 1 ? 's' : ''} need{lowStockMedicines.length === 1 ? 's' : ''} reordering (≤50 units)
                            </p>
                            <div className="max-h-20 overflow-y-auto">
                                {lowStockMedicines.slice(0, 3).map(medicine => (
                                    <div key={medicine.medicine_id} className="text-xs text-red-600 mb-1">
                                            • {medicine.medicine_name}: {Number(medicine.quantity ?? 0)} units
                                    </div>
                                ))}
                                {lowStockMedicines.length > 3 && (
                                    <div className="text-xs text-red-600">
                                        ... and {lowStockMedicines.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={closeLowStockAlert}
                            className="flex-shrink-0 ml-2 text-red-400 hover:text-red-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Bell icon with notification count */}
            <div className="relative">
                <Bell className="w-6 h-6 text-white cursor-pointer" onClick={toggleNotification} />
                {/* Show red dot indicator when: is_read=0 in notifications OR status='pending' in branch_requests */}
                {shouldShowRedDot && (
                    <>
                        {/* Red dot indicator - small circle that appears on top-right of bell */}
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                        {/* Notification count badge (includes unread notifications + pending requests) */}
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </>
                )}
            </div>
            {typeof document !== 'undefined' && ReactDOM.createPortal(
                <>
            {/* Backdrop that darkens/blocks interaction with header when notifications open */}
            {isNotificationOpen && (
                <div
                    onClick={() => setNotificationOpen(false)}
                    style={{ zIndex: 99990 }}
                    className="fixed inset-0 bg-transparent pointer-events-auto"
                />
            )}

            <div
                // make the dropdown overlay the header/table by using fixed positioning
                className={`
                    fixed top-12 right-3 max-w-lg w-[400px] bg-white rounded-lg shadow-2xl
                    transition-all duration-200 ease-in-out transform
                    ${isNotificationOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 -translate-y-2 pointer-events-none'}
                `}
                style={{ zIndex: 99999 }}
            >
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Recent Notification History</h3>
                    </div>
                    {allNotifications.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center">No new notifications.</p>
                    ) : (
                        <div className="space-y-3">
                            {displayedNotifications.map(notification => (
                                <div key={notification.id} className="flex items-start p-2 rounded-lg hover:bg-gray-50">
                                    {/* Avatar/icon column */}
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1 bg-gray-100 overflow-hidden">
                                        <img src="/images/nurse.jpg" alt="nurse" className="w-8 h-8 object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        {/* If this is a low stock notification, prefer newline-separated message parts */}
                                                {notification.type === 'warning' && notification.message && notification.message.includes('\n') ? (
                                            (() => {
                                                const parts = resolveBranchNamesInMessage(notification.message).split('\n').map(p => p.trim()).filter(Boolean);
                                                const titlePart = parts[0] ?? 'Low Stock Alert';
                                                // remove any trailing request token like [req:123] from contentPart
                                                let contentPart = parts[1] ?? '';
                                                contentPart = contentPart.replace(/\s*\[req:\s*\d+\s*\]\s*$/i, '');
                                                const datePart = parts[2] ?? new Date(notification.createdAt).toLocaleDateString();
                                                return (
                                                    <>
                                                        <p className="text-sm font-semibold text-gray-800">{titlePart}</p>
                                                        <p className="text-xs text-gray-700 mt-1">{contentPart}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{datePart}</p>
                                                    </>
                                                );
                                            })()
                                                ) : (
                                            <>
                                                {/* Strip request token when showing raw message */}
                                                <p className="text-sm font-medium text-gray-800">{(notification.title ?? resolveBranchNamesInMessage(notification.message)).toString().replace(/\s*\[req:\s*\d+\s*\]\s*$/i, '')}</p>
                                                {/* If this is a request notification, show action buttons above the date */}
                                                {/* request action buttons are rendered below to avoid duplication */}
                                                <p className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleDateString()}</p>
                                            </>
                                        )}
                                        {/* If this notification represents a branch request, show Approve/Reject or Receipt Confirmation */}
                                        {notification.type === 'request' && (notification as any).requestId && (
                                            (() => {
                                                const id = Number((notification as any).requestId);
                                                const currentUser = UserService.getCurrentUser();
                                                const currentBranchId = currentUser?.branch_id;
                                                
                                                // Get branch context from the notification
                                                const fromBranchId = (notification as any).fromBranchId;
                                                const toBranchId = (notification as any).toBranchId;
                                                
                                                // prefer a local optimistic status, otherwise use server-provided status
                                                const serverStatus = (notification as any).requestStatus || (notification as any).request_status || null;
                                                const localStatus = requestActionStatus[id] ?? null;
                                                const effectiveStatus = localStatus || serverStatus;
                                                
                                                // Determine if current user is the requester (from_branch) or supplier (to_branch)
                                                const isRequester = currentBranchId === fromBranchId;
                                                const isSupplier = currentBranchId === toBranchId;
                                                
                                                // SUPPLIER VIEW: Show Approve/Reject buttons for pending requests
                                                if (isSupplier && (effectiveStatus === 'pending' || !effectiveStatus)) {
                                                    return (
                                                        <div className="mt-3 flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    if (onApproveRequest) onApproveRequest(id);
                                                                    else handleApprove(id);
                                                                }}
                                                                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm flex items-center hover:bg-green-700"
                                                            >
                                                                <Check className="w-4 h-4 mr-2" />
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (onRejectRequest) onRejectRequest(id);
                                                                    else handleReject(id);
                                                                }}
                                                                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm flex items-center hover:bg-red-700"
                                                            >
                                                                <X className="w-4 h-4 mr-2" />
                                                                Reject
                                                            </button>
                                                        </div>
                                                    );
                                                }
                                                
                                                // REQUESTER VIEW: Show receipt confirmation buttons for approved requests
                                                if (isRequester && effectiveStatus === 'approved') {
                                                    return (
                                                        <div className="mt-3">
                                                            <p className="text-xs text-gray-600 mb-2">Did you receive the medicine?</p>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleConfirmReceipt(id, true)}
                                                                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm flex items-center hover:bg-blue-700"
                                                                >
                                                                    <Check className="w-4 h-4 mr-1" />
                                                                    Yes, received
                                                                </button>
                                                                <button
                                                                    onClick={() => handleConfirmReceipt(id, false)}
                                                                    className="px-3 py-1 bg-gray-400 text-white rounded-md text-sm flex items-center hover:bg-gray-500"
                                                                >
                                                                    <X className="w-4 h-4 mr-1" />
                                                                    No, Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // REQUESTER VIEW: Show completed status for received requests
                                                if (isRequester && effectiveStatus === 'completed') {
                                                    return (
                                                        <div className="mt-3">
                                                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">Received</span>
                                                        </div>
                                                    );
                                                }
                                                
                                                // REQUESTER VIEW: Show cancelled status
                                                if (isRequester && effectiveStatus === 'cancelled') {
                                                    return (
                                                        <div className="mt-3">
                                                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm">Cancelled</span>
                                                        </div>
                                                    );
                                                }
                                                
                                                // SUPPLIER VIEW: Show approved status (no action needed from supplier after approval)
                                                if (isSupplier && effectiveStatus === 'approved') {
                                                    return (
                                                        <div className="mt-3">
                                                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm">Approved</span>
                                                        </div>
                                                    );
                                                }

                                                // Show rejected status for both parties
                                                if (effectiveStatus === 'rejected') {
                                                    return (
                                                        <div className="mt-3">
                                                            <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm">Rejected</span>
                                                        </div>
                                                    );
                                                }

                                                return null;
                                            })()
                                        )}
                                    </div>
                                </div>
                            ))}
                            {hasMoreNotifications && (
                                <div className="border-t pt-3 mt-3">
                                    <p className="text-xs text-gray-500 text-center">
                                        {allNotifications.length - 2} more notifications...
                                    </p>
                                    {onSeeAll && (
                                        <button 
                                            className="w-full text-sm text-[#A3386C] hover:underline mt-1" 
                                            onClick={() => onSeeAll()}
                                        >
                                            View All Notifications
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
                </>,
                document.body
            )}
        </div>
    );
};

export default NotificationBell;
