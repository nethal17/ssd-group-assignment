import { useState, useEffect, useCallback } from "react";
import { apiService } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Navbar } from "../components/Navbar";

export const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState(null);
  const [stripe, setStripe] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const navigate = useNavigate();

  const fetchCartItems = useCallback(async (userId) => {
        try {
          
          if (!userId) {
            toast.error('Please login to view your cart');
            navigate('/login');
            return;
          }
          const response = await apiService.get(`/api/cart/${userId}`);
          if (response.data) {
            setCartItems(response.data.items);
          }
        } catch (error) {
          console.error('Error fetching cart items:', error.response?.data?.message || error.message);
          toast.error('Failed to load cart items');
        } finally {
          setLoading(false);
        }
      }, [navigate]);

  const fetchAddress = useCallback(async (userId) => {
    try {
      const response = await apiService.get(`/api/address/get-address/${userId}`);
      setAddress(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error("Failed to load address");
        console.error("Address fetch error:", error.response?.data?.message || error.message);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please login to view your cart");
          navigate("/login");
          return;
        }
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(userData);
        await fetchCartItems(userData._id);
        await fetchAddress(userData._id);
      } catch (error) {
        toast.error("Failed to load user data");
        console.error("User data error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate, fetchCartItems, fetchAddress]);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await loadStripe('pk_test_51R1MPn02Tln9XO2Pw0O2KdyFoYGjTVHjsfD7SXT7yLTuzA00iYnUSj1Bh9fxN3GabW3Ud2DVaMssJvoV8ODbHgWc00m3XhcXZ0');
        setStripe(stripeInstance);
      } catch (error) {
        console.error("Failed to initialize Stripe:", error);
        toast.error("Payment system initialization failed");
      }
    };
    initializeStripe();
  }, []);

  const handlePayment = async () => {
    if (!user || cartItems.length === 0 || !stripe) {
      toast.error("Cannot process payment");
      return;
    }
    
    setIsProcessingPayment(true);
    
    try {
      // Store cart items in localStorage for post-payment processing
      localStorage.setItem("cartItems", JSON.stringify(cartItems));

      // Format cart items for Stripe
      const line_items = cartItems.map(item => ({
        price_data: {
          currency: 'lkr',
          product_data: {
            name: item.description || 'Product'
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity || 1,
      }));

      // Add delivery cost as a separate line item
      const totalDeliveryCost = cartItems.reduce((total, item) => total + (item.deliveryCost || 0), 0);
      if (totalDeliveryCost > 0) {
        line_items.push({
          price_data: {
            currency: 'lkr',
            product_data: {
              name: 'Delivery Cost'
            },
            unit_amount: Math.round(totalDeliveryCost * 100), // Convert to cents
          },
          quantity: 1,
        });
      }

      const response = await apiService.post(
        "/api/stripe/checkout",
        {
          userId: user._id,
          cartId: 'temp-cart',
          line_items: line_items,
          currency: "LKR",
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/checkout`,
          customerEmail: user.email
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Backend response:', response.data);

      if (response.data.url) {
        // If we get a URL directly, redirect to it
        window.location.href = response.data.url;
        return;
      }

      // If we get a session ID, use the Stripe redirect
      const sessionId = response.data.id || response.data.sessionId || response.data.session?.id;
      
      if (!sessionId) {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format from server');
      }

      const result = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (result.error) {
        throw result.error;
      }
    } catch (error) {
      console.error("Payment error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      toast.error(error.response?.data?.error || `Payment failed: ${error.message}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + ((item.price* item.quantity) + item.deliveryCost);
    }, 0);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="mb-5 text-2xl font-bold text-red-600">Your cart is empty</h1>
        <button 
          onClick={() => navigate("/organic-waste")} 
          className="px-4 py-2 text-white bg-purple-600 rounded"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-green-800 sm:text-4xl">
              Complete Your Purchase
            </h1>
            <p className="mt-2 text-lg text-green-600">
              Review your order details before payment
            </p>
          </div>
  
          {/* Shipping Address Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transition-all hover:shadow-lg">
            <div className="p-6 sm:p-8">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-800 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Shipping Address</h2>
              </div>
              {address ? (
                <div className="pl-14">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="font-medium text-green-800">Address</p>
                      <p>{address.address}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="font-medium text-green-800">City</p>
                      <p>{address.city}</p>
                    </div>
                    {address.postalCode && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="font-medium text-green-800">Postal Code</p>
                        <p>{address.postalCode}</p>
                      </div>
                    )}
                    {address.phone && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="font-medium text-green-800">Phone</p>
                        <p>{address.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="pl-14">
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          No shipping address found. Please add one to proceed with your order.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
  
          {/* Cart Items Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transition-all hover:shadow-lg">
            <div className="p-6 sm:p-8">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-800 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cartItems.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {item.price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity || 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {(item.price * (item.quantity || 1)).toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {item.deliveryCost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
  
          {/* Total Price Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Total Amount</h2>
                <div className="text-2xl font-bold text-green-600">
                  Rs. {calculateTotal().toFixed(2)}
                </div>
              </div>
            </div>
          </div>
  
          {/* Checkout Button */}
          <div className="mt-8">
            <button
              onClick={handlePayment}
              disabled={!address || isProcessingPayment}
              className={`w-full py-3 px-6 rounded-xl text-white font-bold text-lg shadow-md transition-all duration-300 ${
                address 
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-lg transform hover:-translate-y-1"
                  : "bg-gray-400 cursor-not-allowed"
              } flex items-center justify-center`}
            >
              {isProcessingPayment ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : address ? (
                <>
                  Proceed to Payment
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </>
              ) : (
                "Add Shipping Address First"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;