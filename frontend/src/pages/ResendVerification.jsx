import { useState } from "react";
import { apiService } from "../utils/api";
import { Link, useSearchParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Toaster, toast } from "react-hot-toast";

// Reached from the login page, or by redirect when a verification link is
// invalid, expired or already used (?status=invalid).
export const ResendVerification = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const linkInvalid = searchParams.get("status") === "invalid";

  const resendVerification = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      // The API answers the same way whether or not the account exists
      const response = await apiService.post("/api/auth/resend-verification", { email });
      toast.success(response.data?.msg || "If an unverified account exists for that email, a new verification link has been sent.");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to send verification email.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-40 to-emerald-100">
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md px-8 py-10 mx-4 bg-white rounded-3xl shadow-2xl backdrop-blur-sm border border-white/20">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
              Verify Your Email
            </h2>
            <p className="mt-2 text-gray-500">Enter your email to receive a new verification link</p>
          </div>

          {linkInvalid && (
            <div className="p-4 mb-6 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-xl">
              This verification link is invalid, has expired or has already been used.
              Verification links are valid for 24 hours. If your email is already verified, you can simply{" "}
              <Link to="/login" className="font-medium underline">sign in</Link>.
            </div>
          )}

          <form onSubmit={resendVerification} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                />
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 text-lg font-medium text-white rounded-xl shadow-md transition-all duration-300 ${
                loading
                  ? "bg-emerald-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
            >
              {loading ? "Sending link..." : "Send Verification Link"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-500 hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
