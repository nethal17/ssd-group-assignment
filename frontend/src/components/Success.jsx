import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../utils/api";
import { toast } from "react-hot-toast";
import { Navbar } from "../components/Navbar";

export const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const processOrder = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");

        /*if (!user._id || cartItems.length === 0) {
          toast.error("Invalid order data");
          navigate("/");
          return;
        }*/

        await apiService.post("/api/order-history/process-payment", {
          userId: user._id,
          cartItems: cartItems
        });

        localStorage.removeItem("cartItems");
        toast.success("Order processed successfully!");
      } catch (error) {
        console.error("Error processing order:", error);
        toast.error("Failed to process order");
      }
    };

    processOrder();
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
        <div className="container flex flex-col items-center justify-center px-4 py-16 mx-auto">
          {/* Animated Checkmark */}
          <div className="relative mb-8">
            <div className="flex items-center justify-center w-32 h-32 bg-green-100 rounded-full">
              <svg 
                className="w-20 h-20 text-green-600 animate-checkmark" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <div className="absolute inset-0 border-4 border-green-200 rounded-full opacity-75 animate-ping"></div>
          </div>

          {/* Success Message */}
          <div className="max-w-2xl mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-green-800">
              Payment Successful!
            </h1>
            <p className="mb-6 text-xl text-gray-600">
              Thank you for your purchase! Your order is being processed.
            </p>
            
            {/* Creative Elements */}
            <div className="p-6 mb-8 bg-white border border-green-100 shadow-lg rounded-xl">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="text-lg font-semibold text-gray-800">What's Next?</h3>
              </div>
              <ul className="space-y-3 text-left text-gray-600">
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Order confirmation sent to your email</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Delivery updates coming soon</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>24/7 customer support available</span>
                </li>
              </ul>
            </div>

            {/* Customer Appreciation */}
            <div className="p-6 mb-8 border border-green-200 bg-green-50 rounded-xl">
              <div className="flex items-center justify-center mb-3">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <h3 className="text-lg font-medium text-green-800">We appreciate your trust!</h3>
              </div>
              <p className="text-gray-600">
                You're now part of our premium customer circle. Enjoy exclusive benefits on your next purchase!
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 font-medium text-white transition duration-300 transform bg-green-600 rounded-lg shadow-md hover:bg-green-700 hover:scale-105"
            >
              Return to Home
            </button>
            <button
              onClick={() => navigate("/order-history")}
              className="px-8 py-3 font-medium text-green-600 transition duration-300 bg-white border border-green-600 rounded-lg shadow-sm hover:bg-gray-50"
            >
              View Order History
            </button>
          </div>

          {/* Creative Footer */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500">
              Need help? <a href="#" className="text-green-600 hover:underline">Contact our support team</a> | 
              <a 
                onClick={() => navigate("/final-summary")} 
                className="ml-2 text-green-600 cursor-pointer hover:underline"
              >
                View Financial Summary
              </a>
            </p>
            <div className="flex justify-center mt-4 space-x-4">
              <a href="#" className="text-gray-400 hover:text-green-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-green-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-green-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Add some CSS for animations */}
      <style jsx>{`
        .animate-checkmark {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: dash 2s ease-out forwards;
        }
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </>
  );
};

export default Success;