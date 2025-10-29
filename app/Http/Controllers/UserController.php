<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class UserController extends Controller
{
    /**
     * Get user by email from MSSQL database
     */
    public function getUserByEmail(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email'
            ]);

            $email = $request->input('email');
            Log::info("Searching for user with email: {$email}");

            // Query users table with branch information
            $user = DB::table('users')
                ->leftJoin('branches', 'users.branch_id', '=', 'branches.branch_id')
                ->select(
                    'users.user_id',
                    'users.email',
                    'users.name',
                    'users.branch_id',
                    'branches.branch_name'
                )
                ->where('users.email', $email)
                ->first();

            if (!$user) {
                Log::info("User not found with email: {$email}");
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Format response to match UserService expectations
            $userData = [
                'user_id' => $user->user_id,
                'email' => $user->email,
                'name' => $user->name,
                'branch_id' => $user->branch_id,
                'branch_name' => $user->branch_name,
                'branches' => [
                    'branch_id' => $user->branch_id,
                    'branch_name' => $user->branch_name
                ]
            ];

            Log::info("User found: " . json_encode($userData));

            return response()->json([
                'success' => true,
                'user' => $userData
            ]);

        } catch (\Exception $e) {
            Log::error("Error in getUserByEmail: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred'
            ], 500);
        }
    }

    /**
     * Get user's branch information
     */
    public function getUserBranch($userId)
    {
        try {
            Log::info("Getting branch info for user ID: {$userId}");

            // Build select columns conditionally in case the branches.address column doesn't exist
            $branchSelect = ['branches.branch_id', 'branches.branch_name'];
            if (Schema::hasColumn('branches', 'address')) {
                $branchSelect[] = 'branches.address';
            } else {
                Log::warning('branches.address column not found - skipping address in getUserBranch select');
            }

            $branchInfo = DB::table('users')
                ->leftJoin('branches', 'users.branch_id', '=', 'branches.branch_id')
                ->select($branchSelect)
                ->where('users.user_id', $userId)
                ->first();

            if (!$branchInfo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Branch information not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'branch' => $branchInfo
            ]);

        } catch (\Exception $e) {
            Log::error("Error in getUserBranch: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred'
            ], 500);
        }
    }

    /**
     * Get all users (for admin purposes)
     */
    public function getAllUsers()
    {
        try {
            $users = DB::table('users')
                ->leftJoin('branches', 'users.branch_id', '=', 'branches.branch_id')
                ->select(
                    'users.user_id',
                    'users.email',
                    'users.name',
                    'users.branch_id',
                    'branches.branch_name'
                )
                ->get();

            return response()->json([
                'success' => true,
                'users' => $users
            ]);

        } catch (\Exception $e) {
            Log::error("Error in getAllUsers: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred'
            ], 500);
        }
    }

    /**
     * Create new user
     */
    public function createUser(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|unique:users,email',
                'name' => 'required|string|max:255',
                'branch_id' => 'required|integer|exists:branches,branch_id'
            ]);

            $userId = DB::table('users')->insertGetId([
                'email' => $request->input('email'),
                'name' => $request->input('name'),
                'branch_id' => $request->input('branch_id'),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Get the created user with branch info
            $user = DB::table('users')
                ->leftJoin('branches', 'users.branch_id', '=', 'branches.branch_id')
                ->select(
                    'users.user_id',
                    'users.email',
                    'users.name',
                    'users.branch_id',
                    'branches.branch_name'
                )
                ->where('users.user_id', $userId)
                ->first();

            return response()->json([
                'success' => true,
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            Log::error("Error in createUser: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred'
            ], 500);
        }
    }

    /**
     * Update user
     */
    public function updateUser(Request $request, $userId)
    {
        try {
            $request->validate([
                'email' => 'sometimes|email|unique:users,email,' . $userId . ',user_id',
                'name' => 'sometimes|string|max:255',
                'branch_id' => 'sometimes|integer|exists:branches,branch_id'
            ]);

            $updateData = [];
            if ($request->has('email')) {
                $updateData['email'] = $request->input('email');
            }
            if ($request->has('name')) {
                $updateData['name'] = $request->input('name');
            }
            if ($request->has('branch_id')) {
                $updateData['branch_id'] = $request->input('branch_id');
            }
            $updateData['updated_at'] = now();

            $updated = DB::table('users')
                ->where('user_id', $userId)
                ->update($updateData);

            if (!$updated) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Get the updated user with branch info
            $user = DB::table('users')
                ->leftJoin('branches', 'users.branch_id', '=', 'branches.branch_id')
                ->select(
                    'users.user_id',
                    'users.email',
                    'users.name',
                    'users.branch_id',
                    'branches.branch_name'
                )
                ->where('users.user_id', $userId)
                ->first();

            return response()->json([
                'success' => true,
                'user' => $user
            ]);

        } catch (\Exception $e) {
            Log::error("Error in updateUser: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred'
            ], 500);
        }
    }

    /**
     * Delete user
     */
    public function deleteUser($userId)
    {
        try {
            $deleted = DB::table('users')
                ->where('user_id', $userId)
                ->delete();

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error("Error in deleteUser: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred'
            ], 500);
        }
    }

    /**
     * Get all branches from MSSQL database
     */
    public function getAllBranches()
    {
        try {
            Log::info("Fetching all branches from MSSQL");

            $branches = DB::table('branches')
                ->select('branch_id', 'branch_name')
                ->orderBy('branch_name')
                ->get();

            Log::info("Found " . count($branches) . " branches");

            return response()->json($branches->toArray());

        } catch (\Exception $e) {
            Log::error("Error in getAllBranches: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred'
            ], 500);
        }
    }

    /**
     * Get branch by ID from MSSQL database
     */
    public function getBranchById($id)
    {
        try {
            Log::info("Fetching branch with ID: {$id}");

            $branch = DB::table('branches')
                ->select('branch_id', 'branch_name')
                ->where('branch_id', $id)
                ->first();

            if (!$branch) {
                return response()->json([
                    'success' => false,
                    'message' => 'Branch not found'
                ], 404);
            }

            return response()->json($branch);

        } catch (\Exception $e) {
            Log::error("Error in getBranchById: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred'
            ], 500);
        }
    }

    /**
     * Get other branches (excluding user's branch) from MSSQL database
     */
    public function getOtherBranches($userBranchId)
    {
        try {
            Log::info("Fetching branches excluding branch ID: {$userBranchId}");

            $branches = DB::table('branches')
                ->select('branch_id', 'branch_name')
                ->where('branch_id', '!=', $userBranchId)
                ->orderBy('branch_name')
                ->get();

            Log::info("Found " . count($branches) . " other branches");

            return response()->json($branches->toArray());

        } catch (\Exception $e) {
            Log::error("Error in getOtherBranches: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred'
            ], 500);
        }
    }

    /**
     * Get branch inventory with available stock calculations
     */
    public function getBranchInventory($branchId)
    {
        try {
            Log::info("Fetching inventory for branch ID: {$branchId}");

            // Get all stock in records for this branch
            $stockInData = DB::table('medicine_stock_in as msi')
                ->leftJoin('medicines as m', 'msi.medicine_id', '=', 'm.medicine_id')
                ->select(
                    'msi.medicine_stock_in_id',
                    'msi.medicine_id',
                    'msi.quantity',
                    'msi.date_received',
                    'msi.expiration_date',
                    'm.medicine_name',
                    'm.medicine_category'
                )
                ->where('msi.branch_id', $branchId)
                ->orderBy('msi.medicine_id')
                ->orderBy('msi.expiration_date')
                ->get();

            Log::info("Stock in data fetched: " . count($stockInData) . " records");

            // Get all stock out records for this branch
            $stockOutData = DB::table('medicine_stock_out')
                ->select('medicine_stock_in_id', 'quantity_dispensed')
                ->where('branch_id', $branchId)
                ->get();

            Log::info("Stock out data fetched: " . count($stockOutData) . " records");

            // Get all archived medicine records for this branch if the table exists
            if (Schema::hasTable('medicine_archived')) {
                $deletedData = DB::table('medicine_archived')
                    ->select('medicine_stock_in_id', 'quantity')
                    ->where('branch_id', $branchId)
                    ->get();

                Log::info("Archived data fetched: " . count($deletedData) . " records");
            } else {
                Log::warning("medicine_archived table not found - treating deletedData as empty for branch ID: {$branchId}");
                $deletedData = collect();
            }

            // Create maps for dispensed and deleted quantities
            $dispensedMap = [];
            foreach ($stockOutData as $record) {
                $stockInId = $record->medicine_stock_in_id;
                if (isset($dispensedMap[$stockInId])) {
                    $dispensedMap[$stockInId] += $record->quantity_dispensed;
                } else {
                    $dispensedMap[$stockInId] = $record->quantity_dispensed;
                }
            }

            $deletedMap = [];
                if (Schema::hasTable('medicine_archived')) {
                    foreach ($deletedData as $record) {
                        $stockInId = $record->medicine_stock_in_id;
                        if (isset($deletedMap[$stockInId])) {
                            $deletedMap[$stockInId] += $record->quantity;
                        } else {
                            $deletedMap[$stockInId] = $record->quantity;
                        }
                    }
                }

            // Calculate available quantities and build result
            $result = [];
            foreach ($stockInData as $record) {
                $stockInId = $record->medicine_stock_in_id;
                $totalDispensed = $dispensedMap[$stockInId] ?? 0;
                $totalDeleted = $deletedMap[$stockInId] ?? 0;
                $availableQuantity = max(0, $record->quantity - $totalDispensed - $totalDeleted);

                // Only include records with available quantity > 0
                if ($availableQuantity > 0) {
                    $result[] = [
                        'medicine_id' => $record->medicine_id,
                        'quantity' => $availableQuantity,
                        'date_received' => $record->date_received,
                        'expiration_date' => $record->expiration_date,
                        'medicine_stock_in_id' => $stockInId,
                        'medicine' => [
                            'medicine_id' => $record->medicine_id,
                            'medicine_name' => $record->medicine_name,
                            'medicine_category' => $record->medicine_category
                        ]
                    ];
                }
            }

            Log::info("Final result: " . count($result) . " available stock records");

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error("Error in getBranchInventory: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred'
            ], 500);
        }
    }

    /**
     * Get all medicines from MSSQL database
     */
    public function getAllMedicines()
    {
        try {
            Log::info("Fetching all medicines from MSSQL");

            $medicines = DB::table('medicines')
                ->select('medicine_id', 'medicine_name', 'medicine_category')
                ->orderBy('medicine_name')
                ->get();

            Log::info("Found " . count($medicines) . " medicines");

            return response()->json($medicines->toArray());

        } catch (\Exception $e) {
            Log::error("Error in getAllMedicines: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred'
            ], 500);
        }
    }

    /**
     * Create a new medicine or get existing one
     */
    public function createMedicine(Request $request)
    {
        try {
            $request->validate([
                'medicine_name' => 'required|string|max:255',
                'medicine_category' => 'required|string|max:255'
            ]);

            $medicineName = $request->input('medicine_name');
            $medicineCategory = $request->input('medicine_category');

            Log::info("Creating/getting medicine: {$medicineName}, Category: {$medicineCategory}");

            // Normalize inputs for a more robust duplicate check (trim + case-insensitive)
            $normName = trim(mb_strtolower($medicineName));
            $normCategory = trim(mb_strtolower($medicineCategory));

            // First-pass lookup: try to find an existing medicine using normalized comparison
            $existingMedicine = DB::table('medicines')
                ->select('medicine_id', 'medicine_name', 'medicine_category')
                ->whereRaw('LOWER(LTRIM(RTRIM(medicine_name))) = ?', [$normName])
                ->whereRaw('LOWER(LTRIM(RTRIM(medicine_category))) = ?', [$normCategory])
                ->first();

            if ($existingMedicine) {
                Log::info("Medicine already exists (normalized match): " . json_encode($existingMedicine));
                return response()->json($existingMedicine);
            }

            // Re-check/insert inside a short critical section to avoid race conditions
            // (simple re-check before insert). This prevents duplicate rows if two
            // concurrent requests attempt to create the same medicine.
            $medicineId = null;
            DB::beginTransaction();
            try {
                $existingMedicine = DB::table('medicines')
                    ->select('medicine_id', 'medicine_name', 'medicine_category')
                    ->whereRaw('LOWER(LTRIM(RTRIM(medicine_name))) = ?', [$normName])
                    ->whereRaw('LOWER(LTRIM(RTRIM(medicine_category))) = ?', [$normCategory])
                    ->lockForUpdate()
                    ->first();

                if ($existingMedicine) {
                    // Someone else inserted it while we were checking
                    DB::commit();
                    Log::info('Medicine created by concurrent request, returning existing.');
                    return response()->json($existingMedicine);
                }

                $medicineId = DB::table('medicines')->insertGetId([
                    'medicine_name' => $medicineName,
                    'medicine_category' => $medicineCategory
                ]);

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

            // Get the created medicine
            $newMedicine = DB::table('medicines')
                ->select('medicine_id', 'medicine_name', 'medicine_category')
                ->where('medicine_id', $medicineId)
                ->first();

            Log::info("Successfully created new medicine: " . json_encode($newMedicine));

            return response()->json($newMedicine, 201);

        } catch (\Exception $e) {
            Log::error("Error in createMedicine: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add medicine stock in
     */
    public function addMedicineStockIn(Request $request)
    {
        try {
            $request->validate([
                'medicine_id' => 'required|integer',
                'branch_id' => 'required|integer',
                'user_id' => 'required|integer',
                'quantity' => 'required|integer|min:1',
                'date_received' => 'required|date',
                'expiration_date' => 'required|date'
            ]);

            $data = [
                'medicine_id' => $request->input('medicine_id'),
                'branch_id' => $request->input('branch_id'),
                'user_id' => $request->input('user_id'),
                'quantity' => $request->input('quantity'),
                'date_received' => $request->input('date_received'),
                'expiration_date' => $request->input('expiration_date')
            ];

            Log::info("Adding medicine stock in: " . json_encode($data));

            $stockInId = DB::table('medicine_stock_in')->insertGetId($data);

            // Get the created record with medicine details
            $stockRecord = DB::table('medicine_stock_in as msi')
                ->leftJoin('medicines as m', 'msi.medicine_id', '=', 'm.medicine_id')
                ->leftJoin('branches as b', 'msi.branch_id', '=', 'b.branch_id')
                ->leftJoin('users as u', 'msi.user_id', '=', 'u.user_id')
                ->select(
                    'msi.*',
                    'm.medicine_name',
                    'm.medicine_category',
                    'b.branch_name',
                    'u.name as user_name'
                )
                ->where('msi.medicine_stock_in_id', $stockInId)
                ->first();

            Log::info("Successfully added medicine stock in: " . json_encode($stockRecord));

            return response()->json($stockRecord, 201);

        } catch (\Exception $e) {
            Log::error("Error in addMedicineStockIn: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available stock records for a medicine (FIFO order)
     * Accepts optional query param `include_all=1` to return all stock-in rows even when available quantity is zero.
     */
    public function getAvailableStockRecords(Request $request, $medicineId, $branchId)
    {
        try {
            Log::info("Getting available stock records for medicine {$medicineId} in branch {$branchId}");

            $includeAll = $request->query('include_all') == '1';
            $filterUserId = $request->query('user_id');

            // Get all stock in records for this medicine and branch, ordered by date (FIFO)
            $stockInData = DB::table('medicine_stock_in as msi')
                ->leftJoin('medicines as m', 'msi.medicine_id', '=', 'm.medicine_id')
                ->select('msi.medicine_stock_in_id', 'msi.quantity', 'msi.date_received', 'msi.expiration_date', 'm.medicine_name')
                ->where('msi.medicine_id', $medicineId)
                ->where('msi.branch_id', $branchId)
                // Optionally filter by the user who created/added the stock-in row
                ->when($filterUserId, function($q) use ($filterUserId) {
                    return $q->where('msi.user_id', $filterUserId);
                })
                ->orderBy('msi.date_received', 'asc') // FIFO - oldest first
                ->get();

            if ($stockInData->isEmpty()) {
                return response()->json([]);
            }

            $availableRecords = [];

            foreach ($stockInData as $stockIn) {
                // Get total dispensed for this stock in record
                $totalDispensed = DB::table('medicine_stock_out')
                    ->where('medicine_stock_in_id', $stockIn->medicine_stock_in_id)
                    ->sum('quantity_dispensed') ?: 0;

                // Get total deleted for this stock in record
                $totalDeleted = DB::table('medicine_archived')
                    ->where('medicine_stock_in_id', $stockIn->medicine_stock_in_id)
                    ->sum('quantity') ?: 0;

                $available = $stockIn->quantity - $totalDispensed - $totalDeleted;

                // Include the record if it has available > 0, or if include_all is requested
                if ($available > 0 || $includeAll) {
                    $availableRecords[] = [
                        'medicine_stock_in_id' => $stockIn->medicine_stock_in_id,
                        'availableQuantity' => $available,
                        'date_received' => $stockIn->date_received,
                        'expiration_date' => $stockIn->expiration_date,
                        'medicine_name' => $stockIn->medicine_name
                    ];
                }
            }

            Log::info("Found " . count($availableRecords) . " available stock records (include_all=" . ($includeAll ? '1' : '0') . ")");
            return response()->json($availableRecords);

        } catch (\Exception $e) {
            Log::error("Error in getAvailableStockRecords: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Dispense medicine (create stock out record)
     */
    /**
     * Dispense medicine with clean implementation (no reason field)
     */
    public function dispenseMedicineV2(Request $request)
    {
        try {
            $request->validate([
                'medicine_stock_in_id' => 'required|integer',
                'quantity_dispensed' => 'required|integer|min:1',
                'user_id' => 'required|integer',
                'branch_id' => 'required|integer'
            ]);

            $medicineStockInId = $request->input('medicine_stock_in_id');
            $quantityDispensed = $request->input('quantity_dispensed');
            $userId = $request->input('user_id');
            $branchId = $request->input('branch_id');

            Log::info("V2 Dispensing medicine: stock_in_id={$medicineStockInId}, quantity={$quantityDispensed}");
            Log::info("V2 Request data: " . json_encode($request->all()));

            // Check if the stock in record exists
            $stockInRecord = DB::table('medicine_stock_in')
                ->where('medicine_stock_in_id', $medicineStockInId)
                ->first();

            if (!$stockInRecord) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock in record not found'
                ], 404);
            }

            // Check available quantity
            $totalDispensed = DB::table('medicine_stock_out')
                ->where('medicine_stock_in_id', $medicineStockInId)
                ->sum('quantity_dispensed') ?: 0;

            $totalDeleted = DB::table('medicine_archived')
                ->where('medicine_stock_in_id', $medicineStockInId)
                ->sum('quantity') ?: 0;

            $availableQuantity = $stockInRecord->quantity - $totalDispensed - $totalDeleted;

            if ($availableQuantity < $quantityDispensed) {
                return response()->json([
                    'success' => false,
                    'message' => "Insufficient stock. Available: {$availableQuantity}, Requested: {$quantityDispensed}"
                ], 400);
            }

            // Create stock out record with explicit columns only
            $insertData = [
                'medicine_stock_in_id' => $medicineStockInId,
                'quantity_dispensed' => $quantityDispensed,
                'user_id' => $userId,
                'branch_id' => $branchId
            ];
            
            Log::info("V2 About to insert into medicine_stock_out: " . json_encode($insertData));
            
            $stockOutId = DB::table('medicine_stock_out')->insertGetId($insertData);

            // Get the created record with related data
            $stockOutRecord = DB::table('medicine_stock_out as mso')
                ->leftJoin('medicine_stock_in as msi', 'mso.medicine_stock_in_id', '=', 'msi.medicine_stock_in_id')
                ->leftJoin('medicines as m', 'msi.medicine_id', '=', 'm.medicine_id')
                ->leftJoin('branches as b', 'mso.branch_id', '=', 'b.branch_id')
                ->leftJoin('users as u', 'mso.user_id', '=', 'u.user_id')
                ->select(
                    'mso.*',
                    'm.medicine_name',
                    'm.medicine_category',
                    'b.branch_name',
                    'u.name as user_name'
                )
                ->where('mso.medicine_stock_out_id', $stockOutId)
                ->first();

            Log::info("V2 Successfully dispensed medicine: " . json_encode($stockOutRecord));

            return response()->json([
                'success' => true,
                'data' => $stockOutRecord
            ], 201);

        } catch (\Exception $e) {
            Log::error("Error in dispenseMedicineV2: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    public function dispenseMedicine(Request $request)
    {
        try {
            $request->validate([
                'medicine_stock_in_id' => 'required|integer',
                'quantity_dispensed' => 'required|integer|min:1',
                'user_id' => 'required|integer',
                'branch_id' => 'required|integer'
            ]);

            $medicineStockInId = $request->input('medicine_stock_in_id');
            $quantityDispensed = $request->input('quantity_dispensed');
            $userId = $request->input('user_id');
            $branchId = $request->input('branch_id');

            Log::info("Dispensing medicine: stock_in_id={$medicineStockInId}, quantity={$quantityDispensed}");
            Log::info("Request data: " . json_encode($request->all()));
            Log::info("Validated data: medicine_stock_in_id={$medicineStockInId}, quantity_dispensed={$quantityDispensed}, user_id={$userId}, branch_id={$branchId}");

            // Check if the stock in record exists
            $stockInRecord = DB::table('medicine_stock_in')
                ->where('medicine_stock_in_id', $medicineStockInId)
                ->first();

            if (!$stockInRecord) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock in record not found'
                ], 404);
            }

            // Check available quantity
            $totalDispensed = DB::table('medicine_stock_out')
                ->where('medicine_stock_in_id', $medicineStockInId)
                ->sum('quantity_dispensed') ?: 0;

            $totalDeleted = DB::table('medicine_archived')
                ->where('medicine_stock_in_id', $medicineStockInId)
                ->sum('quantity') ?: 0;

            $availableQuantity = $stockInRecord->quantity - $totalDispensed - $totalDeleted;

            if ($availableQuantity < $quantityDispensed) {
                return response()->json([
                    'success' => false,
                    'message' => "Insufficient stock. Available: {$availableQuantity}, Requested: {$quantityDispensed}"
                ], 400);
            }

            // Create stock out record
            $insertData = [
                'medicine_stock_in_id' => $medicineStockInId,
                'quantity_dispensed' => $quantityDispensed,
                'user_id' => $userId,
                'branch_id' => $branchId
                // timestamp_dispensed will be set automatically by DEFAULT GETDATE()
            ];
            
            Log::info("About to insert into medicine_stock_out: " . json_encode($insertData));
            
            $stockOutId = DB::table('medicine_stock_out')->insertGetId($insertData);

            // Get the created record with related data
            $stockOutRecord = DB::table('medicine_stock_out as mso')
                ->leftJoin('medicine_stock_in as msi', 'mso.medicine_stock_in_id', '=', 'msi.medicine_stock_in_id')
                ->leftJoin('medicines as m', 'msi.medicine_id', '=', 'm.medicine_id')
                ->leftJoin('branches as b', 'mso.branch_id', '=', 'b.branch_id')
                ->leftJoin('users as u', 'mso.user_id', '=', 'u.user_id')
                ->select(
                    'mso.*',
                    'm.medicine_name',
                    'm.medicine_category',
                    'b.branch_name',
                    'u.name as user_name'
                )
                ->where('mso.medicine_stock_out_id', $stockOutId)
                ->first();

            Log::info("Successfully dispensed medicine: " . json_encode($stockOutRecord));

            return response()->json($stockOutRecord, 201);

        } catch (\Exception $e) {
            Log::error("Error in dispenseMedicine: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete medicine stock and record in medicine_deleted table
     */
    public function deleteMedicine(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'medicine_stock_in_id' => 'required|integer',
                'quantity' => 'required|integer|min:1',
                'description' => 'required|string|min:10',
                'branch_id' => 'required|integer'
            ]);

            Log::info("Deleting medicine with data: " . json_encode($validatedData));

            // Start transaction
            DB::beginTransaction();

            // First verify the stock exists and has enough quantity
            $stockRecord = DB::table('medicine_stock_in')
                ->where('medicine_stock_in_id', $validatedData['medicine_stock_in_id'])
                ->where('branch_id', $validatedData['branch_id'])
                ->first();

            if (!$stockRecord) {
                Log::error("Stock record not found for medicine_stock_in_id: " . $validatedData['medicine_stock_in_id']);
                return response()->json([
                    'success' => false,
                    'message' => 'Medicine stock record not found'
                ], 404);
            }

            // Check if there's enough quantity to delete
            if ($stockRecord->quantity < $validatedData['quantity']) {
                Log::error("Insufficient quantity. Available: " . $stockRecord->quantity . ", Requested: " . $validatedData['quantity']);
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient quantity available for deletion'
                ], 400);
            }

            // Insert record into medicine_deleted table
              // Insert record into medicine_archived table instead (medicine_deleted was dropped in DB schema)
              $deletedId = DB::table('medicine_archived')->insertGetId([
                'medicine_stock_in_id' => $validatedData['medicine_stock_in_id'],
                'quantity' => $validatedData['quantity'],
                'description' => $validatedData['description'],
                'branch_id' => $validatedData['branch_id'],
                 'archived_at' => now()
            ]);

            // Update the medicine_stock_in quantity (reduce by deleted amount)
            $newQuantity = $stockRecord->quantity - $validatedData['quantity'];
            
            if ($newQuantity == 0) {
                // If all quantity is deleted, we might want to keep the record but mark it as zero
                // or delete it entirely based on business logic
                DB::table('medicine_stock_in')
                    ->where('medicine_stock_in_id', $validatedData['medicine_stock_in_id'])
                    ->update(['quantity' => 0]);
            } else {
                DB::table('medicine_stock_in')
                    ->where('medicine_stock_in_id', $validatedData['medicine_stock_in_id'])
                    ->update(['quantity' => $newQuantity]);
            }

            // Commit transaction
            DB::commit();

            Log::info("Medicine deleted successfully. Deleted record ID: " . $deletedId);

            return response()->json([
                'success' => true,
                'message' => 'Medicine deleted successfully',
                'data' => [
                    'medicine_archived_id' => $deletedId,
                    'remaining_quantity' => $newQuantity,
                    'deleted_quantity' => $validatedData['quantity']
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::error("Validation error in deleteMedicine: " . json_encode($e->errors()));
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error in deleteMedicine: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get archived medicines for a branch
     */
    public function getArchivedMedicines($branchId)
    {
        try {
            Log::info("Fetching archived medicines for branch ID: {$branchId}");

            if (!Schema::hasTable('medicine_archived')) {
                Log::warning("medicine_archived table not found - returning empty array for branch ID: {$branchId}");
                return response()->json([]);
            }

            $archivedQuery = DB::table('medicine_archived as ma')
                ->leftJoin('medicine_stock_in as msi', 'ma.medicine_stock_in_id', '=', 'msi.medicine_stock_in_id')
                ->leftJoin('medicines as m', 'msi.medicine_id', '=', 'm.medicine_id')
                ->where('ma.branch_id', $branchId)
                ->orderBy('ma.archived_at', 'desc');

            $selects = [
                'ma.medicine_archived_id as id',
                'ma.medicine_stock_in_id',
                'ma.quantity',
                'ma.description',
                'ma.archived_at',
                'ma.branch_id',
                'msi.date_received as stock_date_received',
                'msi.expiration_date as stock_expiration_date',
                'm.medicine_name',
                'm.medicine_category'
            ];

            if (Schema::hasColumn('medicine_archived', 'date_received')) {
                $selects[] = 'ma.date_received as archived_date_received';
            }
            if (Schema::hasColumn('medicine_archived', 'expiration_date')) {
                $selects[] = 'ma.expiration_date as archived_expiration_date';
            }

            $archived = $archivedQuery->select($selects)->get();

            return response()->json($archived->toArray());

        } catch (\Exception $e) {
            Log::error("Error in getArchivedMedicines: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred'
            ], 500);
        }
    }

    /**
     * Archive a medicine: insert into medicine_archived and reduce quantity from stock in
     */
    public function archiveMedicine(Request $request)
    {
        try {
            $validated = $request->validate([
                'medicine_stock_in_id' => 'required|integer',
                'quantity' => 'required|integer|min:1',
                'description' => 'required|string|min:3',
                'branch_id' => 'required|integer'
            ]);

            Log::info('Archiving medicine: ' . json_encode($validated));

            if (!Schema::hasTable('medicine_archived')) {
                Log::error('medicine_archived table not found - cannot archive');
                return response()->json([ 'success' => false, 'message' => 'Archive table not found' ], 500);
            }

            DB::beginTransaction();

            // Verify stock in record
            $stockIn = DB::table('medicine_stock_in')
                ->where('medicine_stock_in_id', $validated['medicine_stock_in_id'])
                ->where('branch_id', $validated['branch_id'])
                ->first();

            if (!$stockIn) {
                DB::rollBack();
                return response()->json([ 'success' => false, 'message' => 'Stock in record not found' ], 404);
            }

            if ($stockIn->quantity < $validated['quantity']) {
                DB::rollBack();
                return response()->json([ 'success' => false, 'message' => 'Insufficient stock to archive' ], 400);
            }

            // Prepare insert data for medicine_archived, include optional date fields if available in request and in schema
            $insertData = [
                'medicine_stock_in_id' => $validated['medicine_stock_in_id'],
                'quantity' => $validated['quantity'],
                'description' => $validated['description'],
                'archived_at' => now(),
                'branch_id' => $validated['branch_id']
            ];

            if ($request->has('date_received') && Schema::hasColumn('medicine_archived', 'date_received')) {
                $insertData['date_received'] = $request->input('date_received');
            }
            if ($request->has('expiration_date') && Schema::hasColumn('medicine_archived', 'expiration_date')) {
                $insertData['expiration_date'] = $request->input('expiration_date');
            }

            // Insert into medicine_archived
            $archivedId = DB::table('medicine_archived')->insertGetId($insertData);

            // Subtract from medicine_stock_in quantity
            $newQuantity = $stockIn->quantity - $validated['quantity'];
            DB::table('medicine_stock_in')
                ->where('medicine_stock_in_id', $validated['medicine_stock_in_id'])
                ->update(['quantity' => $newQuantity]);

            DB::commit();

            Log::info('Medicine archived successfully, id: ' . $archivedId);

            return response()->json([ 'success' => true, 'data' => [ 'medicine_archived_id' => $archivedId, 'remaining_quantity' => $newQuantity ] ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::error('Validation error in archiveMedicine: ' . json_encode($e->errors()));
            return response()->json([ 'success' => false, 'message' => 'Validation failed', 'errors' => $e->errors() ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in archiveMedicine: ' . $e->getMessage());
            return response()->json([ 'success' => false, 'message' => 'Server error occurred' ], 500);
        }
    }

    /**
     * Restore an archived medicine: remove from medicine_archived and add back to stock in
     */
    public function restoreArchivedMedicine($branchId, $archivedId)
    {
        try {
            Log::info("Restoring archived medicine ID: {$archivedId} for branch {$branchId}");

            if (!Schema::hasTable('medicine_archived')) {
                Log::error('medicine_archived table not found - cannot restore');
                return response()->json([ 'success' => false, 'message' => 'Archive table not found' ], 500);
            }

            DB::beginTransaction();

            $archived = DB::table('medicine_archived')->where('medicine_archived_id', $archivedId)->where('branch_id', $branchId)->first();
            if (!$archived) {
                DB::rollBack();
                return response()->json([ 'success' => false, 'message' => 'Archived record not found' ], 404);
            }

            // Add back to the corresponding medicine_stock_in quantity
            $stockIn = DB::table('medicine_stock_in')->where('medicine_stock_in_id', $archived->medicine_stock_in_id)->first();
            if (!$stockIn) {
                // If the original stock record no longer exists, create a new stock_in entry using minimal info
                $newStockId = DB::table('medicine_stock_in')->insertGetId([
                    'medicine_id' => DB::table('medicines')->where('medicine_id', DB::raw('(SELECT medicine_id FROM medicine_stock_in WHERE medicine_stock_in_id = ' . intval($archived->medicine_stock_in_id) . ')'))->value('medicine_id') ?? 0,
                    'branch_id' => $branchId,
                    'quantity' => $archived->quantity,
                    'date_received' => now(),
                    'expiration_date' => null,
                    'user_id' => null
                ]);
            } else {
                DB::table('medicine_stock_in')
                    ->where('medicine_stock_in_id', $archived->medicine_stock_in_id)
                    ->update(['quantity' => $stockIn->quantity + $archived->quantity]);
            }

            // Remove archived record
            DB::table('medicine_archived')->where('medicine_archived_id', $archivedId)->delete();

            DB::commit();

            return response()->json([ 'success' => true ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in restoreArchivedMedicine: ' . $e->getMessage());
            return response()->json([ 'success' => false, 'message' => 'Server error occurred' ], 500);
        }
    }

    /**
     * Permanently delete an archived medicine record
     */
    public function deleteArchivedMedicine($branchId, $archivedId)
    {
        try {
            Log::info("Deleting archived medicine ID: {$archivedId} for branch {$branchId}");

            if (!Schema::hasTable('medicine_archived')) {
                Log::error('medicine_archived table not found - cannot delete archived record');
                return response()->json([ 'success' => false, 'message' => 'Archive table not found' ], 500);
            }

            $deleted = DB::table('medicine_archived')->where('medicine_archived_id', $archivedId)->where('branch_id', $branchId)->delete();

            if (!$deleted) {
                return response()->json([ 'success' => false, 'message' => 'Archived record not found' ], 404);
            }

            return response()->json([ 'success' => true ]);

        } catch (\Exception $e) {
            Log::error('Error in deleteArchivedMedicine: ' . $e->getMessage());
            return response()->json([ 'success' => false, 'message' => 'Server error occurred' ], 500);
        }
    }

    /**
     * Get history log data from MSSQL database
     */
    public function getHistoryLog(Request $request)
    {
        try {
            $branchId = $request->input('branch_id');
            $limit = $request->input('limit', 100);

            Log::info("Fetching history log for branch ID: {$branchId}, limit: {$limit}");

            $historyLogs = DB::table('history_log as hl')
                ->leftJoin('users as u', 'hl.user_id', '=', 'u.user_id')
                ->leftJoin('medicines as m', 'hl.medicine_id', '=', 'm.medicine_id')
                ->leftJoin('branches as b', 'hl.branch_id', '=', 'b.branch_id')
                ->select(
                    'hl.history_id',
                    'hl.medicine_id',
                    'hl.branch_id',
                    'hl.user_id',
                    'hl.activity',
                    'hl.quantity',
                    'hl.description',
                    'hl.created_at',
                    'u.name as user_name',
                    'u.email as user_email',
                    'm.medicine_name',
                    'm.medicine_category',
                    'b.branch_name'
                )
                ->where('hl.branch_id', $branchId)
                ->orderBy('hl.created_at', 'desc')
                ->limit($limit)
                ->get();

            Log::info("Found " . count($historyLogs) . " history log records");

            return response()->json([
                'success' => true,
                'data' => $historyLogs
            ]);

        } catch (\Exception $e) {
            Log::error("Error in getHistoryLog: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add entry to history log
     */
    public function addHistoryLog(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'medicine_id' => 'required|integer',
                'branch_id' => 'required|integer',
                'user_id' => 'required|integer',
                'activity' => 'required|string|in:add,reorder,dispense,remove',
                'quantity' => 'required|integer|min:1',
                'description' => 'required|string'
            ]);

            Log::info("Adding history log entry: " . json_encode($validatedData));

            $historyId = DB::table('history_log')->insertGetId([
                'medicine_id' => $validatedData['medicine_id'],
                'branch_id' => $validatedData['branch_id'],
                'user_id' => $validatedData['user_id'],
                'activity' => $validatedData['activity'],
                'quantity' => $validatedData['quantity'],
                'description' => $validatedData['description'],
                'created_at' => now()
            ]);

            // Get the created record with related data
            $historyRecord = DB::table('history_log as hl')
                ->leftJoin('users as u', 'hl.user_id', '=', 'u.user_id')
                ->leftJoin('medicines as m', 'hl.medicine_id', '=', 'm.medicine_id')
                ->leftJoin('branches as b', 'hl.branch_id', '=', 'b.branch_id')
                ->select(
                    'hl.*',
                    'u.name as user_name',
                    'm.medicine_name',
                    'b.branch_name'
                )
                ->where('hl.history_id', $historyId)
                ->first();

            Log::info("Successfully added history log entry: " . json_encode($historyRecord));

            return response()->json([
                'success' => true,
                'data' => $historyRecord
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error("Validation error in addHistoryLog: " . json_encode($e->errors()));
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error("Error in addHistoryLog: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get low stock medicines for a branch (≤ 50 units)
     * Calculates available quantity = stock_in - dispensed - archived
     */
    public function getLowStockMedicines($branchId)
    {
        try {
            Log::info("Getting low stock medicines for branch: {$branchId}");

            // Group by medicine_name to match the frontend inventory table display
            // This aggregates all quantities for medicines with the same name regardless of medicine_id
            $lowStockMedicines = DB::select("
                SELECT * FROM (
                    SELECT 
                        MIN(m.medicine_id) as medicine_id,
                        m.medicine_name,
                        MAX(m.medicine_category) as medicine_category,
                        (
                            (SELECT COALESCE(SUM(msi.quantity), 0) 
                             FROM medicine_stock_in msi 
                             JOIN medicines m2 ON msi.medicine_id = m2.medicine_id
                             WHERE m2.medicine_name = m.medicine_name AND msi.branch_id = ?)
                            -
                            (SELECT COALESCE(SUM(mso.quantity_dispensed), 0)
                             FROM medicine_stock_out mso
                             JOIN medicine_stock_in msi ON mso.medicine_stock_in_id = msi.medicine_stock_in_id
                             JOIN medicines m2 ON msi.medicine_id = m2.medicine_id
                             WHERE m2.medicine_name = m.medicine_name AND msi.branch_id = ?)
                            -
                            (SELECT COALESCE(SUM(ma.quantity), 0)
                             FROM medicine_archived ma
                             JOIN medicine_stock_in msi ON ma.medicine_stock_in_id = msi.medicine_stock_in_id
                             JOIN medicines m2 ON msi.medicine_id = m2.medicine_id
                             WHERE m2.medicine_name = m.medicine_name AND msi.branch_id = ?)
                        ) as available_quantity
                    FROM medicines m
                    WHERE m.medicine_id IN (
                        SELECT DISTINCT medicine_id 
                        FROM medicine_stock_in 
                        WHERE branch_id = ?
                    )
                    GROUP BY m.medicine_name
                ) AS inventory
                WHERE available_quantity <= 50 AND available_quantity > 0
                ORDER BY available_quantity ASC
            ", [$branchId, $branchId, $branchId, $branchId]);

            // Convert stdClass to array
            $lowStockMedicines = collect($lowStockMedicines)->map(function($item) {
                return (array) $item;
            })->toArray();

            Log::info("Found " . count($lowStockMedicines) . " low stock medicines");
            
            // Log detailed info about what was found
            foreach ($lowStockMedicines as $med) {
                Log::info("Low stock medicine detected: {$med['medicine_name']} (ID: {$med['medicine_id']}), Available: {$med['available_quantity']} units");
            }

            $results = array_map(function($medicine) {
                return [
                    'medicine_id' => $medicine['medicine_id'],
                    'medicine_name' => $medicine['medicine_name'],
                    'medicine_category' => $medicine['medicine_category'],
                    'quantity' => $medicine['available_quantity']
                ];
            }, $lowStockMedicines);

            // Notification creation removed - frontend handles low stock alerts via toast
            Log::info("Low stock check complete. Found " . count($results) . " medicines with stock ≤ 50 units");

            return response()->json($results);

        } catch (\Exception $e) {
            Log::error("Error getting low stock medicines: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get medicines expiring within 30 days for a branch
     */
    public function getSoonToExpireMedicines($branchId)
    {
        try {
            Log::info("Getting soon to expire medicines for branch: {$branchId}");

            $soonToExpireMedicines = DB::table('medicine_stock_in as msi')
                ->join('medicines as m', 'msi.medicine_id', '=', 'm.medicine_id')
                ->select(
                    'm.medicine_name',
                    'msi.expiration_date',
                    DB::raw('DATEDIFF(day, GETDATE(), msi.expiration_date) as days_until_expiry')
                )
                ->where('msi.branch_id', $branchId)
                ->where('msi.quantity', '>', 0) // Only include medicines with stock
                ->whereRaw('DATEDIFF(day, GETDATE(), msi.expiration_date) <= 30') // Within 30 days
                ->whereRaw('DATEDIFF(day, GETDATE(), msi.expiration_date) >= 0') // Not expired yet
                ->orderByRaw('DATEDIFF(day, GETDATE(), msi.expiration_date) asc') // Soonest first
                ->get();

            Log::info("Found " . count($soonToExpireMedicines) . " medicines expiring soon");

            return response()->json($soonToExpireMedicines->map(function($medicine) {
                return [
                    'medicine_name' => $medicine->medicine_name,
                    'expiration_date' => $medicine->expiration_date,
                    'days_until_expiry' => $medicine->days_until_expiry
                ];
            }));

        } catch (\Exception $e) {
            Log::error("Error getting soon to expire medicines: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred: ' . $e->getMessage()
            ], 500);
        }
    }
}
