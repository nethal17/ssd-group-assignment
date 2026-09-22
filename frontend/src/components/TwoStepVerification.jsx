import React, { useState } from 'react';
import { apiService } from '../utils/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const TwoStepVerification = ({ email }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // First get the user by email
      const userResponse = await apiService.get('/api/auth/getAllUsers');
      const user = userResponse.data.data.find(user => user.email === email);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Then verify the code
      const response = await apiService.post('/api/auth/verify-two-step-code', {
        userId: user._id,
        code
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Login successful!');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.response?.data?.msg || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="w-full max-w-md">
        <div className="overflow-hidden bg-white shadow-xl rounded-2xl">
          <div className="p-6 text-center bg-gradient-to-r from-green-500 to-green-600">
            <h2 className="text-3xl font-bold text-white">
              Two-Step Verification
            </h2>
            <p className="mt-2 text-green-100">
              Check your email for the verification code
            </p>
          </div>
          
          <form className="px-8 py-6" onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="code" className="block mb-2 text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="relative">
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  className="w-full px-4 py-3 placeholder-gray-400 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                We've sent a verification code to {email}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-3 px-4 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md transition-all duration-200 ${loading ? 'opacity-75' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </button>
            
            <div className="mt-4 text-center">
              <a href="#" className="text-sm font-medium text-green-600 hover:text-green-500">
                Didn't receive a code? Resend
              </a>
            </div>
          </form>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Having trouble? <a href="#" className="font-medium text-green-600 hover:text-green-500">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
};