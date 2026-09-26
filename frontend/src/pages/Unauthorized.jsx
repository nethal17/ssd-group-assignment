import React from "react";
import { Link } from "react-router-dom";

export const Unauthorized = () => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md overflow-hidden bg-white shadow-xl rounded-2xl">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
              <span className="text-4xl">&#128274;</span>
            </div>
          </div>

          <h1 className="mb-2 text-3xl font-bold text-gray-800">Access Denied</h1>
          <p className="mb-8 text-gray-600">
            You don&apos;t have permission to view this page. If you think this is a
            mistake, contact an administrator.
          </p>

          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full px-4 py-3 font-semibold text-center text-white transition duration-300 bg-green-600 rounded-lg hover:bg-green-700"
            >
              Back to Home
            </Link>
            <Link
              to="/login"
              className="block w-full px-4 py-3 font-semibold text-center text-gray-700 transition duration-300 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Sign in with a different account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
