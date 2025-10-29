// resources/js/pages/Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import {
    User,
    LayoutDashboard,
    Archive,
    FileText,
    History,
    ShieldQuestion,
    Search,
    Printer,
    GraduationCap,
    Briefcase,
    ChevronDown,
    Menu,
    Send,
    Paperclip,
    MoreVertical,
    Phone,
    Video,
    X,
    Check,
    CheckCheck
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import NotificationBell, { Notification as NotificationType } from '../components/NotificationBell';

interface Contact {
    id: string;
    name: string;
    role: string;
    avatar: string;
    status: 'online' | 'offline' | 'away';
    lastSeen?: string;
    isTyping?: boolean;
}

interface Message {
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
    attachments?: Attachment[];
}

interface Attachment {
    id: string;
    name: string;
    type: 'image' | 'document' | 'pdf';
    url: string;
}

interface Conversation {
    contactId: string;
    messages: Message[];
    unreadCount: number;
}

const Chat: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    
    // Chat states
    const [contacts, setContacts] = useState<Contact[]>([
        {
            id: '1',
            name: 'Dr. Maria Santos',
            role: 'Doctor',
            avatar: '/avatars/doctor1.png',
            status: 'online',
            lastSeen: 'Online'
        },
        {
            id: '2',
            name: 'Nurse John Doe',
            role: 'Nurse',
            avatar: '/avatars/nurse1.png',
            status: 'online',
            lastSeen: 'Online'
        },
        {
            id: '3',
            name: 'Dr. Roberto Garcia',
            role: 'Doctor',
            avatar: '/avatars/doctor2.png',
            status: 'away',
            lastSeen: '2 hours ago'
        },
        {
            id: '4',
            name: 'Nurse Emily Chen',
            role: 'Nurse',
            avatar: '/avatars/nurse2.png',
            status: 'offline',
            lastSeen: '5 hours ago'
        },
        {
            id: '5',
            name: 'Dr. Carlos Rivera',
            role: 'Doctor',
            avatar: '/avatars/doctor3.png',
            status: 'online',
            lastSeen: 'Online'
        }
    ]);
    
    const [conversations, setConversations] = useState<Conversation[]>([
        {
            contactId: '1',
            messages: [
                {
                    id: '1',
                    senderId: '1',
                    recipientId: 'current',
                    content: 'Hi there! How\'s the patient doing today?',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    status: 'read'
                },
                {
                    id: '2',
                    senderId: 'current',
                    recipientId: '1',
                    content: 'Doing well! Vitals are stable and medication is working.',
                    timestamp: new Date(Date.now() - 3500000).toISOString(),
                    status: 'read'
                },
                {
                    id: '3',
                    senderId: '1',
                    recipientId: 'current',
                    content: 'Great to hear! Any concerns I should be aware of?',
                    timestamp: new Date(Date.now() - 3400000).toISOString(),
                    status: 'read'
                },
                {
                    id: '4',
                    senderId: 'current',
                    recipientId: '1',
                    content: 'Just the usual follow-up needed next week. I\'ll send the schedule.',
                    timestamp: new Date(Date.now() - 3300000).toISOString(),
                    status: 'read'
                },
                {
                    id: '5',
                    senderId: '1',
                    recipientId: 'current',
                    content: 'Perfect, thanks! See you tomorrow at the meeting.',
                    timestamp: new Date(Date.now() - 3200000).toISOString(),
                    status: 'read'
                }
            ],
            unreadCount: 0
        },
        {
            contactId: '2',
            messages: [
                {
                    id: '6',
                    senderId: '2',
                    recipientId: 'current',
                    content: 'Can you review the patient file I sent?',
                    timestamp: new Date(Date.now() - 86400000).toISOString(),
                    status: 'delivered'
                }
            ],
            unreadCount: 1
        }
    ]);
    
    const [activeContact, setActiveContact] = useState<Contact>(contacts[0]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingContact, setTypingContact] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // NotificationBell will load notifications itself

    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleLogout = (): void => {
        router.post('/logout');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // Auto-scroll to bottom of messages
    useEffect(() => {
        scrollToBottom();
    }, [conversations, activeContact]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Simulate typing indicator
    useEffect(() => {
        let typingTimer: NodeJS.Timeout;
        if (isTyping) {
            typingTimer = setTimeout(() => {
                setIsTyping(false);
            }, 3000);
        }
        return () => clearTimeout(typingTimer);
    }, [isTyping]);

    // Get active conversation
    const getActiveConversation = (): Conversation | undefined => {
        return conversations.find(conv => conv.contactId === activeContact.id);
    };

    // Get contact by ID
    const getContactById = (id: string): Contact | undefined => {
        return contacts.find(contact => contact.id === id);
    };

    // Handle sending message
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        
        const message: Message = {
            id: Date.now().toString(),
            senderId: 'current',
            recipientId: activeContact.id,
            content: newMessage,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };
        // Update conversations immutably
        setConversations(prev => {
            const updated = [...prev];
            const idx = updated.findIndex(conv => conv.contactId === activeContact.id);

            if (idx !== -1) {
                updated[idx] = {
                    ...updated[idx],
                    messages: [...updated[idx].messages, message],
                    unreadCount: 0,
                };
            } else {
                updated.push({
                    contactId: activeContact.id,
                    messages: [message],
                    unreadCount: 0,
                });
            }

            return updated;
        });

        setNewMessage('');
        setIsTyping(false);
        // small delay to ensure DOM updated before scrolling
        setTimeout(() => scrollToBottom(), 50);
    };

    // Get message status icon
    const getMessageStatusIcon = (status: 'sent' | 'delivered' | 'read') => {
        switch (status) {
            case 'sent':
                return <Check className="w-4 h-4 text-gray-400" />;
            case 'delivered':
                return <CheckCheck className="w-4 h-4 text-gray-400" />;
            case 'read':
                return <CheckCheck className="w-4 h-4 text-[#A3386C]" />;
            default:
                return null;
        }
    };

    // Filtered contacts based on search query
    const filteredContacts = contacts.filter(c => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q);
    });

    // Format time helper
    const formatTime = (iso: string) => {
        try {
            const date = new Date(iso);
            const now = new Date();
            const diff = now.getTime() - date.getTime();

            const oneDay = 24 * 60 * 60 * 1000;
            if (diff < oneDay && date.getDate() === now.getDate()) {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            return date.toLocaleDateString();
        } catch (e) {
            return iso;
        }
    };

    // Group messages by date for display
    const groupMessagesByDate = (messages: Message[]) => {
        const groups: { date: string; messages: Message[] }[] = [];
        const map = new Map<string, Message[]>();

        messages.forEach((m) => {
            const d = new Date(m.timestamp);
            const key = d.toDateString();
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(m);
        });

        map.forEach((msgs, key) => {
            groups.push({ date: key, messages: msgs });
        });

        // sort by date ascending
        groups.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return groups;
    };

    const activeConversation = getActiveConversation();

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar component */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isSearchOpen={isSearchOpen}
                setSearchOpen={setSearchOpen}
                isInventoryOpen={isInventoryOpen}
                setInventoryOpen={setInventoryOpen}
                handleNavigation={handleNavigation}
                handleLogout={handleLogout}
                activeMenu="chat"
            />

            {/* Main Content */}
            <div className={`flex-1 flex transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Contacts Sidebar */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search contacts..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3386C] focus:border-transparent text-black"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {filteredContacts.map((contact) => {
                            const conversation = conversations.find(conv => conv.contactId === contact.id);
                            const lastMessage = conversation?.messages[conversation.messages.length - 1];
                            
                            return (
                                <div
                                    key={contact.id}
                                    className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                                        activeContact.id === contact.id ? 'bg-[#FDF2F8]' : ''
                                    }`}
                                    onClick={() => setActiveContact(contact)}
                                >
                                    <div className="relative">
                                        <img
                                            src={contact.avatar}
                                            alt={contact.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/images/default-avatar.png';
                                            }}
                                        />
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                            contact.status === 'online' ? 'bg-green-500' :
                                            contact.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                                        }`}></div>
                                    </div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="text-sm font-semibold text-gray-900 truncate">{contact.name}</h3>
                                            {lastMessage && (
                                                <span className="text-xs text-gray-500">
                                                    {formatTime(lastMessage.timestamp)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{contact.role}</p>
                                        <div className="flex justify-between items-center">
                                            {lastMessage ? (
                                                <>
                                                    <p className="text-sm text-gray-600 truncate">
                                                        {lastMessage.content.substring(0, 25)}
                                                        {lastMessage.content.length > 25 ? '...' : ''}
                                                    </p>
                                                    {conversation?.unreadCount && conversation.unreadCount > 0 && (
                                                        <span className="bg-[#A3386C] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                                                            {conversation.unreadCount}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic">No messages yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {/* Chat Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center">
                            <button onClick={toggleSidebar} className="text-gray-600 p-2 rounded-full hover:bg-gray-100 mr-3">
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="relative">
                                <img
                                    src={activeContact.avatar}
                                    alt={activeContact.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/images/default-avatar.png';
                                    }}
                                />
                                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                    activeContact.status === 'online' ? 'bg-green-500' :
                                    activeContact.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                                }`}></div>
                            </div>
                            <div className="ml-3">
                                <h2 className="text-lg font-semibold text-gray-900">{activeContact.name}</h2>
                                <p className="text-sm text-gray-500">
                                    {activeContact.role} • {activeContact.status === 'online' ? 'Online' : activeContact.lastSeen}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <NotificationBell onSeeAll={() => handleNavigation('../Notification')} />
                        </div>
                        
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                        {activeConversation ? (
                            <div className="space-y-4">
                                {groupMessagesByDate(activeConversation.messages).map((group, groupIndex) => (
                                    <div key={groupIndex}>
                                        <div className="flex justify-center my-4">
                                            <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                                {group.date}
                                            </span>
                                        </div>
                                        {group.messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.senderId === 'current' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                        message.senderId === 'current'
                                                            ? 'bg-[#A3386C] text-white rounded-br-none'
                                                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                                    }`}
                                                >
                                                    <p className="text-sm">{message.content}</p>
                                                    <div className={`flex items-center justify-end mt-1 ${
                                                        message.senderId === 'current' ? 'text-white/70' : 'text-gray-500'
                                                    }`}>
                                                        <span className="text-xs">{formatTime(message.timestamp)}</span>
                                                        {message.senderId === 'current' && getMessageStatusIcon(message.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                                {isTyping && typingContact === activeContact.id && (
                                    <div className="flex justify-start">
                                        <div className="bg-white text-gray-800 border border-gray-200 rounded-lg rounded-bl-none px-4 py-2">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-lg font-medium">No messages yet</p>
                                <p className="text-sm">Start a conversation with {activeContact.name}</p>
                            </div>
                        )}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200 bg-white">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        // Handle the file attachment here
                                        console.log('File selected:', file.name);
                                        // You can implement file upload logic here
                                    }
                                }}
                                className="hidden"
                                accept="image/*,.pdf,.doc,.docx"
                            />
                            <button
                                type="button"
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Paperclip className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#A3386C] focus:border-transparent text-black"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-3 bg-[#A3386C] text-white rounded-full hover:bg-[#8a2f58] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;