import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface RemovalReasonModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    // new: pass selected stock_in id and its dates when submitting
    // signature: description, dateReceived, expirationDate, medicineStockInId, quantity
    onSubmit: (description: string, dateReceived?: string | null, expirationDate?: string | null, medicineStockInId?: number | null, quantity?: number | null) => void;
    currentStock?: number;
    medicineName?: string;
    medicineCategory?: string;
    // list of available batches (from medicine_stock_in) to choose from
    batchOptions?: Array<{
        medicine_stock_in_id: number;
        date_received?: string | null;
        expiration_date?: string | null;
        quantity?: number | null;
    }>;
}

type BatchOption = {
    medicine_stock_in_id: number;
    date_received?: string | null;
    expiration_date?: string | null;
    quantity?: number | null;
};

const RemovalReasonModal: React.FC<RemovalReasonModalProps> = ({ 
    isOpen, 
    setIsOpen, 
    onSubmit, 
    currentStock = 0,
    medicineName = 'Unknown Medicine',
    medicineCategory = 'No Category',
    batchOptions
}) => {
    
    const [description, setDescription] = useState('');

    // Clear the form when the modal opens
    useEffect(() => {
        if (isOpen) {
            setDescription('');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        // Validate description length and content
        if (!description.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Description Required',
                text: 'Please provide a description for why this medicine is being archived.',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        // Archive all batches of this medicine - pass null for dates and stock in id
        // Backend will handle archiving all batches for this medicine
        onSubmit(description.trim(), null, null, null, null);
        setIsOpen(false); // Close modal on successful submission
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* Styles for animations, same as the provided LogoutModal */}
            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                
                .animate-scale-in {
                    animation: scaleIn 0.3s ease-out forwards;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes scaleIn {
                    from { transform: scale(0.95) translateY(10px); opacity: 0; }
                    to { transform: scale(1) translateY(0px); opacity: 1; }
                }
            `}</style>
            
            <div className={`${isOpen ? 'block' : 'hidden'}`}>
                {/* Backdrop */}
                <div
                    onClick={handleClose}
                    className="bg-black/30 backdrop-blur-sm fixed inset-0 z-50 grid place-items-center overflow-y-auto cursor-pointer animate-fade-in"
                >
                    {/* Modal Content */}
                    <div
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        className="bg-white rounded-xl w-full max-w-md shadow-2xl cursor-default relative overflow-hidden animate-scale-in border-2 border-[#A3386C]"
                    >
                        <div className="p-8 text-center">
                            
                            <h3 className="text-lg font-semibold text-[#A3386C] mt-2">
                                REASON FOR ARCHIVING
                            </h3>

                            <p className="text-sm text-gray-500 mb-4">
                                Fill in the required details for archiving this stock
                            </p>

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
                            </div>

                            {/* Description Textarea */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                                    Reason for Archiving:
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Provide reason for archiving (e.g., expired, damaged, recall)"
                                    className="w-full h-28 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A3386C] focus:border-transparent resize-none text-gray-700"
                                />
                            </div>
                            
                            <div className="flex justify-center items-center space-x-4 mt-6">
                                <button
                                    onClick={handleClose}
                                    className="w-full bg-transparent hover:bg-gray-100 border border-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-[#A3386C] hover:bg-[#8a2f5a] text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 cursor-pointer"
                                >
                                    ARCHIVE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RemovalReasonModal;