<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash; // Import Hash facade

class GoogleAuthController extends Controller
{
    public function authenticate(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        try {
            // Get user details from the token
            $googleUser = Socialite::driver('google')->stateless()->userFromToken($request->input('token'));

            // Find an existing user or create a new one
            $user = User::updateOrCreate(
                [
                    'google_id' => $googleUser->getId(), // Match user by their unique Google ID
                ],
                [
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'password' => Hash::make('password_from_google'), // Set a default or random password
                ]
            );

            // Log the user in
            Auth::login($user);

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            // Handle exceptions (e.g., invalid token)
            return response()->json(['status' => 'fail', 'message' => 'Authentication failed.'], 401);
        }
    }
}