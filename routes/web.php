<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// --- Public Routes ---
// These routes do NOT require a user to be logged in.

// The public login page
Route::get('/', function () {
    return Inertia::render('Login');
})->name('login');

// The dashboard page
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

// All application pages are now public
Route::get('/search/student', fn() => Inertia::render('Search/Student'));
Route::get('/search/employee', fn() => Inertia::render('Search/Employee'));

Route::get('/inventory/dashboard', fn() => Inertia::render('Inventory/InventDashboard'));
Route::get('/inventory/stocks', function() {
    return Inertia::render('Inventory/Stocks');
})->name('inventory.stocks');

// New route for branch inventory without branch ID (gets user's branch automatically)
Route::get('/inventory/branchinventory', function () {
    return Inertia::render('Inventory/BranchInventory');
});

// Keep the old route for backward compatibility
Route::get('/inventory/branchinventory/{branchId}', function ($branchId) {
    return Inertia::render('Inventory/BranchInventory', [
        'branchId' => (int) $branchId
    ]);
});

Route::get('/inventory/otherinventorystocks/{branchId}', function ($branchId) {
    return Inertia::render('Inventory/OtherInventoryStocks', [
        'branchId' => (int) $branchId
    ]);
});

Route::get('/inventory/history', fn() => Inertia::render('Inventory/History'));
Route::get('/Reports', fn() => Inertia::render('Reports'));
Route::get('/Print', fn() => Inertia::render('Print'));
// Chat page
Route::get('/Chat', fn() => Inertia::render('Chat'));

// HSMS consultation routes
Route::get('/HSMS/Consultation/Inpatient', fn() => Inertia::render('HSMS/Consultation/Inpatient'));
Route::get('/HSMS/Consultation/Outpatient', fn() => Inertia::render('HSMS/Consultation/Outpatient'));
Route::get('/HSMS/Consultation/Emergency', fn() => Inertia::render('HSMS/Consultation/Emergency'));
// HSMS Consultation Routes for Student/Employee profiles and create flows
Route::get('/consultation/student/{id}', fn($id) => Inertia::render('Consultation/StudentProfile', ['id' => $id]));
Route::get('/consultation/employee/{id}', fn($id) => Inertia::render('Consultation/EmployeeProfile', ['id' => $id]));
Route::get('/consultation/student/{id}/create', fn($id) => Inertia::render('Consultation/CreateConsultation', ['id' => $id]));
Route::get('/consultation/employee/{id}/create', fn($id) => Inertia::render('Consultation/CreateConsultation', ['id' => $id]));
Route::get('/consultation/student/{id}/create/walk-in', fn($id) => Inertia::render('Consultation/WalkIn', ['id' => $id]));
Route::get('/consultation/employee/{id}/create/walk-in', fn($id) => Inertia::render('Consultation/WalkIn', ['id' => $id]));
Route::get('/consultation/student/{id}/create/scheduled', fn($id) => Inertia::render('Consultation/Scheduled', ['id' => $id]));
Route::get('/consultation/employee/{id}/create/scheduled', fn($id) => Inertia::render('Consultation/Scheduled', ['id' => $id]));
Route::get('/test', fn() => Inertia::render('Test'));
Route::get('/About', fn() => Inertia::render('About'));
Route::get('/Notification', fn() => Inertia::render('Notification'));

// --- Protected Routes ---
// Routes that MUST require a user to be logged in (like logging out).
Route::middleware(['auth'])->group(function () {
    Route::post('/logout', function () {
        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
        return redirect('/');
    })->name('logout');
});