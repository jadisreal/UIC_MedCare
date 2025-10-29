import { supabase } from '../lib/supabaseClient'

// Interfaces remain the same
export interface Medicine {
    medicine_id: number
    medicine_name: string
    medicine_category?: string
    category: string
    quantity?: number
    expiry: string
}

export interface MedicineStockIn {
    medicine_stock_in_id: number
    medicine_id: number
    branch_id: number
    quantity: number
    lot_number: string
    expiration_date: string
    timestamp_dispensed: string
    date_received?: string
    user_id: number
    medicine?: Medicine
}

export interface User {
    user_id: number
    name: string
    email: string
}

export interface Branch {
    branch_id: number
    branch_name: string
    address?: string
    location?: string  // Keep this for backward compatibility
}

export interface BranchInventoryItem {
    medicine_stock_in_id: number
    medicine_id: number
    medicine_name: string
    category: string
    quantity: number
    lot_number: string
    expiration_date: string
    timestamp_dispensed: string
    date_received?: string
    user_id: number
    medicine?: Medicine
}

export interface BranchStockSummary {
    medicine_id: number
    medicine_name: string
    medicine_category: string
    category: string
    quantity: number
    reorder_level: number
    branch_name: string
    branch_id: number
}

export interface MedicineDeletedRequest {
    medicineStockInId: number
    quantity: number
    description: string
    branchId: number
}

export interface DispenseRequest {
    medicineStockInId: number
    quantity: number
    reason?: string
    dispensedBy: number
}

export class BranchInventoryService {
    // Working MSSQL methods
    static async getAllMedicines(): Promise<Medicine[]> {
        try {
            const response = await fetch('/api/medicines', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data || [];
        } catch (error) {
            console.error('Error fetching medicines:', error);
            return [];
        }
    }

    static async createMedicine(medicineName: string, category: string): Promise<Medicine> {
        try {
            const medicine = {
                medicine_name: medicineName,
                medicine_category: category,
                expiry: new Date().toISOString() // Default expiry
            };

            const response = await fetch('/api/medicines', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(medicine),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating medicine:', error);
            throw error;
        }
    }

    static async dispenseMedicineStockOut(request: DispenseRequest & { branchId: number }): Promise<any> {
        try {
            const response = await fetch('/api/dispense-v2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    medicine_stock_in_id: request.medicineStockInId,
                    quantity_dispensed: request.quantity,
                    user_id: request.dispensedBy,
                    branch_id: request.branchId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error dispensing medicine:', error);
            throw error;
        }
    }

    static async deleteMedicine(request: MedicineDeletedRequest): Promise<any> {
        try {
            const response = await fetch('/api/medicines/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    medicine_stock_in_id: request.medicineStockInId,
                    quantity: request.quantity,
                    description: request.description,
                    branch_id: request.branchId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error deleting medicine:', error);
            throw error;
        }
    }

    // Working inventory fetch method (MSSQL version)
    static async getBranchInventory(branchId: number): Promise<BranchInventoryItem[]> {
        try {
            const response = await fetch(`/api/branches/${branchId}/inventory`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Normalize common field names coming from MSSQL endpoints into BranchInventoryItem shape
            const arr = Array.isArray(data) ? data : [];
            const normalized: BranchInventoryItem[] = arr.map((row: any) => ({
                medicine_stock_in_id: row.medicine_stock_in_id ?? row.stock_in_id ?? 0,
                medicine_id: row.medicine_id ?? row.medicineId ?? row.medicine_id_fk ?? 0,
                medicine_name: row.medicine_name ?? row.name ?? row.MedicineName ?? '',
                category: row.category ?? row.medicine_category ?? row.MedicineCategory ?? '',
                quantity: Number(row.quantity ?? row.remaining_stock ?? row.stock ?? 0),
                lot_number: row.lot_number ?? row.lotNumber ?? row.lot_no ?? '',
                expiration_date: row.expiration_date ?? row.expiry ?? row.expirationDate ?? '',
                timestamp_dispensed: row.timestamp_dispensed ?? row.timestampDispensed ?? '',
                date_received: row.date_received ?? row.dateReceived ?? row.last_activity_date ?? '',
                user_id: row.user_id ?? row.added_by ?? 0,
                medicine: row.medicine ?? undefined,
            }));

            return normalized;
        } catch (error) {
            console.error('Error fetching branch inventory:', error);
            return [];
        }
    }

    static async getStockSummary(branchId: number): Promise<BranchStockSummary[]> {
        try {
            const response = await fetch(`/api/branches/${branchId}/stock-summary`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching stock summary:', error);
            return [];
        }
    }

    /**
     * Get available stock records (remaining per stock_in) for a medicine in a branch
     * Uses backend endpoint: /api/medicine-stock-records/{medicineId}/{branchId}
     */
    static async getAvailableStockRecords(medicineId: number, branchId: number, includeAll: boolean = true, userId?: number | null): Promise<Array<{ medicine_stock_in_id: number; date_received?: string | null; expiration_date?: string | null; quantity: number }>> {
        try {
            let url = `/api/medicine-stock-records/${medicineId}/${branchId}`;
            const params: string[] = [];
            if (includeAll) params.push('include_all=1');
            if (userId) params.push(`user_id=${userId}`);
            if (params.length > 0) url += '?' + params.join('&');
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const arr = Array.isArray(data) ? data : [];

            // Normalize backend shape into frontend expected BatchOption
            return arr.map((row: any) => ({
                medicine_stock_in_id: row.medicine_stock_in_id ?? row.stockInId ?? row.medicine_stock_in_id ?? row.medicineStockInId ?? 0,
                date_received: row.date_received ?? row.dateReceived ?? null,
                expiration_date: row.expiration_date ?? row.expirationDate ?? null,
                quantity: Number(row.availableQuantity ?? row.available_quantity ?? row.quantity ?? 0)
            }));
        } catch (error) {
            console.error('Error fetching available stock records:', error);
            return [];
        }
    }

    // Working MSSQL API methods for branch management
    
    // Get user's branch information
    static async getUserBranchInfo(userId: number): Promise<Branch | null> {
        try {
            const response = await fetch(`/api/users/${userId}/branch`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // The API may return either:
            // 1) { success: true, branch: { branch_id, branch_name, ... } }
            // 2) the branch object directly
            if (data && typeof data === 'object') {
                if (data.success && data.branch) return data.branch as Branch;
                if (data.branch) return data.branch as Branch;
                // If the response looks like a Branch already, return it
                if (data.branch_id && data.branch_name) return data as Branch;
            }

            return null;
        } catch (error) {
            console.error('Error fetching user branch info:', error);
            return null;
        }
    }

    // Get all branches except the specified one
    static async getOtherBranches(excludeBranchId: number): Promise<Branch[]> {
        try {
            const response = await fetch(`/api/branches/other/${excludeBranchId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching other branches:', error);
            return [];
        }
    }

    // Get all branches
    static async getAllBranches(): Promise<Branch[]> {
        try {
            const response = await fetch('/api/branches', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching all branches:', error);
            return [];
        }
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async dispenseMedicineByMedicineId(medicineId: number, quantity: number, reason: string, dispensedBy: number): Promise<boolean> {
        console.warn('BranchInventoryService.dispenseMedicineByMedicineId is deprecated. Use dispenseMedicineStockOut instead.');
        return false;
    }

    static async addMedicineStockIn(
        medicineId: number,
        branchId: number,
        quantity: number,
        dateReceived: string,
        expirationDate: string,
        userId: number
    ): Promise<MedicineStockIn | null> {
        try {
            const response = await fetch('/api/medicine-stock-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    medicine_id: medicineId,
                    branch_id: branchId,
                    quantity: quantity,
                    date_received: dateReceived,
                    expiration_date: expirationDate,
                    user_id: userId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error adding medicine stock in:', error);
            throw error;
        }
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async getLowStockMedicines(branchId: number): Promise<BranchStockSummary[]> {
        console.warn('BranchInventoryService.getLowStockMedicines is deprecated. Use getLowStockMedicinesMSSQL instead.');
        return [];
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async getBranchStockInRecords(branchId: number): Promise<MedicineStockIn[]> {
        console.warn('BranchInventoryService.getBranchStockInRecords is deprecated. Use getSoonToExpireMedicinesMSSQL instead.');
        return [];
    }

    /**
     * Get low stock medicines from MSSQL database (≤ 50 units)
     */
    static async getLowStockMedicinesMSSQL(branchId: number): Promise<BranchStockSummary[]> {
        try {
            const response = await fetch(`/api/branches/${branchId}/low-stock`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching low stock medicines:', error);
            throw error;
        }
    }

    /**
     * Get medicines expiring within 30 days from MSSQL database
     */
    static async getSoonToExpireMedicinesMSSQL(branchId: number): Promise<any[]> {
        try {
            const response = await fetch(`/api/branches/${branchId}/expiring-soon`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching soon to expire medicines:', error);
            throw error;
        }
    }

    // Create a notification row in the backend notifications table
    static async createNotification(branchId: number, userId: number | null, type: string, message: string): Promise<boolean> {
        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    branch_id: branchId,
                    user_id: userId,
                    type,
                    message
                })
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(err.message || `HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error creating notification:', error);
            return false;
        }
    }

    // Create a branch-to-branch stock request
    static async createBranchRequest(fromBranchId: number, toBranchId: number, medicineId: number, quantityRequested: number, requestedBy?: number | null): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch('/api/branch-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    from_branch_id: fromBranchId,
                    to_branch_id: toBranchId,
                    medicine_id: medicineId,
                    quantity_requested: quantityRequested,
                    requested_by: requestedBy ?? null
                })
            });

            const body = await response.json().catch(() => ({}));

            if (!response.ok) {
                const msg = body?.message || body?.error || `HTTP error! status: ${response.status}`;
                console.error('Error creating branch request (server):', msg);
                return { success: false, message: msg };
            }

            // success - server may return a message
            return { success: true, message: body?.message || 'Request created' };
        } catch (error: any) {
            console.error('Error creating branch request:', error);
            return { success: false, message: error?.message || 'Unknown error' };
        }
    }

    // Fetch notifications for a branch
    static async getNotifications(branchId: number): Promise<any[]> {
        try {
            const response = await fetch(`/api/branches/${branchId}/notifications`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    // Fetch pending branch requests directed to a branch
    static async getPendingBranchRequests(branchId: number): Promise<any[]> {
        try {
            const response = await fetch(`/api/branches/${branchId}/branch-requests`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching pending branch requests:', error);
            return [];
        }
    }

    // Fetch historical branch requests (approved/rejected) involving a branch
    static async getBranchRequestHistory(branchId: number): Promise<any[]> {
        try {
            const response = await fetch(`/api/branches/${branchId}/branch-requests/history`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching branch request history:', error);
            return [];
        }
    }

    static async approveBranchRequest(requestId: number, confirmedBy: number): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`/api/branch-requests/${requestId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ confirmed_by: confirmedBy })
            });

            const body = await response.json().catch(() => ({}));

            if (!response.ok) {
                const msg = body?.message || body?.error || `HTTP error! status: ${response.status}`;
                return { success: false, message: msg };
            }

            return { success: true, message: body?.message };
        } catch (error: any) {
            console.error('Error approving branch request:', error);
            return { success: false, message: error?.message || 'Unknown error' };
        }
    }

    static async rejectBranchRequest(requestId: number, confirmedBy: number, reason?: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`/api/branch-requests/${requestId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ confirmed_by: confirmedBy, reason: reason ?? null })
            });

            const body = await response.json().catch(() => ({}));

            if (!response.ok) {
                const msg = body?.message || body?.error || `HTTP error! status: ${response.status}`;
                return { success: false, message: msg };
            }

            return { success: true, message: body?.message };
        } catch (error: any) {
            console.error('Error rejecting branch request:', error);
            return { success: false, message: error?.message || 'Unknown error' };
        }
    }

    static async confirmBranchRequestReceipt(requestId: number, received: boolean, confirmedBy: number): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`/api/branch-requests/${requestId}/confirm-receipt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ received, confirmed_by: confirmedBy })
            });

            const body = await response.json().catch(() => ({}));

            if (!response.ok) {
                const msg = body?.message || body?.error || `HTTP error! status: ${response.status}`;
                return { success: false, message: msg };
            }

            return { success: true, message: body?.message };
        } catch (error: any) {
            console.error('Error confirming receipt:', error);
            return { success: false, message: error?.message || 'Unknown error' };
        }
    }

    // Mark notifications as read for a branch
    static async markNotificationsRead(branchId: number): Promise<boolean> {
        try {
            const response = await fetch(`/api/branches/${branchId}/notifications/mark-read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ branch_id: branchId })
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(err.message || `HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error marking notifications read:', error);
            return false;
        }
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async getBranchStockOutRecords(branchId: number): Promise<any[]> {
        console.warn('BranchInventoryService.getBranchStockOutRecords is deprecated. Use MSSQL API endpoint instead.');
        return [];
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async getAvailableStockForMedicine(medicineId: number): Promise<any[]> {
        console.warn('BranchInventoryService.getAvailableStockForMedicine is deprecated. Use MSSQL API endpoint instead.');
        return [];
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async getDeletedMedicines(): Promise<any[]> {
        console.warn('BranchInventoryService.getDeletedMedicines is deprecated. Use MSSQL API endpoint instead.');
        return [];
    }

    // Fetch archived medicines for a branch (MSSQL API)
    static async getArchivedMedicines(branchId: number): Promise<any[]> {
        try {
            const response = await fetch(`/api/branches/${branchId}/archived`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching archived medicines:', error);
            return [];
        }
    }

    // Archive a medicine (move to medicine_archived)
    static async archiveMedicine(request: { medicineStockInId: number, quantity: number, description: string, branchId: number, dateReceived?: string | null, expirationDate?: string | null }): Promise<boolean> {
        try {
            const response = await fetch('/api/medicines/archive', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    medicine_stock_in_id: request.medicineStockInId,
                    quantity: request.quantity,
                    description: request.description,
                    branch_id: request.branchId
                    , date_received: request.dateReceived ?? null
                    , expiration_date: request.expirationDate ?? null
                })
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(err.message || `HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error archiving medicine:', error);
            return false;
        }
    }

    // Restore an archived medicine (unarchive)
    static async restoreArchivedMedicine(branchId: number, archivedId: number): Promise<boolean> {
        try {
            const response = await fetch(`/api/branches/${branchId}/archived/${archivedId}/restore`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error restoring archived medicine:', error);
            return false;
        }
    }

    // Permanently delete an archived medicine record
    static async deleteArchivedMedicine(branchId: number, archivedId: number): Promise<boolean> {
        try {
            const response = await fetch(`/api/branches/${branchId}/archived/${archivedId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error deleting archived medicine:', error);
            return false;
        }
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async checkTableExists(tableName: string): Promise<boolean> {
        console.warn('BranchInventoryService.checkTableExists is deprecated. Use MSSQL API endpoint instead.');
        return false;
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async getMedicineStockInById(medicineStockInId: number): Promise<MedicineStockIn | null> {
        console.warn('BranchInventoryService.getMedicineStockInById is deprecated. Use MSSQL API endpoint instead.');
        return null;
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async updateMedicineStockIn(
        medicineStockInId: number,
        updates: Partial<MedicineStockIn>
    ): Promise<MedicineStockIn | null> {
        console.warn('BranchInventoryService.updateMedicineStockIn is deprecated. Use MSSQL API endpoint instead.');
        return null;
    }

    // @deprecated - Use MSSQL API endpoint instead
    static async addMedicineStock(
        medicineId: number,
        branchId: number,
        quantity: number,
        lotNumber: string,
        expirationDate: string,
        userId: number
    ): Promise<MedicineStockIn | null> {
        console.warn('BranchInventoryService.addMedicineStock is deprecated. Use MSSQL API endpoint instead.');
        return null;
    }

    // @deprecated - Legacy fallback method no longer needed
    static async addMedicineFallback(
        medicineId: number,
        branchId: number,
        quantity: number,
        dateReceived?: string,
        expirationDate?: string
    ): Promise<MedicineStockIn | null> {
        console.warn('BranchInventoryService.addMedicineFallback is deprecated. Use MSSQL API endpoint instead.');
        return null;
    }
}