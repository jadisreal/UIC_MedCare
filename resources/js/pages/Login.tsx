import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { UserService } from "../services/userService";
import { jwtDecode } from "jwt-decode";

interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
}

export default function Login() {
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!credentialResponse.credential) {
        throw new Error("Login failed: Credential not found.");
      }

      // Decode Google JWT token to get user info
      const googleUser: GoogleUser = jwtDecode(credentialResponse.credential);
      
      // Verify user access through MSSQL database
      const userData = await UserService.verifyUserAccess(googleUser.email);
      
      // Store user session locally
      UserService.storeUserSession(userData);
      
      // Optional: Send authentication data to Laravel backend
      try {
        await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            token: credentialResponse.credential,
            userData: userData
          }), 
        });
      } catch (sessionError) {
        console.warn("Laravel session creation failed:", sessionError);
        // Continue without Laravel session - user data is still stored locally
      }
      
      // Navigate to dashboard on successful authentication
      router.visit("/dashboard");
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Login error:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  // State to handle loading and display errors to the user
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Google login error
  const handleGoogleError = () => {
    setError("Google sign-in was unsuccessful. Please try again.");
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full h-screen">
      <div className="relative w-full h-full max-w-[1550px]">
        <div className="relative h-full bg-[url(/images/UIC.png)] bg-cover bg-[50%_50%]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,72,100,0.5)_0%,rgba(255,160,173,0.5)_100%)]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
            <img
              className="w-[125px] h-[125px] object-cover mb-6"
              alt="UIC logo"
              src="/images/Logo.png"
            />
            <h1 className="italic font-bold text-white text-[50px] text-center">UIC MEDICARE</h1>
            <h2 className="text-white text-3xl tracking-[0] leading-normal mt-3 mb-8 text-center">
              Health Services & Inventory Management System
            </h2>
            
            {/* Display loading or error states */}
            {isLoading ? (
              <div className="text-white text-lg font-semibold my-4">Signing in...</div>
            ) : (
              <div className="my-4">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                />
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 max-w-sm text-center bg-red-800 bg-opacity-70 text-white font-semibold rounded-md">
                {error}
              </div>
            )}

            <p className="mt-6 text-white text-lg font-semibold text-center">
              Sign in with your UIC Google Account
            </p>
            {/* Removed Skip and Debug Test buttons for production UI */}
            
            {/* Removed debugResult UI */}
          </div>
        </div>
      </div>
    </div>
  );
}
