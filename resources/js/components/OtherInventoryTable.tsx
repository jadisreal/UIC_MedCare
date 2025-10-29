import React, { useEffect, useState } from 'react';
import type { BranchInventoryItem, Medicine } from '../services/branchInventoryService';
import { BranchInventoryService } from '../services/branchInventoryService';

interface OtherInventoryTableProps {
  medicines: BranchInventoryItem[];
  searchTerm: string;
}

const OtherInventoryTable: React.FC<OtherInventoryTableProps> = ({ medicines, searchTerm }) => {
  const [medicineLookup, setMedicineLookup] = useState<Map<number, Medicine>>(new Map());

  const renderWrappedName = (name?: string | null, maxLen = 20) => {
    if (!name) return null;
    const lines: string[] = [];
    let current = '';
    for (const word of name.split(' ')) {
      if ((current + (current ? ' ' : '') + word).length <= maxLen) {
        current = current ? current + ' ' + word : word;
      } else {
        if (current) lines.push(current);
        if (word.length > maxLen) {
          for (let i = 0; i < word.length; i += maxLen) {
            lines.push(word.slice(i, i + maxLen));
          }
          current = '';
        } else {
          current = word;
        }
      }
    }
    if (current) lines.push(current);

    return (
      <div>
        {lines.map((ln, i) => (
          <div key={i} className={i === 0 ? 'text-gray-900 font-medium' : 'text-gray-600 text-sm'}>
            {ln}
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const list = await BranchInventoryService.getAllMedicines();
        if (!mounted) return;
        const map = new Map<number, Medicine>();
        list.forEach(m => map.set(Number(m.medicine_id || 0), m));
        setMedicineLookup(map);
      } catch (err) {
        // ignore - fallback to row values
      }
    };
    load();
    return () => { mounted = false; };
  }, []);
  return (
    <div className="bg-white rounded-lg overflow-auto flex-1">
      <table className="w-full">
        <thead className="bg-[#F9E7F0] text-black sticky top-0 z-10">
          <tr>
            <th className="px-6 py-4 text-left font-bold">MEDICINE NAME</th>
            <th className="px-6 py-4 text-left font-bold">USES</th>
            <th className="px-6 py-4 text-left font-bold">QUANTITY</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {medicines.map((item) => {
            const id = Number(item.medicine_id || 0);
            const found = medicineLookup.get(id) || undefined;
            const displayName = found ? (found.medicine_name || item.medicine_name) : (item.medicine_name || 'Unknown');
            const displayCategory = found ? (found.medicine_category || found.category || item.category) : (item.category || 'N/A');
            return (
              <tr key={`${item.medicine_id}-${item.lot_number ?? ''}`} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {renderWrappedName(displayName)}
                </td>
                <td className="px-6 py-4 text-gray-900">{displayCategory}</td>
                <td className="px-6 py-4 text-gray-900 font-medium">{item.quantity ?? 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Display message when no medicines are found */}
      {medicines.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">
            {searchTerm ? 'No medicines found for your search.' : 'There are no medicines in this branch.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default OtherInventoryTable;