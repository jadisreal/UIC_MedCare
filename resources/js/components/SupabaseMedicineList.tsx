import React, { useState, useEffect } from 'react';
import { MedicineService } from '../services/medicineService';

interface SupabaseMedicineListProps {
  branchId: number;
}

const SupabaseMedicineList: React.FC<SupabaseMedicineListProps> = ({ branchId }) => {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMedicines();
  }, [branchId]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MedicineService.getMedicinesByBranch(branchId);
      setMedicines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async () => {
    try {
      const newMedicine = {
        name: 'New Medicine',
        category: 'General',
        stock: 10,
        expiry: '2025-12-31',
        branch_id: branchId
      };
      
      const added = await MedicineService.addMedicine(newMedicine);
      setMedicines([...medicines, added]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add medicine');
    }
  };

  const handleUpdateStock = async (medicineId: number, newStock: number) => {
    try {
      const updated = await MedicineService.updateMedicineStock(medicineId, newStock);
      setMedicines(medicines.map(med => 
        med.id === medicineId ? updated : med
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stock');
    }
  };

  if (loading) return <div className="p-4">Loading medicines...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Medicines from Supabase (Branch {branchId})</h3>
        <button 
          onClick={handleAddMedicine}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Medicine
        </button>
      </div>
      
      <div className="space-y-2">
        {medicines.map((medicine) => (
          <div key={medicine.id} className="flex items-center justify-between p-3 border rounded">
            <div>
              <div className="font-medium">{medicine.name}</div>
              <div className="text-sm text-gray-600">
                {medicine.category} • Stock: {medicine.stock} • Expires: {medicine.expiry}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleUpdateStock(medicine.id, medicine.stock + 1)}
                className="px-2 py-1 bg-green-500 text-white rounded text-sm"
              >
                +1
              </button>
              <button 
                onClick={() => handleUpdateStock(medicine.id, Math.max(0, medicine.stock - 1))}
                className="px-2 py-1 bg-red-500 text-white rounded text-sm"
              >
                -1
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {medicines.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No medicines found for this branch
        </div>
      )}
    </div>
  );
};

export default SupabaseMedicineList;
