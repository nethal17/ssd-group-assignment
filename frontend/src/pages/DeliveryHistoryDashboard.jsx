import React, { useEffect, useState } from "react";
import { apiService } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";

const DeliveryHistoryDashboard = () => {
  const [orders, setOrders] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [address, setAddress] = useState(null);
  const userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData?._id;
  const navigate = useNavigate();

  // Add navigation handlers
  const handleDeliveryRequestClick = () => {
    navigate("/delivery-history");
  };

  const handlePickupRequestClick = () => {
    navigate("/truck-dashboard");
  }

  useEffect(() => {
    if (userId) {
      fetchOrders();
      fetchAddress();
    }
  }, [userId]);

  const fetchOrders = () => {
    apiService
      .get(`/api/order-history`)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Error fetching delivery orders:", err.response?.data?.message || err.message));
  };

  const fetchAddress = (userId) => {
    apiService
      .get(`/api/address/get-address/${userId}`)
      .then((res) => setAddress(res.data))
      .catch((err) => console.error("Error fetching address:", err.response?.data?.message || err.message));
  };

  const handleAccept = async (orderId) => {
    try {
      await apiService.put(`/api/order-history/${orderId}/accept`);
      fetchOrders();
    } catch (error) {
      console.error("Error accepting order:", error.response?.data?.message || error.message);
    }
  };

  const handleDecline = async (orderId) => {
    try {
      await apiService.put(`/api/order-history/${orderId}/decline`);
      fetchOrders();
    } catch (error) {
      console.error("Error declining order:", error.response?.data?.message || error.message);
    }
  };

  const handleMarkAsDone = async (orderId) => {
    try {
      await apiService.put(`/api/order-history/${orderId}/mark-done`);
      fetchOrders();
    } catch (error) {
      console.error("Error marking order as done:", error.response?.data?.message || error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "toDeliver":
        return "bg-yellow-100 text-yellow-800";
      case "toReceive":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };



  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={handleDeliveryRequestClick}
              className="px-6 py-2 rounded-lg font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
            >
              Delivery Requests
            </button>
            <button
              onClick={handlePickupRequestClick}
              className="px-6 py-2 rounded-lg font-medium transition-colors bg-white border border-green-600 text-green-600 hover:bg-green-50"
            >
              Pickup Requests
            </button>
          </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-9 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Delivery History Dashboard</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-m font-medium text-blue-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-m font-medium text-blue-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-m font-medium text-blue-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-m font-medium text-blue-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-m font-medium text-blue-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No delivery history found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.userId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.orderStatus === "toDeliver" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAccept(order._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDecline(order._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                        {order.orderStatus === "toReceive" && (
                          <button
                            onClick={() => handleMarkAsDone(order._id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Mark As Done
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default DeliveryHistoryDashboard;