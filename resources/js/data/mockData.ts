// resources/js/data/mockData.ts
export interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    address: string;
    contact: string;
    lastVisit: string;
    medicalHistory: Array<{
        condition: string;
        diagnosed: string;
    }>;
    consultations: Array<{
        date: string;
        notes: string;
    }>;
    remarks: Array<{
        date: string;
        note: string;
    }>;
    additionalProfile: {
        lastName: string;
        firstName: string;
        middleInitial: string;
        suffix: string;
        dateOfBirth: string;
        nationality: string;
        civilStatus: string;
        address: string;
        guardianName: string;
        guardianContact: string;
        bloodType: string;
        height: string;
        religion: string;
        eyeColor: string;
        chronicConditions: string[];
        knownAllergies: string[];
        disabilities: string;
        immunizationHistory: string[];
        geneticConditions: string;
    };
}

export interface Student extends Patient {
    course: string;
    type: 'student';
}

export interface Employee extends Patient {
    department: string;
    position: string;
    type: 'employee';
}

// Combined mock data for both students and employees
export const mockPatients: Record<string, Student | Employee> = {
    // Students
    "5": {
        id: "5",
        name: "Patricia Mae Fernandez",
        age: 21,
        gender: "Female",
        course: "BSN",
        address: "Catalunan Pequeño, Davao City",
        contact: "09156789234",
        lastVisit: "2025-08-15",
        medicalHistory: [
            { condition: "Mild Anemia", diagnosed: "2024-02-10" }
        ],
        consultations: [
            { date: "2025-08-15", notes: "Regular checkup, iron levels slightly low." }
        ],
        remarks: [
            { date: "2025-08-15", note: "Prescribed iron supplements." }
        ],
        additionalProfile: {
            lastName: "Fernandez",
            firstName: "Patricia Mae",
            middleInitial: "L",
            suffix: "",
            dateOfBirth: "2004-05-22",
            nationality: "Filipino",
            civilStatus: "Single",
            address: "Catalunan Pequeño, Davao City",
            guardianName: "Manuel Fernandez",
            guardianContact: "09187654321",
            bloodType: "B+",
            height: "162 cm",
            religion: "Catholic",
            eyeColor: "Brown",
            chronicConditions: ["Mild Anemia"],
            knownAllergies: ["Dust"],
            disabilities: "None",
            immunizationHistory: ["Hepatitis B", "MMR", "Flu Shot"],
            geneticConditions: "None"
        },
        type: "student"
    },
    "6": {
        id: "6",
        name: "Miguel Antonio Reyes",
        age: 20,
        gender: "Male",
        course: "BSIT",
        address: "Buhangin, Davao City",
        contact: "09234567891",
        lastVisit: "2025-07-30",
        medicalHistory: [
            { condition: "Myopia", diagnosed: "2020-03-15" }
        ],
        consultations: [
            { date: "2025-07-30", notes: "Complained of eye strain from computer use." }
        ],
        remarks: [
            { date: "2025-07-30", note: "Advised regular breaks from screen time." }
        ],
        additionalProfile: {
            lastName: "Reyes",
            firstName: "Miguel Antonio",
            middleInitial: "D",
            suffix: "",
            dateOfBirth: "2005-08-12",
            nationality: "Filipino",
            civilStatus: "Single",
            address: "Buhangin, Davao City",
            guardianName: "Carmen Reyes",
            guardianContact: "09198765432",
            bloodType: "A+",
            height: "175 cm",
            religion: "Catholic",
            eyeColor: "Black",
            chronicConditions: ["Myopia"],
            knownAllergies: [],
            disabilities: "None",
            immunizationHistory: ["Hepatitis B", "MMR"],
            geneticConditions: "None"
        },
        type: "student"
    },
    "7": {
        id: "7",
        name: "Sofia Isabel Santos",
        age: 19,
        gender: "Female",
        course: "BS Psychology",
        address: "Talomo, Davao City",
        contact: "09345678912",
        lastVisit: "2025-08-10",
        medicalHistory: [
            { condition: "Seasonal Allergies", diagnosed: "2023-06-20" }
        ],
        consultations: [
            { date: "2025-08-10", notes: "Allergy symptoms acting up due to weather." }
        ],
        remarks: [
            { date: "2025-08-10", note: "Prescribed antihistamines." }
        ],
        additionalProfile: {
            lastName: "Santos",
            firstName: "Sofia Isabel",
            middleInitial: "M",
            suffix: "",
            dateOfBirth: "2006-01-30",
            nationality: "Filipino",
            civilStatus: "Single",
            address: "Talomo, Davao City",
            guardianName: "Isabel Santos",
            guardianContact: "09209876543",
            bloodType: "O+",
            height: "158 cm",
            religion: "Catholic",
            eyeColor: "Brown",
            chronicConditions: ["Seasonal Allergies"],
            knownAllergies: ["Pollen", "Dust"],
            disabilities: "None",
            immunizationHistory: ["Hepatitis B", "MMR", "Flu Shot"],
            geneticConditions: "None"
        },
        type: "student"
    },
    "8": {
        id: "8",
        name: "Rafael Martin Cruz",
        age: 22,
        gender: "Male",
        course: "BS Architecture",
        address: "Maa, Davao City",
        contact: "09456789123",
        lastVisit: "2025-08-05",
        medicalHistory: [
            { condition: "Mild Scoliosis", diagnosed: "2021-09-15" }
        ],
        consultations: [
            { date: "2025-08-05", notes: "Regular checkup for posture improvement." }
        ],
        remarks: [
            { date: "2025-08-05", note: "Recommended physical therapy exercises." }
        ],
        additionalProfile: {
            lastName: "Cruz",
            firstName: "Rafael Martin",
            middleInitial: "P",
            suffix: "",
            dateOfBirth: "2003-11-15",
            nationality: "Filipino",
            civilStatus: "Single",
            address: "Maa, Davao City",
            guardianName: "Pablo Cruz",
            guardianContact: "09212345678",
            bloodType: "AB+",
            height: "180 cm",
            religion: "Protestant",
            eyeColor: "Black",
            chronicConditions: ["Mild Scoliosis"],
            knownAllergies: [],
            disabilities: "Mild Scoliosis",
            immunizationHistory: ["Hepatitis B", "MMR"],
            geneticConditions: "None"
        },
        type: "student"
    },
    "9": {
        id: "9",
        name: "Isabella Marie Tan",
        age: 20,
        gender: "Female",
        course: "BS Accountancy",
        address: "Lanang, Davao City",
        contact: "09567891234",
        lastVisit: "2025-08-12",
        medicalHistory: [
            { condition: "Migraine", diagnosed: "2022-11-30" }
        ],
        consultations: [
            { date: "2025-08-12", notes: "Stress-induced migraine episode." }
        ],
        remarks: [
            { date: "2025-08-12", note: "Prescribed migraine medication and stress management techniques." }
        ],
        additionalProfile: {
            lastName: "Tan",
            firstName: "Isabella Marie",
            middleInitial: "G",
            suffix: "",
            dateOfBirth: "2005-04-18",
            nationality: "Filipino",
            civilStatus: "Single",
            address: "Lanang, Davao City",
            guardianName: "Grace Tan",
            guardianContact: "09223456789",
            bloodType: "A+",
            height: "165 cm",
            religion: "Catholic",
            eyeColor: "Brown",
            chronicConditions: ["Migraine"],
            knownAllergies: ["Seafood"],
            disabilities: "None",
            immunizationHistory: ["Hepatitis B", "MMR", "Flu Shot"],
            geneticConditions: "None"
        },
        type: "student"
    },
    "1": {
        id: "1",
        name: "Juan Dela Cruz",
        age: 20,
        gender: "Male",
        course: "BSIT",
        address: "Fr Selga, Davao City",
        contact: "09123456789",
        lastVisit: "2025-08-01",
        medicalHistory: [
            { condition: "Asthma", diagnosed: "2023-01-15" },
            { condition: "Allergy to Penicillin", diagnosed: "2022-05-10" }
        ],
        consultations: [
            { date: "2025-08-01", notes: "Complained of headache and fatigue." },
            { date: "2025-07-15", notes: "Routine checkup, no issues found." }
        ],
        remarks: [
            { date: "2025-08-01", note: "Prescribed pain reliever." },
            { date: "2025-07-15", note: "Advised to drink more water." }
        ],
        additionalProfile: {
            lastName: "Dela Cruz",
            firstName: "Juan",
            middleInitial: "A",
            suffix: "Jr.",
            dateOfBirth: "2005-03-15",
            nationality: "Filipino",
            civilStatus: "Single",
            address: "Fr Selga, Davao City",
            guardianName: "Maria Dela Cruz",
            guardianContact: "09123456780",
            bloodType: "O+",
            height: "170 cm",
            religion: "Catholic",
            eyeColor: "Brown",
            chronicConditions: ["Asthma"],
            knownAllergies: ["Penicillin"],
            disabilities: "None",
            immunizationHistory: ["Hepatitis B", "MMR"],
            geneticConditions: "None"
        },
        type: "student"
    },
    "2": {
        id: "2",
        name: "Maria Santos",
        age: 19,
        gender: "Female",
        course: "BSN",
        address: "Toril, Davao City",
        contact: "09123456788",
        lastVisit: "2025-07-28",
        medicalHistory: [
            { condition: "Migraine", diagnosed: "2023-03-20" }
        ],
        consultations: [
            { date: "2025-07-28", notes: "Complained of severe headache." }
        ],
        remarks: [
            { date: "2025-07-28", note: "Prescribed migraine medication." }
        ],
        additionalProfile: {
            lastName: "Santos",
            firstName: "Maria",
            middleInitial: "B",
            suffix: "",
            dateOfBirth: "2006-07-20",
            nationality: "Filipino",
            civilStatus: "Single",
            address: "Toril, Davao City",
            guardianName: "Roberto Santos",
            guardianContact: "09123456781",
            bloodType: "A+",
            height: "160 cm",
            religion: "Born Again Christian",
            eyeColor: "Black",
            chronicConditions: ["Migraine"],
            knownAllergies: [],
            disabilities: "None",
            immunizationHistory: ["Hepatitis B", "Varicella"],
            geneticConditions: "None"
        },
        type: "student"
    },
    // Employees
    "10": {
        id: "10",
        name: "Dr. Maria Christina Lim",
        age: 42,
        gender: "Female",
        department: "Medical Department",
        position: "School Physician",
        address: "Damosa, Davao City",
        contact: "09678912345",
        lastVisit: "2025-07-25",
        medicalHistory: [],
        consultations: [
            { date: "2025-07-25", notes: "Annual physical examination." }
        ],
        remarks: [
            { date: "2025-07-25", note: "All vitals normal." }
        ],
        additionalProfile: {
            lastName: "Lim",
            firstName: "Maria Christina",
            middleInitial: "R",
            suffix: "MD",
            dateOfBirth: "1983-09-08",
            nationality: "Filipino",
            civilStatus: "Married",
            address: "Damosa, Davao City",
            guardianName: "Robert Lim",
            guardianContact: "09234567890",
            bloodType: "B+",
            height: "163 cm",
            religion: "Catholic",
            eyeColor: "Brown",
            chronicConditions: [],
            knownAllergies: [],
            disabilities: "None",
            immunizationHistory: ["Hepatitis B", "MMR", "COVID-19"],
            geneticConditions: "None"
        },
        type: "employee"
    },
    "11": {
        id: "11",
        name: "Benjamin David Santos",
        age: 35,
        gender: "Male",
        department: "Information Technology",
        position: "IT Manager",
        address: "Ma-a, Davao City",
        contact: "09789123456",
        lastVisit: "2025-08-02",
        medicalHistory: [
            { condition: "Type 2 Diabetes", diagnosed: "2023-05-15" }
        ],
        consultations: [
            { date: "2025-08-02", notes: "Regular blood sugar monitoring." }
        ],
        remarks: [
            { date: "2025-08-02", note: "Blood sugar levels well-controlled with medication." }
        ],
        additionalProfile: {
            lastName: "Santos",
            firstName: "Benjamin David",
            middleInitial: "C",
            suffix: "",
            dateOfBirth: "1990-02-15",
            nationality: "Filipino",
            civilStatus: "Married",
            address: "Ma-a, Davao City",
            guardianName: "Clara Santos",
            guardianContact: "09245678901",
            bloodType: "O+",
            height: "172 cm",
            religion: "Christian",
            eyeColor: "Black",
            chronicConditions: ["Type 2 Diabetes"],
            knownAllergies: [],
            disabilities: "None",
            immunizationHistory: ["Hepatitis B", "Flu Shot", "COVID-19"],
            geneticConditions: "None"
        },
        type: "employee"
    },
    "12": {
        id: "12",
        name: "Elena Marie Rodriguez",
        age: 29,
        gender: "Female",
        department: "Student Affairs",
        position: "Student Counselor",
        address: "Matina, Davao City",
        contact: "09891234567",
        lastVisit: "2025-08-08",
        medicalHistory: [],
        consultations: [
            { date: "2025-08-08", notes: "Routine health checkup." }
        ],
        remarks: [
            { date: "2025-08-08", note: "Recommended regular exercise." }
        ],
        additionalProfile: {
            lastName: "Rodriguez",
            firstName: "Elena Marie",
            middleInitial: "F",
            suffix: "",
            dateOfBirth: "1996-06-22",
            nationality: "Filipino",
            civilStatus: "Single",
            address: "Matina, Davao City",
            guardianName: "Francisco Rodriguez",
            guardianContact: "09256789012",
            bloodType: "A+",
            height: "160 cm",
            religion: "Catholic",
            eyeColor: "Brown",
            chronicConditions: [],
            knownAllergies: ["Peanuts"],
            disabilities: "None",
            immunizationHistory: ["Hepatitis B", "MMR", "COVID-19"],
            geneticConditions: "None"
        },
        type: "employee"
    },
    "13": {
        id: "13",
        name: "Ricardo Manuel Gonzales",
        age: 48,
        gender: "Male",
        department: "Facilities Management",
        position: "Facilities Director",
        address: "Cabantian, Davao City",
        contact: "09912345678",
        lastVisit: "2025-07-20",
        medicalHistory: [
            { condition: "Hypertension", diagnosed: "2021-03-10" }
        ],
        consultations: [
            { date: "2025-07-20", notes: "Blood pressure monitoring." }
        ],
        remarks: [
            { date: "2025-07-20", note: "BP within normal range with medication." }
        ],
        additionalProfile: {
            lastName: "Gonzales",
            firstName: "Ricardo Manuel",
            middleInitial: "T",
            suffix: "",
            dateOfBirth: "1977-12-03",
            nationality: "Filipino",
            civilStatus: "Married",
            address: "Cabantian, Davao City",
            guardianName: "Teresa Gonzales",
            guardianContact: "09267890123",
            bloodType: "AB+",
            height: "178 cm",
            religion: "Catholic",
            eyeColor: "Brown",
            chronicConditions: ["Hypertension"],
            knownAllergies: [],
            disabilities: "None",
            immunizationHistory: ["Hepatitis B", "Flu Shot", "COVID-19"],
            geneticConditions: "None"
        },
        type: "employee"
    },
    "14": {
        id: "14",
        name: "Angelica Rose Villanueva",
        age: 33,
        gender: "Female",
        department: "Library Services",
        position: "Head Librarian",
        address: "Bacaca, Davao City",
        contact: "09123456780",
        lastVisit: "2025-08-14",
        medicalHistory: [
            { condition: "Astigmatism", diagnosed: "2019-07-22" }
        ],
        consultations: [
            { date: "2025-08-14", notes: "Annual eye checkup." }
        ],
        remarks: [
            { date: "2025-08-14", note: "Prescription glasses updated." }
        ],
        additionalProfile: {
            lastName: "Villanueva",
            firstName: "Angelica Rose",
            middleInitial: "B",
            suffix: "",
            dateOfBirth: "1992-04-15",
            nationality: "Filipino",
            civilStatus: "Single",
            address: "Bacaca, Davao City",
            guardianName: "Benjamin Villanueva",
            guardianContact: "09278901234",
            bloodType: "O+",
            height: "165 cm",
            religion: "Catholic",
            eyeColor: "Brown",
            chronicConditions: ["Astigmatism"],
            knownAllergies: ["Dust"],
            disabilities: "None",
            immunizationHistory: ["Hepatitis B", "MMR", "COVID-19"],
            geneticConditions: "None"
        },
        type: "employee"
    },
    "3": {
        id: "3",
        name: "Dr. Roberto Garcia",
        age: 45,
        gender: "Male",
        department: "Medical Department",
        position: "Chief Medical Officer",
        address: "Bajada, Davao City",
        contact: "09123456787",
        lastVisit: "2025-06-15",
        medicalHistory: [
            { condition: "Hypertension", diagnosed: "2020-01-10" }
        ],
        consultations: [
            { date: "2025-06-15", notes: "Annual checkup, blood pressure slightly elevated." }
        ],
        remarks: [
            { date: "2025-06-15", note: "Advised to reduce salt intake and exercise regularly." }
        ],
        additionalProfile: {
            lastName: "Garcia",
            firstName: "Roberto",
            middleInitial: "M",
            suffix: "",
            dateOfBirth: "1978-12-05",
            nationality: "Filipino",
            civilStatus: "Married",
            address: "Bajada, Davao City",
            guardianName: "Elena Garcia",
            guardianContact: "09123456782",
            bloodType: "B+",
            height: "175 cm",
            religion: "Catholic",
            eyeColor: "Brown",
            chronicConditions: ["Hypertension"],
            knownAllergies: [],
            disabilities: "None",
            immunizationHistory: ["Hepatitis B", "Influenza"],
            geneticConditions: "None"
        },
        type: "employee"
    },
    "4": {
        id: "4",
        name: "Ana Reyes",
        age: 38,
        gender: "Female",
        department: "Administration",
        position: "HR Manager",
        address: "Matina, Davao City",
        contact: "09123456786",
        lastVisit: "2025-07-10",
        medicalHistory: [],
        consultations: [
            { date: "2025-07-10", notes: "Routine checkup for work clearance." }
        ],
        remarks: [
            { date: "2025-07-10", note: "All vitals normal, fit for work." }
        ],
        additionalProfile: {
            lastName: "Reyes",
            firstName: "Ana",
            middleInitial: "C",
            suffix: "",
            dateOfBirth: "1985-03-12",
            nationality: "Filipino",
            civilStatus: "Married",
            address: "Matina, Davao City",
            guardianName: "Carlos Reyes",
            guardianContact: "09123456783",
            bloodType: "AB+",
            height: "165 cm",
            religion: "Catholic",
            eyeColor: "Black",
            chronicConditions: [],
            knownAllergies: ["Shellfish"],
            disabilities: "None",
            immunizationHistory: ["Hepatitis B", "MMR", "Varicella"],
            geneticConditions: "None"
        },
        type: "employee"
    }
};

// Helper functions
export const getPatientById = (id: string): Student | Employee | undefined => {
    return mockPatients[id];
};

export const getStudents = (): Student[] => {
    return Object.values(mockPatients).filter(patient => patient.type === 'student') as Student[];
};

export const getEmployees = (): Employee[] => {
    return Object.values(mockPatients).filter(patient => patient.type === 'employee') as Employee[];
};

// Function to add consultation to a patient
export const addConsultation = (patientId: string, consultation: { date: string; notes: string }) => {
    if (mockPatients[patientId]) {
        mockPatients[patientId].consultations.push(consultation);
    }
};

// Function to add remark to a patient
export const addRemark = (patientId: string, remark: { date: string; note: string }) => {
    if (mockPatients[patientId]) {
        mockPatients[patientId].remarks.push(remark);
    }
};