// src/components/DispenseMedicineModal.tsx

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface DispenseMedicineModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    // now submit the selected batch id and quantity
    onSubmit: (medicineStockInId: number, quantity: number) => void;
    currentStock: number;
    medicineName?: string;
    medicineCategory?: string;
    batches?: Array<any>; // array of BranchInventoryItem-like objects with medicine_stock_in_id, expiration_date, quantity
}

const DispenseMedicineModal: React.FC<DispenseMedicineModalProps> = ({ 
    isOpen, 
    setIsOpen, 
    onSubmit, 
    currentStock, 
    medicineName = 'Unknown Medicine',
    medicineCategory = 'No Category',
    batches = []
}) => {
    
    const [quantity, setQuantity] = useState('');
    const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
    const [selectedDateReceived, setSelectedDateReceived] = useState<string | null>(null);
    const [expirationDate, setExpirationDate] = useState<string | null>(null);
    const [filteredBatches, setFilteredBatches] = useState<Array<any>>(batches || []);
    const [maxQuantityForSelectedBatch, setMaxQuantityForSelectedBatch] = useState<number>(currentStock);

    const NO_DATE = '__NO_DATE__';
    const normalizeDate = (d: any) => {
        if (!d) return NO_DATE;
        try {
            return new Date(d).toISOString().slice(0, 10);
        } catch (e) {
            return NO_DATE;
        }
    };

    // Keep selectedDateReceived/expiration in sync when selectedBatch changes
    useEffect(() => {
        if (selectedBatch) {
            const found = (batches || []).find((b: any) => b.medicine_stock_in_id === selectedBatch) || (filteredBatches || []).find((b: any) => b.medicine_stock_in_id === selectedBatch);
            if (found) {
                setSelectedDateReceived(found.date_received ? normalizeDate(found.date_received) : null);
                setExpirationDate(found.expiration_date ? normalizeDate(found.expiration_date) : null);
                // Update max quantity for the selected batch
                setMaxQuantityForSelectedBatch(found.quantity || 0);
            }
        } else {
            // no batch selected -> keep the selectedDateReceived (user's filter),
            // but clear expiration since no specific batch is chosen
            setExpirationDate(null);
            setMaxQuantityForSelectedBatch(currentStock);
        }
    }, [selectedBatch, batches, filteredBatches, currentStock]);

    useEffect(() => {
        if (isOpen) {
            // Default to All Dates (no batch selected)
            setSelectedBatch(null);
            setSelectedDateReceived(null);
            setExpirationDate(null);
            setFilteredBatches(batches || []);
            setMaxQuantityForSelectedBatch(currentStock);
        }
    }, [isOpen, batches, currentStock]);

    useEffect(() => {
        if (isOpen) {
            setQuantity('');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        const numQuantity = parseInt(quantity, 10);

        if (isNaN(numQuantity) || numQuantity <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Quantity',
                text: 'Please enter a valid positive number for the quantity.',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (!selectedBatch) {
            Swal.fire({ icon: 'error', title: 'No Batch Selected', text: 'Please select a batch to dispense from.', confirmButtonText: 'OK' });
            return;
        }

        // Get the max quantity for the selected batch
        const batch = batches.find((b: any) => b.medicine_stock_in_id === selectedBatch);
        const maxAllowed = batch ? batch.quantity : maxQuantityForSelectedBatch;

        if (numQuantity > maxAllowed) {
            Swal.fire({
                icon: 'error',
                title: 'Quantity Exceeds Available Stock',
                text: `The quantity cannot exceed ${maxAllowed} units for this batch.`,
                confirmButtonText: 'OK'
            });
            return;
        }

        onSubmit(selectedBatch, numQuantity);
        setIsOpen(false);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <>
            <style>{`
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.95) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0px); opacity: 1; } }
            `}</style>
            
            <div className={`${isOpen ? 'block' : 'hidden'}`}>
                <div
                    onClick={handleClose}
                    className="bg-black/30 backdrop-blur-sm fixed inset-0 z-50 grid place-items-center overflow-y-auto cursor-pointer animate-fade-in"
                >
                    <div
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        className="bg-white rounded-xl w-full max-w-sm shadow-2xl cursor-default relative overflow-hidden animate-scale-in border-2 border-[#A3386C]"
                    >
                        <div className="p-8 text-center">
                            
                            <h2 className="text-2xl font-bold text-red-600 mb-4">
                                DISPENSE MEDICINE
                            </h2>
                            
                            {/* Medicine Information */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                                <div className="mb-2">
                                    <span className="font-semibold text-gray-700">Medicine: </span>
                                    <span className="text-gray-900">{medicineName}</span>
                                </div>
                                <div className="mb-2">
                                    <span className="font-semibold text-gray-700">Category: </span>
                                    <span className="text-gray-900">{medicineCategory}</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Current Stock: </span>
                                    <span className="text-green-600 font-bold">{currentStock} units</span>
                                </div>
                            </div>
                            
                            <p className="text-md text-gray-700 mb-3">
                                Select Date Received, Expiration Date, and Quantity to dispense:
                            </p>

                                {batches && batches.length > 0 && (
                                    <>
                                        <div className="mb-3 text-left">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Date Received</label>
                                            <select
                                                value={selectedDateReceived ?? ''}
                                                onChange={(e) => {
                                                    const val = e.target.value || '';
                                                    setSelectedDateReceived(val || null);
                                                    if (val) {
                                                        // Filter batches having this date_received
                                                        const matched = (batches || []).filter((b: any) => normalizeDate(b.date_received) === normalizeDate(val));
                                                        // sort by expiration (closest first)
                                                        matched.sort((a: any, b: any) => {
                                                            if (!a.expiration_date) return 1;
                                                            if (!b.expiration_date) return -1;
                                                            return new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime();
                                                        });
                                                        // Only update filtered batches. Do NOT auto-select expiration or batch.
                                                        setFilteredBatches(matched);
                                                        // Clear previous selection so the user must choose expiration and batch explicitly
                                                        setSelectedBatch(null);
                                                        setExpirationDate(null);
                                                    } else {
                                                        // All Dates
                                                        setFilteredBatches(batches);
                                                        setSelectedBatch(null);
                                                        setExpirationDate(null);
                                                    }
                                                }}
                                                className="w-full p-3 border rounded text-base text-gray-700"
                                            >
                                                <option value="">-- All Dates --</option>
                                                {Array.from(new Set(batches.map((b: any) => normalizeDate(b.date_received)))).map((d: any) => (
                                                    <option key={d} value={d}>{d === NO_DATE ? 'No Date' : new Date(d).toLocaleDateString()}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-3 text-left">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Expiration Date</label>
                                            <select
                                                value={expirationDate ?? ''}
                                                onChange={(e) => {
                                                    const raw = e.target.value || null;
                                                    const val = raw ? normalizeDate(raw) : null;
                                                    setExpirationDate(val);
                                                    const match = (filteredBatches || batches).find((b: any) => normalizeDate(b.expiration_date) === normalizeDate(val));
                                                    if (match) {
                                                        setSelectedBatch(match.medicine_stock_in_id);
                                                        setMaxQuantityForSelectedBatch(match.quantity || 0);
                                                    } else {
                                                        setSelectedBatch(null);
                                                        setMaxQuantityForSelectedBatch(currentStock);
                                                    }
                                                }}
                                                className={`w-full p-3 border rounded text-base text-gray-700 ${!selectedDateReceived ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`}
                                                disabled={!selectedDateReceived}
                                            >
                                                <option value="">-- Select expiration date --</option>
                                                {Array.from(new Set((filteredBatches || []).map((b: any) => normalizeDate(b.expiration_date)))).map((d: any) => (
                                                    <option key={d} value={d}>{d === NO_DATE ? 'No Expiry' : new Date(d).toLocaleDateString()}</option>
                                                ))}
                                            </select>
                                            {/* when disabled, apply a locked appearance via opacity and cursor */}
                                        </div>
                                    </>
                                )}

                            <div className="text-left mb-2">
                                <label className="block text-sm font-semibold text-gray-700">Quantity to Dispense</label>
                            </div>

                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder={selectedBatch ? `Max: ${maxQuantityForSelectedBatch}` : 'Select a batch first'}
                                min="1"
                                max={maxQuantityForSelectedBatch}
                                className="w-full text-center p-2 border-2 border-[#A3386C] rounded-lg focus:ring-2 focus:ring-[#A3386C] focus:border-transparent text-gray-700 text-base"
                                disabled={!selectedBatch}
                                autoFocus
                            />
                            
                            {/* Updated button container */}
                            <div className="flex justify-center items-center space-x-4 mt-6">
                                {/* Cancel Button Added */}
                                <button
                                    onClick={handleClose}
                                    className="w-full bg-transparent hover:bg-gray-100 border border-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-[#9D446F] hover:bg-[#833a5e] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 cursor-pointer"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DispenseMedicineModal;