import { supabase } from '../lib/supabaseClient';
import { UserService } from './userService';

export interface Branch {
    branch_id: number;
    branch_name: string;
    branch_location?: string;
    branch_manager?: string;
}

export interface Medicine {
    medicine_id: number;
    medicine_name: string;
    medicine_category: string;
    description?: string;
}

export interface BranchInventoryItem {
    inventory_id: number;
    branch_id: number;
    medicine_id: number;
    quantity: number;
    created_at: string;
    updated_at: string;
    medicine?: Medicine;
    branch?: Branch;
}

export interface BranchStockSummary {
    branch_id: number;
    branch_name: string;
    medicine_id: number;
    medicine_name: string;
    medicine_category: string;
    quantity: number;
    low_stock_level: number;
    is_low_stock: boolean;
}

export class BranchInventoryService {
    
    // Get all branches
    static async getAllBranches(): Promise<Branch[]> {
        try {
            const { data, error } = await supabase
                .from('branches')
                .select('*')
                .order('branch_name');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching branches:', error);
            return [];
        }
    }

    // Get all medicines
    static async getAllMedicines(): Promise<Medicine[]> {
        try {
            const { data, error } = await supabase
                .from('medicines')
                .select('*')
                .order('medicine_name');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching medicines:', error);
            return [];
        }
    }

    // Get inventory for a specific branch
    static async getBranchInventory(branchId: number): Promise<BranchInventoryItem[]> {
        try {
            const { data, error } = await supabase
                .from('branch_medicine_inventory')
                .select(`
                    *,
                    medicine:medicines(*),
                    branch:branches(*)
                `)
                .eq('branch_id', branchId)
                .order('medicine_id');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching branch inventory:', error);
            return [];
        }
    }

    // Get user's branch inventory
    static async getUserBranchInventory(userId: number): Promise<BranchInventoryItem[]> {
        try {
            // Get user by user_id to find their branch
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('branch_id')
                .eq('user_id', userId)
                .single();

            if (userError) throw userError;
            
            if (!user?.branch_id) {
                throw new Error('User is not assigned to any branch');
            }

            return await this.getBranchInventory(user.branch_id);
        } catch (error) {
            console.error('Error fetching user branch inventory:', error);
            return [];
        }
    }

    // Get stock summary for all branches
    static async getAllBranchesStockSummary(): Promise<BranchStockSummary[]> {
        try {
            const { data, error } = await supabase
                .from('branch_medicine_inventory')
                .select(`
                    *,
                    medicine:medicines(*),
                    branch:branches(*),
                    medicine_reorder_levels!inner(minimum_stock_level)
                `)
                .order('branch_id');

            if (error) throw error;

            const summary: { [key: string]: BranchStockSummary } = {};
            
            data?.forEach((item: any) => {
                const key = `${item.branch_id}-${item.medicine_id}`;
                const branchData = Array.isArray(item.branch) ? item.branch[0] : item.branch;
                const medicineData = Array.isArray(item.medicine) ? item.medicine[0] : item.medicine;
                const reorderData = Array.isArray(item.medicine_reorder_levels) ? item.medicine_reorder_levels[0] : item.medicine_reorder_levels;
                
                summary[key] = {
                    branch_id: item.branch_id,
                    branch_name: branchData?.branch_name || 'Unknown Branch',
                    medicine_id: item.medicine_id,
                    medicine_name: medicineData?.medicine_name || 'Unknown Medicine',
                    medicine_category: medicineData?.medicine_category || 'Unknown',
                    quantity: item.quantity,
                    low_stock_level: reorderData?.minimum_stock_level || 50,
                    is_low_stock: item.quantity <= (reorderData?.minimum_stock_level || 50)
                };
            });

            return Object.values(summary);

        } catch (error) {
            console.error('Error fetching stock summary:', error);
            return [];
        }
    }

    // Add stock to branch (upsert - update if exists, insert if not)
    static async addStockToBranch(
        branchId: number,
        medicineId: number,
        quantity: number
    ): Promise<boolean> {
        try {
            // Check if record exists
            const { data: existing, error: fetchError } = await supabase
                .from('branch_medicine_inventory')
                .select('*')
                .eq('branch_id', branchId)
                .eq('medicine_id', medicineId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
                throw fetchError;
            }

            if (existing) {
                // Update existing record
                const { error } = await supabase
                    .from('branch_medicine_inventory')
                    .update({ 
                        quantity: existing.quantity + quantity,
                        updated_at: new Date().toISOString()
                    })
                    .eq('inventory_id', existing.inventory_id);

                if (error) throw error;
            } else {
                // Insert new record
                const { error } = await supabase
                    .from('branch_medicine_inventory')
                    .insert([{
                        branch_id: branchId,
                        medicine_id: medicineId,
                        quantity: quantity
                    }]);

                if (error) throw error;
            }

            return true;
        } catch (error) {
            console.error('Error adding stock to branch:', error);
            return false;
        }
    }

    // Dispense medicine from branch
    static async dispenseMedicine(
        branchId: number,
        medicineId: number,
        quantityToDispense: number,
        userId: number,
        notes: string = 'Medicine dispensed'
    ): Promise<boolean> {
        try {
            // Get current inventory for this medicine in this branch
            const { data: inventoryItem, error: fetchError } = await supabase
                .from('branch_medicine_inventory')
                .select('*')
                .eq('branch_id', branchId)
                .eq('medicine_id', medicineId)
                .single();

            if (fetchError) throw fetchError;

            if (!inventoryItem || inventoryItem.quantity < quantityToDispense) {
                throw new Error('Insufficient stock available');
            }

            // Update inventory
            const newQuantity = inventoryItem.quantity - quantityToDispense;
            const { error: updateError } = await supabase
                .from('branch_medicine_inventory')
                .update({ 
                    quantity: newQuantity,
                    updated_at: new Date().toISOString()
                })
                .eq('inventory_id', inventoryItem.inventory_id);

            if (updateError) throw updateError;

            // Record transaction
            const { error: transactionError } = await supabase
                .from('medicine_transactions')
                .insert([{
                    branch_id: branchId,
                    medicine_id: medicineId,
                    transaction_type: 'dispense',
                    quantity_change: -quantityToDispense,
                    quantity_before: inventoryItem.quantity,
                    quantity_after: newQuantity,
                    notes: notes,
                    user_id: userId
                }]);

            if (transactionError) throw transactionError;

            return true;
        } catch (error) {
            console.error('Error dispensing medicine:', error);
            return false;
        }
    }

    // Get low stock medicines for a branch
    static async getLowStockMedicines(branchId: number): Promise<BranchStockSummary[]> {
        try {
            const { data, error } = await supabase
                .from('branch_medicine_inventory')
                .select(`
                    *,
                    medicine:medicines(*),
                    branch:branches(*),
                    medicine_reorder_levels!inner(minimum_stock_level)
                `)
                .eq('branch_id', branchId);

            if (error) throw error;

            return data?.map((item: any) => {
                const branchData = Array.isArray(item.branch) ? item.branch[0] : item.branch;
                const medicineData = Array.isArray(item.medicine) ? item.medicine[0] : item.medicine;
                const reorderData = Array.isArray(item.medicine_reorder_levels) ? item.medicine_reorder_levels[0] : item.medicine_reorder_levels;
                
                return {
                    branch_id: item.branch_id,
                    branch_name: branchData?.branch_name || 'Unknown Branch',
                    medicine_id: item.medicine_id,
                    medicine_name: medicineData?.medicine_name || 'Unknown Medicine',
                    medicine_category: medicineData?.medicine_category || 'Unknown',
                    quantity: item.quantity,
                    low_stock_level: reorderData?.minimum_stock_level || 50,
                    is_low_stock: item.quantity <= (reorderData?.minimum_stock_level || 50)
                };
            }).filter((item: any) => item.is_low_stock) || [];

        } catch (error) {
            console.error('Error fetching low stock medicines:', error);
            return [];
        }
    }

    // Get transaction history for a branch
    static async getBranchTransactionHistory(branchId: number): Promise<any[]> {
        try {
            const { data, error } = await supabase
                .from('medicine_transactions')
                .select(`
                    *,
                    medicine:medicines(*),
                    user:users(username)
                `)
                .eq('branch_id', branchId)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            return [];
        }
    }
}
