export interface HistoryLog {
    history_id: number;
    medicine_id: number;
    branch_id: number;
    user_id: number;
    activity: 'dispensed' | 'restocked' | 'added' | 'removed';
    quantity: number;
    description: string;
    created_at: string;
    // Related data from joins
    user_name?: string;
    user_email?: string;
    medicine_name?: string;
    medicine_category?: string;
    branch_name?: string;
}

export class HistoryLogService {
    private static readonly BASE_URL = '/api';

    /**
     * Get history logs for a specific branch
     */
    static async getBranchHistoryLogs(branchId: number, limit: number = 100): Promise<HistoryLog[]> {
        try {
            console.log('� Fetching branch history logs from MSSQL...');
            
            const response = await fetch(`${this.BASE_URL}/history-log?branch_id=${branchId}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch history logs');
            }

            console.log('✅ History logs fetched successfully:', result.data?.length || 0, 'records');
            return result.data || [];
        } catch (error) {
            console.error('❌ Error fetching history logs:', error);
            return [];
        }
    }

    /**
     * Add a new entry to history log
     */
    static async addHistoryLog(
        medicineId: number,
        branchId: number,
        userId: number,
        activity: 'dispensed' | 'restocked' | 'added' | 'removed',
        quantity: number,
        description: string
    ): Promise<boolean> {
        try {
            console.log('📝 Adding history log entry to MSSQL...');
            
            const response = await fetch(`${this.BASE_URL}/history-log`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    medicine_id: medicineId,
                    branch_id: branchId,
                    user_id: userId,
                    activity: activity,
                    quantity: quantity,
                    description: description
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to add history log');
            }

            console.log('✅ History log entry added successfully');
            return true;
        } catch (error) {
            console.error('❌ Error adding history log entry:', error);
            return false;
        }
    }

    /**
     * Log medicine addition activity
     */
    static async logMedicineAdd(
        userId: number,
        medicineId: number,
        branchId: number,
        quantity: number,
        description: string
    ): Promise<boolean> {
        return this.addHistoryLog(medicineId, branchId, userId, 'added', quantity, description);
    }

    /**
     * Log medicine restock/reorder activity
     */
    static async logMedicineRestock(
        userId: number,
        medicineId: number,
        branchId: number,
        quantity: number,
        description: string
    ): Promise<boolean> {
        return this.addHistoryLog(medicineId, branchId, userId, 'restocked', quantity, description);
    }

    /**
     * Log medicine dispensing activity
     */
    static async logMedicineDispense(
        userId: number,
        medicineId: number,
        branchId: number,
        quantity: number,
        description: string
    ): Promise<boolean> {
        return this.addHistoryLog(medicineId, branchId, userId, 'dispensed', quantity, description);
    }

    /**
     * Log medicine removal activity
     */
    static async logMedicineRemoval(
        userId: number,
        medicineId: number,
        branchId: number,
        quantity: number,
        description: string
    ): Promise<boolean> {
        return this.addHistoryLog(medicineId, branchId, userId, 'removed', quantity, description);
    }
}
