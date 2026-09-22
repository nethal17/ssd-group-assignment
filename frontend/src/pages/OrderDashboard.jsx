import React, { useEffect, useState, useCallback } from "react";
import { apiService } from "../utils/api";
import { format } from "date-fns";
import { FiShoppingBag, FiCalendar, FiFilter, FiX, FiCheck, FiTruck, FiStar } from "react-icons/fi";
import { FaStar, FaRegStar } from "react-icons/fa";
import { Navbar } from "../components/Navbar";

const ReviewModal = ({ isOpen, onClose, order, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!reviewText.trim()) {
      setError("Please write a review");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        productName: order.productName,
        orderId: order._id,
        farmerId: order.farmerId,
        rating,
        review: reviewText
      });
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Review Product</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="mb-2 font-medium">{order.productName}</p>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="mr-1 text-2xl focus:outline-none"
              >
                {star <= rating ? (
                  <FaStar className="text-yellow-400" />
                ) : (
                  <FaRegStar className="text-yellow-400" />
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Your Review
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
            placeholder="Share your experience with this product..."
          />
        </div>
        
        {error && (
          <div className="mb-4 text-sm text-red-500">{error}</div>
        )}
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const OrderDashboard = ({ checkoutData }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData?._id;

  const statusOptions = [
    { value: "all", label: "All Orders", icon: <FiShoppingBag /> },
    { value: "toDeliver", label: "To Deliver", icon: <FiTruck /> },
    { value: "toReceive", label: "To Receive", icon: <FiCheck /> },
    { value: "toReview", label: "Completed", icon: <FiStar /> },
  ];

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get("/api/order-history");
      const data = Array.isArray(response.data) ? response.data : [];
      setOrders(data);
      filterOrders(data, activeStatus, startDate, endDate);
    } catch (error) {
      console.error("Failed to fetch order history:", error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeStatus, startDate, endDate]);

  useEffect(() => {
    if (userId) {
      fetchOrders();
    }
  }, [userId, fetchOrders]);

  const filterOrders = (ordersToFilter, status, start, end) => {
    let filtered = [...ordersToFilter];
    
    if (status !== "all") {
      filtered = filtered.filter(order => order.orderStatus === status);
    }
    
    if (start && end) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= new Date(start) && orderDate <= new Date(end);
      });
    }
    
    setFilteredOrders(filtered);
  };

  const handleStatusFilter = (status) => {
    setActiveStatus(status);
    filterOrders(orders, status, startDate, endDate);
  };

  const handleDateFilter = () => {
    filterOrders(orders, activeStatus, startDate, endDate);
  };

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setActiveStatus("all");
    setFilteredOrders(orders);
  };

  const handleProceedToPayment = async () => {
    try {
      await apiService.post("/api/order-history", {
        userId: userId,
        productName: checkoutData.productName,
        productId: checkoutData.productId,
        quantity: checkoutData.quantity,
        totalPrice: checkoutData.totalPrice,
      });
      alert("Order saved to history successfully!");
      fetchOrders();
    } catch (error) {
      console.error("Failed to save order history", error);
      alert("Failed to save order history");
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      toDeliver: "bg-blue-100 text-blue-800",
      toReceive: "bg-purple-100 text-purple-800",
      toReview: "bg-amber-100 text-amber-800",
      
    };
    
    const statusText = {
      toDeliver: "To Deliver",
      toReceive: "To Receive",
      toReview: "Completed",
      
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[status] || "bg-gray-100 text-gray-800"}`}>
        {statusText[status] || status}
      </span>
    );
  };

  return (
    <>
          <Navbar />
    <div className="min-h-screen px-4 py-8 bg-gray-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="mt-2 text-sm text-gray-600">
              View and manage all the past and current orders
            </p>
          </div>
          
          {checkoutData && (
            <button
              onClick={handleProceedToPayment}
              className="inline-flex items-center px-6 py-3 mt-4 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm md:mt-0 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Proceed to Payment
            </button>
          )}
        </div>

        <div className="p-6 mb-8 bg-white rounded-lg shadow">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:w-auto">
              <label className="block mb-2 text-sm font-medium text-gray-700">Filter by Status</label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusFilter(option.value)}
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${activeStatus === option.value ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  >
                    {option.icon}
                    <span className="ml-2">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full md:w-auto">
              <label className="block mb-2 text-sm font-medium text-gray-700">Filter by Date Range</label>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiCalendar className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiCalendar className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDateFilter}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-500 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FiFilter className="mr-2" />
                    Apply
                  </button>
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FiX className="mr-2" />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 text-indigo-600 bg-indigo-100 rounded-full">
                <FiShoppingBag className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 text-blue-600 bg-blue-100 rounded-full">
                <FiTruck className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">To Deliver</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(o => o.orderStatus === 'toDeliver').length}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 text-purple-600 bg-purple-100 rounded-full">
                <FiCheck className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">To Receive</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(o => o.orderStatus === 'toReceive').length}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                <FiStar className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(o => o.orderStatus === 'toReview').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 mx-auto border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading your orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <FiShoppingBag className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeStatus === "all" 
                  ? "You haven't placed any orders yet."
                  : `You don't have any orders with status "${activeStatus}".`}
              </p>
              {(startDate || endDate || activeStatus !== "all") && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Total Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Order Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                    
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-md">
                            <FiShoppingBag className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{order.productName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Rs. {order.totalPrice.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(new Date(order.orderDate), "MMM dd, yyyy")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.orderStatus)}
                      </td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};