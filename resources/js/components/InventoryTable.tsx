import React from 'react';
import { Archive } from 'lucide-react';
import { Medicine } from '../data/branchMedicines'; // Adjust the import path as needed

// Define the props for the InventoryTable component
interface InventoryTableProps {
    medicines: Medicine[];
    onDispense: (medicine: Medicine) => void;
    onReorder: (medicine: Medicine) => void;
    onRemove: (id: number) => void;
    searchTerm: string;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ 
    medicines, 
    onDispense, 
    onReorder, 
    onRemove,
    searchTerm
}) => {
    return (
        <div className="bg-white rounded-lg overflow-auto flex-1">
            <table className="w-full">
                <thead className="bg-[#F9E7F0] text-black sticky top-0 z-10"> 
                    <tr>
                        <th className="px-6 py-4 text-left font-bold">MEDICINE NAME</th>
                        <th className="px-6 py-4 text-left font-bold">CATEGORY</th>
                        <th className="px-6 py-4 text-left font-bold">DATE RECEIVED</th>
                        <th className="px-6 py-4 text-left font-bold">EXPIRATION DATE</th>
                        <th className="px-6 py-4 text-left font-bold">QUANTITY</th>
                        <th className="px-6 py-4 text-center font-bold">ACTIONS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {medicines.map((medicine) => (
                        <tr key={medicine.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="text-gray-900 font-medium">
                                    {medicine.category.match(/Pain Relief|Antibiotic|Anti-inflammatory/) ? "RITEMED" : medicine.name.split(' ')[0]}
                                </div>
                                {(() => {
                                    const nameParts = medicine.name.split(' ');
                                    if (nameParts.length > 1) {
                                        return (
                                            <div className="text-gray-600 text-sm">
                                                {nameParts.slice(1).join(' ')}
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </td>
                            <td className="px-6 py-4 text-gray-900">{medicine.category}</td>
                            <td className="px-6 py-4 text-gray-900">2025-08-26</td>
                            <td className="px-6 py-4 text-gray-900">{medicine.expiry === "N/A" ? "2027-03-25" : medicine.expiry}</td>
                            <td className="px-6 py-4 text-gray-900 font-medium">{medicine.stock}</td>
                            <td className="px-3 py-4">
                                <div className="flex items-center justify-center space-x-2">
                                    <button 
                                        onClick={() => onDispense(medicine)} 
                                        className="bg-red-200 text-red-800 hover:bg-red-300 w-7 h-7 rounded-full flex items-center justify-center font-bold text-lg transition-colors cursor-pointer" 
                                        title="Dispense Medicine"
                                    >
                                        -
                                    </button>
                                    <button 
                                        onClick={() => onReorder(medicine)} 
                                        className="bg-green-200 text-green-800 hover:bg-green-300 w-7 h-7 rounded-full flex items-center justify-center font-bold text-lg transition-colors cursor-pointer" 
                                        title="Reorder/Add Stock"
                                    >
                                        +
                                    </button>
                                    <button
                                        onClick={() => onRemove(medicine.id)}
                                        className="text-gray-500 hover:text-red-600 p-1 transition-colors rounded-full hover:bg-gray-100 hover:text-red-600 cursor-pointer flex items-center justify-center"
                                        title="Archive:"
                                        aria-label="Archive"
                                    >
                                        <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                                            <Archive className="w-4 h-4 text-gray-700" />
                                        </span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Conditional rendering for when no medicines are available */}
            {medicines.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">
                        {searchTerm ? 'No medicines found.' : 'No medicines in this branch.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default InventoryTable;