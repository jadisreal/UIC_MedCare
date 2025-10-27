import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { X, Plus, Calendar, CheckCircle } from 'lucide-react';

interface AddMedicineModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onAddMedicine: (medicineData: MedicineFormData) => void;
    branchName?: string;
    medicineOptions?: string[]; // list of existing medicine names for the datalist
}

interface MedicineFormData {
    medicineName: string;
    category: string;
    dateReceived: string;
    expirationDate: string;
    quantity: number;
}

const initialFormData: MedicineFormData = {
    medicineName: '',
    category: '',
    dateReceived: '',
    expirationDate: '',
    quantity: 0
};

const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
    isOpen,
    setIsOpen,
    onAddMedicine,
    branchName,
    medicineOptions = []
}) => {
    const [formData, setFormData] = useState<MedicineFormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Removed view state

    // Remove duplicates from medicine options and sort alphabetically
    const uniqueMedicineOptions = React.useMemo(() => {
        return Array.from(new Set(medicineOptions)).sort((a, b) => a.localeCompare(b));
    }, [medicineOptions]);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormData);
            setErrors({});
        }
    }, [isOpen]);

    // Get current date and time
    const getCurrentDateTime = () => {
        const now = new Date();
        const date = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const time = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        return { date, time };
    };

    const { date, time } = getCurrentDateTime();

    // Medicine categories
    const categories = [
        'Pain Relief', 'Antibiotic', 'Anti-inflammatory', 'Antihistamine', 'Antacid',
        'Cardioprotective', 'Bronchodilator', 'Diabetes', 'Hypertension', 'Antiseptic',
        'First Aid', 'Rehydration', 'Cough Relief', 'Supplements', 'Emergency', 'Medical Device'
    ];

    const handleInputChange = (field: keyof MedicineFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.medicineName.trim()) newErrors.medicineName = 'Medicine name is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.dateReceived) newErrors.dateReceived = 'Date received is required';
        if (!formData.expirationDate) {
            newErrors.expirationDate = 'Expiration date is required';
        } else if (new Date(formData.expirationDate) <= new Date(formData.dateReceived)) {
            newErrors.expirationDate = 'Expiration date must be after received date';
        }
        if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

        const handleSubmit = (e: React.FormEvent) => {
                    e.preventDefault();
                    if (isSubmitting) return; // prevent double submit
                    if (validateForm()) {
                            try {
                                setIsSubmitting(true);
                                onAddMedicine(formData);
                            } finally {
                                // allow closing to reset; keep locked until modal closes
                                setIsSubmitting(false);
                            }
                    }
        };

    const handleClose = () => {
        setFormData(initialFormData);
        setErrors({});
        setIsOpen(false);
    // No view state to reset
    };

    // Removed SuccessView
    
    return (
        <>
            <style>{`
                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
                .animate-scale-in { animation: scaleIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.9) rotate(3deg); opacity: 0; } to { transform: scale(1) rotate(0deg); opacity: 1; } }
            `}</style>

            <div className={`${isOpen ? 'block' : 'hidden'}`}>
                <div
                    onClick={handleClose}
                    className="bg-black/20 backdrop-blur-sm p-4 fixed inset-0 z-50 grid place-items-center overflow-y-auto cursor-pointer animate-fade-in"
                >
                    <div
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        className="bg-white rounded-lg w-full max-w-md shadow-2xl cursor-default relative overflow-hidden animate-scale-in"
                        style={{ maxHeight: '95vh' }}
                    >
                        <Plus className="text-[#A3386C]/10 rotate-12 text-[200px] absolute z-0 -top-16 -right-16" />
                        <div className="relative z-10">
                            <div className="bg-gradient-to-r from-[#3D1528] to-[#A3386C] text-white p-6 relative">
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                                <div className="text-center">
                                    <h2 className="text-lg font-bold mb-1">{date}</h2>
                                    <p className="text-white/90 text-xs mb-4">{time}</p>
                                    <div className="w-20 h-0.5 bg-white/50 mx-auto"></div>
                                </div>
                            </div>
                            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 120px)' }}>
                                <p className="text-red-500 text-sm text-center mb-4 italic">
                                    Fill in all required details to save this medicine to the system.
                                </p>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Medicine Name */}
                                    <div>
                                        <label className="block text-gray-700 text-xs font-medium mb-1 uppercase tracking-wider">Medicine Name</label>
                                        {/* Typable select using datalist so user can type or pick existing medicines */}
                                        <input
                                            list="medicine-options"
                                            value={formData.medicineName}
                                            onChange={(e) => handleInputChange('medicineName', e.target.value)}
                                            className={`w-full px-3 py-2 border-0 border-b-2 ${errors.medicineName ? 'border-red-500' : 'border-gray-300 focus:border-[#A3386C]'} bg-transparent focus:outline-none transition-colors text-black text-sm`}
                                            placeholder="Enter or select medicine name"
                                        />
                                        <datalist id="medicine-options">
                                            {uniqueMedicineOptions.map((m, idx) => (
                                                <option key={`${m}-${idx}`} value={m} />
                                            ))}
                                        </datalist>
                                        {errors.medicineName && <p className="text-red-500 text-xs mt-1">{errors.medicineName}</p>}
                                    </div>
                                    {/* Category */}
                                    <div>
                                        <label className="block text-gray-700 text-xs font-medium mb-1 uppercase tracking-wider">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => handleInputChange('category', e.target.value)}
                                            className={`w-full px-3 py-2 border-0 border-b-2 ${errors.category ? 'border-red-500' : 'border-gray-300 focus:border-[#A3386C]'} bg-transparent focus:outline-none transition-colors text-black text-sm`}
                                        >
                                            <option value="">Select category</option>
                                            {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                                        </select>
                                        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                                    </div>
                                    {/* Date Received & Expiration Date (Side-by-side) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-700 text-xs font-medium mb-1 uppercase tracking-wider">Date Received</label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    value={formData.dateReceived}
                                                    onChange={(e) => handleInputChange('dateReceived', e.target.value)}
                                                    className={`w-full px-3 py-2 border-0 border-b-2 ${errors.dateReceived ? 'border-red-500' : 'border-gray-300 focus:border-[#A3386C]'} bg-transparent focus:outline-none transition-colors text-black text-sm`}
                                                />
                                                <Calendar className="absolute right-3 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            {errors.dateReceived && <p className="text-red-500 text-xs mt-1">{errors.dateReceived}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-xs font-medium mb-1 uppercase tracking-wider">Expiration Date</label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    value={formData.expirationDate}
                                                    onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                                                    className={`w-full px-3 py-2 border-0 border-b-2 ${errors.expirationDate ? 'border-red-500' : 'border-gray-300 focus:border-[#A3386C]'} bg-transparent focus:outline-none transition-colors text-black text-sm`}
                                                />
                                                <Calendar className="absolute right-3 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            {errors.expirationDate && <p className="text-red-500 text-xs mt-1">{errors.expirationDate}</p>}
                                        </div>
                                    </div>
                                    {/* Quantity */}
                                    <div>
                                        <label className="block text-gray-700 text-xs font-medium mb-1 uppercase tracking-wider">Quantity</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.quantity || ''}
                                            onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                                            className={`w-full px-3 py-2 border-0 border-b-2 ${errors.quantity ? 'border-red-500' : 'border-gray-300 focus:border-[#A3386C]'} bg-transparent focus:outline-none transition-colors text-black text-sm`}
                                            placeholder="Enter quantity"
                                        />
                                        {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                                    </div>
                                    {/* Submit Button */}
                                    <div className="flex justify-center pt-2">
                                        <button
                                            type="submit"
                                            className="bg-[#A3386C] hover:bg-[#8a2f5a] text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 shadow-lg hover:scale-105 transform text-sm"
                                            disabled={isSubmitting}
                                        >
                                            ADD MEDICINE
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddMedicineModal;