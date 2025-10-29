<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request; // <-- Make sure this is imported

class AuthController extends Controller
{
    /**
     * Handle the Google login request.
     */
    public function handleGoogleLogin(Request $request)
    {
        $token = $request->input('token');

        // --- IMPORTANT ---
        // This is where you will add logic to verify the Google token,
        // find the user in your database (or create a new one),
        // and log them in using Laravel's Auth facade.
        // For now, we just confirm it works.

        if ($token) {
            // If a token was received, send back a success status.
            return response()->json(['status' => 'success']);
        }

        // If no token, send back an error.
        return response()->json(['status' => 'error', 'message' => 'Token not provided.'], 400);
    }
}