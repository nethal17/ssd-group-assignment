import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleOutlined } from '@ant-design/icons';

const EmailVerificationSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleOutlined className="text-5xl text-green-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Email Verified Successfully!</h1>
            <p className="text-gray-600">Your email has been verified. You can now log in to your account.</p>
          </div>

          <div className="space-y-4">
            <Link
              to="/login"
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition duration-300 ease-in-out transform hover:scale-105"
            >
              Login to the Website
            </Link>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Having trouble?{' '}
                <Link to="/contact" className="text-green-600 hover:text-green-700 font-medium">
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationSuccess; 