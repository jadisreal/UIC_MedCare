import { supabase } from '../lib/supabaseClient'

export interface Medicine {
  id: number
  name: string
  category: string
  stock: number
  expiry: string
  branch_id: number
  created_at?: string
  updated_at?: string
}

export interface MedicineRequest {
  id?: number
  medicine_id: number
  requested_by: string
  quantity: number
  status: 'pending' | 'approved' | 'rejected'
  branch_id: number
  created_at?: string
}

export class MedicineService {
  // @deprecated - This service is deprecated. Use BranchInventoryService with MSSQL API instead
  // Get all medicines for a specific branch
  static async getMedicinesByBranch(branchId: number): Promise<Medicine[]> {
    console.warn('MedicineService is deprecated. Use BranchInventoryService instead.');
    // TODO: Convert to MSSQL API call
    try {
      // Temporary mock implementation to fix compilation errors
      return [];
    } catch (error) {
      console.error('Error fetching medicines:', error);
      throw error;
    }
  }

  // @deprecated - Use BranchInventoryService.createMedicine instead
  static async addMedicine(medicine: Omit<Medicine, 'id' | 'created_at' | 'updated_at'>): Promise<Medicine> {
    console.warn('MedicineService.addMedicine is deprecated. Use BranchInventoryService.createMedicine instead.');
    throw new Error('Method deprecated - use BranchInventoryService.createMedicine');
  }

  // @deprecated - Use BranchInventoryService stock management methods instead
  static async updateMedicineStock(id: number, newStock: number): Promise<Medicine> {
    console.warn('MedicineService.updateMedicineStock is deprecated. Use BranchInventoryService stock management methods instead.');
    throw new Error('Method deprecated - use BranchInventoryService for stock management');
  }

  // @deprecated - Use BranchInventoryService.deleteMedicine instead
  static async deleteMedicine(id: number): Promise<void> {
    console.warn('MedicineService.deleteMedicine is deprecated. Use BranchInventoryService.deleteMedicine instead.');
    throw new Error('Method deprecated - use BranchInventoryService.deleteMedicine');
  }

  // @deprecated - Not implemented in new MSSQL system
  static async requestMedicine(request: Omit<MedicineRequest, 'id' | 'created_at'>): Promise<MedicineRequest> {
    console.warn('MedicineService.requestMedicine is deprecated. Implement new request system as needed.');
    throw new Error('Method deprecated - implement new request system as needed');
  }

  // @deprecated - Not implemented in new MSSQL system
  static async getMedicineRequests(branchId: number): Promise<MedicineRequest[]> {
    console.warn('MedicineService.getMedicineRequests is deprecated. Implement new request system as needed.');
    return [];
  }

  // @deprecated - Use BranchInventoryService with filtering instead
  static async searchMedicines(branchId: number, searchTerm: string): Promise<Medicine[]> {
    console.warn('MedicineService.searchMedicines is deprecated. Use BranchInventoryService with filtering instead.');
    return [];
  }
}
