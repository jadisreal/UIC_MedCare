import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";

export default function LoginWithSupabase() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const { user, signIn, signUp, loading } = useSupabaseAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.visit("/dashboard");
    }
  }, [user, loading]);

  // Handle email/password login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
  const errMsg = (error && (error as any).message) ? (error as any).message : 'Login failed';
  throw new Error(errMsg);
      }

      if (data.user) {
        // Store login state in localStorage for compatibility with existing system
        localStorage.setItem("isLoggedIn", "true");
        router.visit("/dashboard");
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login (keep existing functionality)
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!credentialResponse.credential) {
        throw new Error("Login failed: Credential not found.");
      }

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      
      const data = await res.json();

      if (res.ok && data.status === "success") {
        localStorage.setItem("isLoggedIn", "true");
        router.visit("/dashboard");
      } else {
        throw new Error(data.message || "Google login failed. Please try again.");
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in was unsuccessful. Please try again.");
  };

  if (loading) {
    return (
      <div className="bg-white flex items-center justify-center w-full h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

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
            <h1 className="italic text-white text-[50px] text-center">MEDITRACK</h1>
            <h2 className="font-extrabold text-white text-3xl tracking-[0] leading-normal mt-3 mb-8 text-center">
              MEDICINE INVENTORY SYSTEM
            </h2>
            
            {/* Email/Password Login Form */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-4 w-full max-w-md">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:border-white/50"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:border-white/50"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </div>

            {/* OR separator */}
            <div className="text-white text-lg mb-4">OR</div>
            
            {/* Google Login */}
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

            {/* Error display */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-2 rounded-lg mt-4 text-center max-w-md">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
