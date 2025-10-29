import React, { useState, useEffect } from "react";
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import { router } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { BranchInventoryService, Branch, BranchInventoryItem } from '../../services/branchInventoryService';
import { UserService } from '../../services/userService';



const StocksPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(true);
    const [myBranch, setMyBranch] = useState<Branch | null>(null);
    const [otherBranches, setOtherBranches] = useState<Branch[]>([]);
    const [showAllStocks, setShowAllStocks] = useState<boolean>(false);
    const [allStocksLoading, setAllStocksLoading] = useState<boolean>(false);
    const [branchInventories, setBranchInventories] = useState<Array<{ branch: Branch, inventory: BranchInventoryItem[] }>>([]);
    const [canonicalMeds, setCanonicalMeds] = useState<Record<number, { medicine_name: string, medicine_category?: string }>>({});
    const [modalSearch, setModalSearch] = useState<string>('');
    const [filteredBranchInventories, setFilteredBranchInventories] = useState<typeof branchInventories>([]);
    // debounce timer id for live search
    const [searchDebounce, setSearchDebounce] = useState<any>(null);

    const applyModalSearch = (reset = false) => {
        const q = (reset ? '' : (modalSearch || '')).toString().toLowerCase().trim();
        if (!q) {
            setFilteredBranchInventories(branchInventories.slice());
            return;
        }

        const filtered = branchInventories.map((e) => {
            const meds = (e.inventory || []).filter((row) => {
                const canonical = canonicalMeds[row.medicine_id] || null;
                const name = (canonical?.medicine_name || row.medicine_name || '').toString().toLowerCase();
                const cat = (canonical?.medicine_category || row.category || '').toString().toLowerCase();
                return name.includes(q) || cat.includes(q);
            });
            return { branch: e.branch, inventory: meds };
        }).filter((e) => (e.inventory || []).length > 0);

        setFilteredBranchInventories(filtered);
    };
    
    // run search automatically when modalSearch changes (debounced)
    useEffect(() => {
        if (searchDebounce) clearTimeout(searchDebounce);
        const id = setTimeout(() => {
            applyModalSearch();
        }, 250);
        setSearchDebounce(id);
        return () => { clearTimeout(id); };
    }, [modalSearch]);
    const [animateIn, setAnimateIn] = useState<boolean>(false);
    // local inventory view removed; navigation to OtherInventoryStocks page is used instead
    const [loading, setLoading] = useState(true);

    // NotificationBell will fetch notifications itself

    // Load branches on component mount
    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            setLoading(true);
            const currentUser = UserService.getCurrentUser();
            
            if (!currentUser) {
                router.visit('/');
                return;
            }

            // Set user's branch from current user data (branch_id and branch_name are already available)
            if (currentUser.branch_id && currentUser.branch_name) {
                const userBranch = {
                    branch_id: currentUser.branch_id,
                    branch_name: currentUser.branch_name,
                    address: undefined, // Will be populated by API if available
                    location: undefined // Keep for backward compatibility
                };
                setMyBranch(userBranch);

                // Get other branches excluding user's branch using MSSQL API
                const otherBranchesData = await BranchInventoryService.getOtherBranches(currentUser.branch_id);
                setOtherBranches(otherBranchesData);
                
                console.log('User branch:', userBranch);
                console.log('Other branches:', otherBranchesData);
            } else {
                console.error('User does not have branch information');
                // Fallback - try to get branch info from API
                const userBranch = await BranchInventoryService.getUserBranchInfo(currentUser.user_id);
                if (userBranch) {
                    setMyBranch(userBranch);
                    const otherBranchesData = await BranchInventoryService.getOtherBranches(userBranch.branch_id);
                    setOtherBranches(otherBranchesData);
                } else {
                    // Last resort fallback
                    const fallbackBranch = {
                        branch_id: 1,
                        branch_name: 'Unassigned Branch',
                        address: 'No address available'
                    };
                    setMyBranch(fallbackBranch);
                    setOtherBranches([]);
                }
            }
            
        } catch (error) {
            console.error('Error loading branches:', error);
            // Fallback to ensure page doesn't break
            const fallbackBranch = {
                branch_id: 1,
                branch_name: 'System Branch',
                address: 'Error loading branch data'
            };
            setMyBranch(fallbackBranch);
            setOtherBranches([]);
        } finally {
            setLoading(false);
        }
    };


    const handleNavigation = (path: string): void => router.visit(path);

    const handleLogout = (): void => {
        localStorage.removeItem("isLoggedIn");
        router.visit("/");
    };

    // Navigate to BranchInventory for My Branch (no need to pass branch_id anymore)
    const handleMyBranchClick = (): void => {
        router.visit('/inventory/branchinventory');
    };

    // Navigate to Otherinventorystocks for other branches
    const handleOtherBranchClick = (branchId: number): void => {
        router.visit(`/inventory/otherinventorystocks/${branchId}`);
    };

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-100">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A3386C] mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading branches...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isSearchOpen={isSearchOpen}
                setSearchOpen={setSearchOpen}
                isInventoryOpen={isInventoryOpen}
                setInventoryOpen={setInventoryOpen}
                handleNavigation={handleNavigation}
                handleLogout={handleLogout}
                activeMenu="inventory-stocks"
            />
            
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 flex-shrink-0 z-10">
                    <div className="flex items-center justify-between">
                        <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center">
                            <img src="/images/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/>
                            <h1 className="text-white text-[28px] font-semibold">UIC MediCare</h1>
                        </div>
                        <NotificationBell onSeeAll={() => handleNavigation('/Notification')} />
                    </div>
                </header>

                <main className="bg-gray-100 flex-1 flex flex-col overflow-hidden">

                    
                    <div className="bg-white px-8 py-4 flex-1 flex flex-col overflow-auto">
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Select Branch Inventory</h2>
                                    <p className="text-gray-600">Choose a branch to view its medicine inventory</p>
                                </div>
                                    <div>
                                    <button
                                        className="bg-[#A3386C] text-white px-5 py-3 rounded-lg text-base font-semibold hover:bg-[#8f2f5c] transition-colors shadow-md"
                                        onClick={async () => {
                                            // if modal already shown, animate out then close
                                            if (showAllStocks) {
                                                // animate out
                                                setAnimateIn(false);
                                                setTimeout(() => setShowAllStocks(false), 320);
                                                return;
                                            }

                                            setAllStocksLoading(true);
                                            try {
                                                const branches = await BranchInventoryService.getAllBranches();
                                                // fetch inventories in parallel
                                                const inventoriesPerBranch = await Promise.all(branches.map(async (b) => {
                                                    const inv = await BranchInventoryService.getBranchInventory(b.branch_id);
                                                    return { branch: b, inventory: inv };
                                                }));

                                                // also fetch canonical medicines to prefer canonical names/categories
                                                try {
                                                    const meds = await BranchInventoryService.getAllMedicines();
                                                    const lookup: Record<number, { medicine_name: string, medicine_category?: string }> = {};
                                                    meds.forEach((m: any) => {
                                                        if (m.medicine_id) lookup[Number(m.medicine_id)] = { medicine_name: m.medicine_name, medicine_category: m.medicine_category || m.category };
                                                    });
                                                    setCanonicalMeds(lookup);
                                                } catch (e) {
                                                    // ignore: we'll fallback to row values
                                                }

                                                // Keep raw per-branch inventories (no cross-branch aggregation) so data matches MSSQL outputs
                                                setBranchInventories(inventoriesPerBranch.filter((e) => Array.isArray(e.inventory) && e.inventory.length > 0));
                                                setShowAllStocks(true);
                                                // start entry animation shortly after mount
                                                setTimeout(() => setAnimateIn(true), 20);
                                                    // initialize filtered list to full inventories
                                                    setFilteredBranchInventories(inventoriesPerBranch.filter((e) => Array.isArray(e.inventory) && e.inventory.length > 0));
                                            } catch (err) {
                                                console.error('Failed to load all stocks', err);
                                            } finally {
                                                setAllStocksLoading(false);
                                            }
                                        }}
                                    >
                                        {showAllStocks ? 'Hide all stocks' : (allStocksLoading ? 'Loading...' : 'View all stocks')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* My Branch Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">My Branch</h3>
                            {myBranch && (
                                <div className="bg-white border-2 border-[#A3386C] rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-102"
                                     onClick={handleMyBranchClick}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xl font-semibold text-gray-800">{myBranch.branch_name}</h4>
                                            {(myBranch.address || myBranch.location) && (
                                                <p className="text-sm text-gray-500 mt-1">{myBranch.address || myBranch.location}</p>
                                            )}
                                            <p className="text-sm text-[#A3386C] mt-2 font-medium">• Manage Inventory • Add/Remove Medicines</p>
                                        </div>
                                        <div className="text-[#A3386C]">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Other Branches Section */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Other Branches</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {otherBranches.map((branch) => (
                                    <div key={branch.branch_id} 
                                         className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-102 hover:border-[#A3386C]"
                                         onClick={() => handleOtherBranchClick(branch.branch_id)}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800">{branch.branch_name}</h4>
                                                {(branch.address || branch.location) && (
                                                    <p className="text-sm text-gray-400 mt-1">{branch.address || branch.location}</p>
                                                )}
                                                <p className="text-sm text-gray-500 mt-2">• View Only • Request Medicines</p>
                                            </div>
                                            <div className="text-gray-400">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* navigation to other branch details page; in-place inventory removed */}
                        </div>

                        {/* All stocks modal view - show per-branch medicines separately */}
                        {showAllStocks && (
                            <div
                                role="dialog"
                                aria-modal="true"
                                className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
                            >
                                {/* backdrop */}
                                <div className="absolute inset-0 bg-black/40" onClick={() => { setAnimateIn(false); setTimeout(() => setShowAllStocks(false), 320); }}></div>

                                <div className={`relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[80vh] overflow-auto p-6 z-10 transform transition-all duration-300 ${animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-700">All Branches - Stocks by Branch</h3>
                                        <div className="flex items-center gap-2">
                        <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                                {/* search icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.1 6.1a7.5 7.5 0 0 0 10.55 10.55z" />
                                </svg>
                            </span>
                            <input
                                type="search"
                                value={modalSearch}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setModalSearch(v);
                                }}
                                onKeyDown={(e) => { if (e.key === 'Enter') applyModalSearch(); }}
                                placeholder="Search medicine or category"
                                className="pl-8 pr-3 py-1 border rounded text-sm text-black"
                            />
                        </div>
                        {/* Search button removed: search is live/debounced */}
                        <button onClick={() => { setAnimateIn(false); setTimeout(() => setShowAllStocks(false), 320); }} className="text-sm px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Close</button>
                    </div>
                                    </div>

                                    {allStocksLoading ? (
                                        <div className="text-sm text-gray-500">Loading aggregated stocks...</div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* allStocks currently is an array of aggregated medicine entries with branches array - we want per-branch grouping */}
                                            {/* Build a map: branch_id => { branch_name, medicines: [...] } */}
                                            {(() => {
                        // use filteredBranchInventories so search filters affect rendering
                        const sourceBranches = (filteredBranchInventories && filteredBranchInventories.length > 0) ? filteredBranchInventories : branchInventories;
                        const branchArray = (sourceBranches || []).map((e) => ({
                                                    branch_id: e.branch.branch_id,
                                                    branch_name: e.branch.branch_name,
                                                    medicines: (e.inventory || []).map((row) => {
                                                        // prefer canonical medicine name/category by medicine_id
                                                        const canonical = (row.medicine_id && canonicalMeds[row.medicine_id]) ? canonicalMeds[row.medicine_id] : null;
                                                        return {
                                                            medicine_id: row.medicine_id || null,
                                                            medicine_name: canonical?.medicine_name || row.medicine_name || `Medicine #${row.medicine_id}`,
                                                            category: canonical?.medicine_category || row.category || 'Uncategorized',
                                                            quantity: row.quantity || 0
                                                        };
                                                    })
                                                })).sort((a, b) => a.branch_name.localeCompare(b.branch_name));

                                                if (branchArray.length === 0) {
                                                    return <div className="text-sm text-gray-500">No branch stock data available.</div>;
                                                }

                                                return branchArray.map((br: any) => {
                                                    // merge duplicates by medicine_id when available, otherwise normalize name
                                                    const mergedMap = new Map<string | number, any>();
                                                    br.medicines.forEach((m: any) => {
                                                        const nameKey = (m.medicine_name || '').toString().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
                                                        const key = (m.medicine_id != null && m.medicine_id !== 0) ? `id:${m.medicine_id}` : `name:${nameKey}`;
                                                        const existing = mergedMap.get(key) || { medicine_id: m.medicine_id || null, medicine_name: m.medicine_name, category: m.category, quantity: 0 };
                                                        existing.quantity = (existing.quantity || 0) + (Number(m.quantity) || 0);
                                                        // prefer a filled category if existing doesn't have one
                                                        if ((!existing.category || existing.category === 'Uncategorized') && m.category) existing.category = m.category;
                                                        // prefer canonical medicine_name if present
                                                        if ((!existing.medicine_name || existing.medicine_name.toString().startsWith('Medicine #')) && m.medicine_name) existing.medicine_name = m.medicine_name;
                                                        mergedMap.set(key, existing);
                                                    });

                                                    let mergedList = Array.from(mergedMap.values());
                                                    // sort medicines by name (case-insensitive)
                                                    mergedList = mergedList.sort((a: any, b: any) => (a.medicine_name || '').toString().localeCompare((b.medicine_name || '').toString(), undefined, { sensitivity: 'base' }));

                                                    return (
                                                        <div key={br.branch_id} className="border border-gray-100 rounded p-4">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div>
                                                                    <div className="text-sm font-semibold text-gray-800">{br.branch_name}</div>
                                                                    <div className="text-xs text-gray-500">{mergedList.length} medicines</div>
                                                                </div>
                                                            </div>
                                                            <div className="overflow-x-auto">
                                                                <table className="min-w-full divide-y divide-gray-200">
                                                                    <thead className="bg-gray-50">
                                                                        <tr>
                                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                                        {mergedList.map((med: any, i: number) => (
                                                                            <tr key={i}>
                                                                                <td className="px-4 py-2 text-sm text-gray-900">{med.medicine_name}</td>
                                                                                <td className="px-4 py-2 text-sm text-gray-500">{med.category}</td>
                                                                                <td className="px-4 py-2 text-sm text-gray-900 text-left">{med.quantity}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StocksPage;
