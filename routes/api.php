<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\BranchRequestController;
use App\Http\Controllers\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Authentication routes
Route::post('/auth/google', [AuthController::class, 'handleGoogleLogin']);

// User management routes for MSSQL integration
Route::post('/users/by-email', [UserController::class, 'getUserByEmail']);
Route::get('/users/{id}/branch', [UserController::class, 'getUserBranch']);
Route::get('/users', [UserController::class, 'getAllUsers']);
Route::post('/users', [UserController::class, 'createUser']);
Route::put('/users/{id}', [UserController::class, 'updateUser']);
Route::delete('/users/{id}', [UserController::class, 'deleteUser']);

// Branch management routes for MSSQL integration
Route::get('/branches', [UserController::class, 'getAllBranches']);
Route::get('/branches/{id}', [UserController::class, 'getBranchById']);
Route::get('/branches/other/{userBranchId}', [UserController::class, 'getOtherBranches']);
Route::get('/branches/{id}/inventory', [UserController::class, 'getBranchInventory']);

// Medicine management routes for MSSQL integration
Route::get('/medicines', [UserController::class, 'getAllMedicines']);
Route::post('/medicines', [UserController::class, 'createMedicine']);
Route::post('/medicines/delete', [UserController::class, 'deleteMedicine']);
Route::post('/medicine-stock-in', [UserController::class, 'addMedicineStockIn']);
Route::get('/medicines/stock-out', [MedicineController::class, 'stockOut']);
Route::get('/medicine-stock-records/{medicineId}/{branchId}', [UserController::class, 'getAvailableStockRecords']);
Route::post('/medicine-dispense', [UserController::class, 'dispenseMedicine']);
Route::post('/dispense', [UserController::class, 'dispenseMedicine']);
Route::post('/dispense-v2', [UserController::class, 'dispenseMedicineV2']);

// History log routes for MSSQL integration
Route::get('/history-log', [UserController::class, 'getHistoryLog']);
Route::post('/history-log', [UserController::class, 'addHistoryLog']);

// Dashboard routes for MSSQL integration
Route::get('/branches/{branchId}/low-stock', [UserController::class, 'getLowStockMedicines']);
Route::get('/branches/{branchId}/expiring-soon', [UserController::class, 'getSoonToExpireMedicines']);
// Archived medicines routes
Route::get('/branches/{branchId}/archived', [UserController::class, 'getArchivedMedicines']);
Route::post('/branches/{branchId}/archived/{archivedId}/restore', [UserController::class, 'restoreArchivedMedicine']);
Route::delete('/branches/{branchId}/archived/{archivedId}', [UserController::class, 'deleteArchivedMedicine']);
// Endpoint to archive a medicine (move to medicine_archived)
Route::post('/medicines/archive', [UserController::class, 'archiveMedicine']);

// Branch requests and notifications
Route::post('/branch-requests', [BranchRequestController::class, 'store']);
Route::get('/branches/{branchId}/branch-requests', [BranchRequestController::class, 'index']);
Route::post('/branch-requests/{requestId}/approve', [BranchRequestController::class, 'approve']);
Route::post('/branch-requests/{requestId}/reject', [BranchRequestController::class, 'reject']);
Route::post('/branch-requests/{requestId}/confirm-receipt', [BranchRequestController::class, 'confirmReceipt']);
// History (approved/rejected) for branch requests involving a branch
Route::get('/branches/{branchId}/branch-requests/history', [BranchRequestController::class, 'history']);

// Notifications endpoints
Route::post('/notifications', [NotificationController::class, 'store']);
Route::get('/branches/{branchId}/notifications', [NotificationController::class, 'index']);
Route::post('/branches/{branchId}/notifications/mark-read', [NotificationController::class, 'markRead']);

// The default user route can stay if you need it
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
