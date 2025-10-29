<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    // Store a notification
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'branch_id' => 'required|integer|exists:branches,branch_id',
                // we accept either reference_id (preferred) or legacy user_id which some callers use to pass medicine id
                'reference_id' => 'nullable|integer|exists:medicines,medicine_id',
                'user_id' => 'nullable|integer',
                'type' => 'required|string',
                'message' => 'required|string'
            ]);

            // Determine reference_id: prefer explicit reference_id, otherwise fall back to user_id if present
            $referenceId = $validated['reference_id'] ?? $request->input('user_id') ?? null;

            $id = DB::table('notifications')->insertGetId([
                'branch_id' => $validated['branch_id'],
                'reference_id' => $referenceId,
                'type' => $validated['type'],
                'message' => $validated['message'],
                'is_read' => 0,
                'created_at' => now()
            ]);

            return response()->json(['success' => true, 'notification_id' => $id], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Validation failed creating notification: ' . json_encode($e->errors()));
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error creating notification: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server error occurred: ' . $e->getMessage()], 500);
        }
    }

    // Get notifications for a branch
    public function index($branchId)
    {
        try {
            $notifications = DB::table('notifications')
                ->where('branch_id', $branchId)
                ->orderBy('created_at', 'desc')
                ->get();

            // Parse request id token from message if present and include request status + branch context
            $parsed = $notifications->map(function($n) {
                $obj = (array) $n;
                $obj['request_id'] = null;
                $obj['request_status'] = null;
                $obj['from_branch_id'] = null;
                $obj['to_branch_id'] = null;
                if (!empty($obj['message'])) {
                    if (preg_match('/\[req:(\d+)\]/', $obj['message'], $m)) {
                        $reqId = intval($m[1]);
                        $obj['request_id'] = $reqId;
                        // fetch request status and branch context if exists
                        $req = DB::table('branch_requests')->where('branch_request_id', $reqId)->first();
                        if ($req) {
                            $obj['request_status'] = $req->status ?? null;
                            $obj['from_branch_id'] = $req->from_branch_id ?? null;
                            $obj['to_branch_id'] = $req->to_branch_id ?? null;
                        }
                    }
                }
                return $obj;
            });

            return response()->json($parsed->toArray());
        } catch (\Exception $e) {
            Log::error('Error fetching notifications: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server error occurred'], 500);
        }
    }

    // Mark notifications as read for a branch
    public function markRead(Request $request, $branchId = null)
    {
        try {
            $branch = $request->input('branch_id') ?? $branchId;
            if (!$branch) {
                return response()->json(['success' => false, 'message' => 'branch_id is required'], 422);
            }

            DB::table('notifications')
                ->where('branch_id', $branch)
                ->update(['is_read' => 1]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Error marking notifications read: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server error occurred'], 500);
        }
    }
}
