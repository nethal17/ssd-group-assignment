import { useState } from "react";
import { apiService } from "../utils/api";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Toaster, toast } from "react-hot-toast";
import { TwoStepVerification } from "../components/TwoStepVerification";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await apiService.post("/api/auth/login", {
        email,
        password,
      });

      if (response.data.requiresVerification) {
        setUserEmail(email);
        setShowVerification(true);
        toast.success('Verification code sent to your email');
      } else {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        toast.success("Login successful!");
        navigate("/profile");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (showVerification) {
    return <TwoStepVerification email={userEmail} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md px-8 py-10 mx-4 bg-white border shadow-2xl rounded-3xl backdrop-blur-sm border-white/20">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-4 rounded-t-full bg-gradient-to-r from-green-500 to-green-600"></div>
          
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
              Welcome Back
            </h2>
            <p className="mt-2 text-gray-500">Sign in to your account</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-10 transition-all duration-200 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
            
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-10 transition-all duration-200 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="w-4 h-4 border-gray-300 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-500 hover:underline"
              >
                Forgot password?
              </Link>
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
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 bg-white">
                  Don't have an account?
                </span>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Link
                to="/register"
                className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-500 hover:underline"
              >
                Create new account
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};