import React, { useState } from 'react';
import NotificationBell, { Notification as NotificationType } from '../components/NotificationBell';
import { router } from '@inertiajs/react';
import Sidebar from '../components/Sidebar';
import { Menu, Facebook, Instagram, Linkedin } from 'lucide-react';

interface CreatorCardProps {
    image: string;
    quote: string;
    name: string;
    title: string;
    fbLink: string;
    igLink: string;
    liLink: string;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ image, quote, name, title, fbLink, igLink, liLink }) => (
    <div className={`relative flex flex-col h-full bg-gradient-to-b from-[#3D1528] to-[#A3386C] text-white p-6 pt-12 rounded-xl shadow-2xl`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <img src={image} alt={name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
        </div>
        <div className="flex-grow">
            <p className="text-center text-base italic text-gray-300 mb-4">
                "{quote}"
            </p>
        </div>
        <div className="text-center mt-auto">
            <p className="font-bold text-white text-lg">{name}</p>
            <p className="text-sm text-indigo-300 font-semibold">{title}</p>
            <div className="flex justify-center space-x-4 mt-4">
                <a href={fbLink} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-200">
                    <Facebook size={20} />
                </a>
                <a href={igLink} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-200">
                    <Instagram size={20} />
                </a>
                <a href={liLink} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-200">
                    <Linkedin size={20} />
                </a>
            </div>
        </div>
    </div>
);


const About: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);

    const notifications: NotificationType[] = [
        { id: 1, type: 'info', message: 'Updated Medicine', isRead: false, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
        { id: 2, type: 'success', message: 'Medicine Request Received', isRead: false, createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() },
    ];
    
    const creators = [
        {
            image: '/images/nurse.jpg',
            quote: "Leading the development from concept to deployment, ensuring a robust and scalable architecture for MEDITRACK.",
            name: 'Henna Marie Barcebal',
            title: 'Project Manager',
            fbLink: 'https://facebook.com',
            igLink: 'https://instagram.com',
            liLink: 'https://linkedin.com'
        },
        {
            image: '/images/nurse.jpg',
            quote: "Crafting an intuitive and accessible user experience was my passion. I focused on making the interface clean and easy to navigate.",
            name: 'Francis Franklin Bangoy',
            title: 'Programmer',
            fbLink: 'https://facebook.com',
            igLink: 'https://instagram.com',
            liLink: 'https://linkedin.com'
        },
        {
            image: '/images/nurse.jpg',
            quote: "Building the backbone of the system, I developed the server-side logic and database management for reliable performance.",
            name: 'Rafael Daniel Bisnar',
            title: 'UI/UX Designer',
            fbLink: 'https://facebook.com',
            igLink: 'https://instagram.com',
            liLink: 'https://linkedin.com'
        },
        {
            image: '/images/nurse.jpg',
            quote: "My goal was to ensure a bug-free and reliable application through rigorous testing and quality assurance protocols.",
            name: 'Sebastian Lex Ampon',
            title: 'Project Manager',
            fbLink: 'https://facebook.com',
            igLink: 'https://instagram.com',
            liLink: 'https://linkedin.com'
        },
        {
            image: '/images/nurse.jpg',
            quote: "Designed the database schema for optimal data integrity and efficient query performance, ensuring all medical data is secure.",
            name: 'David',
            title: 'Programmer',
            fbLink: 'https://facebook.com',
            igLink: 'https://instagram.com',
            liLink: 'https://linkedin.com'
        },
        {
            image: '/images/nurse.jpg',
            quote: "Translated the UI/UX designs into a responsive and interactive reality using React, focusing on performance and a smooth user flow.",
            name: 'Wam Ausan',
            title: 'Quality Assurance',
            fbLink: 'https://facebook.com',
            igLink: 'https://instagram.com',
            liLink: 'https://linkedin.com'
        }
    ];

    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleLogout = (): void => {
        localStorage.removeItem("isLoggedIn");
        router.visit("/");
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isSearchOpen={isSearchOpen}
                setSearchOpen={setSearchOpen}
                isInventoryOpen={isInventoryOpen}
                setInventoryOpen={setInventoryOpen}
                handleNavigation={handleNavigation}
                handleLogout={handleLogout}
                activeMenu="about"
            />

            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 z-10">
                    <div className="flex items-center justify-between">
                        <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center">
                            <img src="/images/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/>
                            <h1 className="text-white text-[28px] font-semibold">UIC MediCare</h1>
                        </div>
                            <NotificationBell />
                    </div>
                </header>

                <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-white">
                    <div className="max-w-7xl mx-auto py-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-6">About UIC MediCare</h1>
                        
                        {/* --- UPDATED SECTION --- */}
                        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Overview</h2>
                            <p className="text-gray-600 mb-6">
                                The University Clinic is an essential healthcare service provider within the university, ensuring the well-being of students and staff by offering accessible and quality medical care. Rooted in the university’s commitment to holistic education and guided by Catholic values, the clinic operates as a vital support system, addressing health concerns, promoting wellness, and maintaining comprehensive medical records. It aims to create a safe and nurturing environment where students can focus on their academic and personal growth without compromising their health. By integrating technology and best medical practices, the clinic strives to provide efficient and compassionate healthcare services that align with the university's mission of service, justice, and integrity.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Vision Statement</h3>
                            <p className="text-gray-600 mb-6">
                                A globally recognized Catholic university that nurtures faith, builds passion for excellence and develops lifelong learners with compassion for service that impacts transformation in a fast-changing society.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Mission Statement</h3>
                            <p className="text-gray-600 mb-4">
                                We commit ourselves to:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Provide an excellent educational experience to students to help them become globally competitive and adaptive to change;</li>
                                <li>Inculcate among students the values of serving others with humility and love, working for justice, promoting peace, and preserving the integrity of creation;</li>
                                <li>Engage in research activities in collaboration with local, regional, national, and international partners;</li>
                                <li>Uphold the dignity of the persons, especially the poor;</li>
                                <li>Promote and strengthen our Filipino culture and values and</li>
                                <li>Administer the university following Catholic doctrine.</li>
                            </ul>
                        </div>
                        {/* --- END OF UPDATED SECTION --- */}

                        <div className="mt-16">
                            <h2 className="text-3xl font-bold text-center text-gray-800 mb-16">Meet the Creators</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-6">
                                {creators.map((creator, index) => (
                                    <CreatorCard
                                        key={index}
                                        image={creator.image}
                                        quote={creator.quote}
                                        name={creator.name}
                                        title={creator.title}
                                        fbLink={creator.fbLink}
                                        igLink={creator.igLink}
                                        liLink={creator.liLink}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mt-16 bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Version Information</h2>
                            <p className="text-gray-600"><strong>Version:</strong> 1.0.0 (Initial Release)</p>
                            <p className="text-gray-600"><strong>Release Date:</strong> August 10, 2025</p>
                            <p className="text-gray-600 mt-4">Thank you for using MEDITRACK!</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default About;