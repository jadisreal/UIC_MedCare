import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { router } from '@inertiajs/react';
import { Archive } from 'lucide-react';

const ArchivedMedicines: React.FC = () => {
    const [archived, setArchived] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // placeholder: load archived medicines later via BranchInventoryService
        setIsLoading(true);
        setTimeout(() => {
            setArchived([
                { id: 1, name: 'Paracetamol', category: 'Analgesic', archived_at: '2025-09-01' },
                { id: 2, name: 'Amoxicillin', category: 'Antibiotic', archived_at: '2025-09-05' }
            ]);
            setIsLoading(false);
        }, 300);
    }, []);

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Sidebar isSidebarOpen={true} isSearchOpen={false} setSearchOpen={() => {}} isInventoryOpen={true} setInventoryOpen={() => {}} handleNavigation={(p:string)=>router.visit(p)} handleLogout={() => {}} activeMenu="inventory-stocks" />
            <div className="flex-1 ml-64 p-8">
                <h1 className="text-2xl font-semibold mb-4">Archived Medicines</h1>
                <div className="bg-white rounded-lg shadow-sm p-4">
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : archived.length === 0 ? (
                        <p className="text-gray-500">No archived medicines found.</p>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-600">
                                    <th className="py-2">Name</th>
                                    <th className="py-2">Category</th>
                                    <th className="py-2">Archived At</th>
                                    <th className="py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {archived.map(a => (
                                    <tr key={a.id} className="border-t">
                                        <td className="py-3">{a.name}</td>
                                        <td className="py-3">{a.category}</td>
                                        <td className="py-3">{a.archived_at}</td>
                                        <td className="py-3">
                                            <button className="bg-[#a3386c] text-white px-3 py-1 rounded-md">Restore</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArchivedMedicines;
