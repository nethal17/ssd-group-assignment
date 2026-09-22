import React, { useEffect, useState } from "react";
import { API_URL } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const TruckDriverDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [completedDeliveries, setCompletedDeliveries] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [location, setLocation] = useState(null);
  const navigate = useNavigate();

  const handleDeliveryRequestClick = () => {
    navigate("/delivery-history");
  };

  const handlePickupRequestClick = () => {
    navigate("/truck-dashboard");
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    if (request?.location?.coordinates?.length === 2) {
      setLocation({
        lat: request.location.coordinates[0],
        lng: request.location.coordinates[1],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    setLocation(null);
  };

  useEffect(() => {
    fetch(`${API_URL}/api/deliveryReq/get-delivery-requests`)
      .then((res) => res.json())
      .then((data) => {
        setPendingRequests(data.filter((req) => req.status === "Pending"));
        setAcceptedRequests(data.filter((req) => req.status === "accepted"));
        setCompletedDeliveries(data.filter((req) => req.status === "completed"));
      })
      .catch((err) => console.error("Error fetching requests:", err.message || err));
  }, []);

  const handleAccept = (id) => {
    fetch(`${API_URL}/api/deliveryReq/update-delivery-requests/${id}`, {
      method: "PUT",
    }).then(() => {
      setPendingRequests((prev) => prev.filter((req) => req._id !== id));
      setAcceptedRequests((prev) => [...prev, { _id: id, status: "accepted" }]);
      window.location.reload();
    });
  };

  const handleCompleted = (id) => {
    fetch(`${API_URL}/api/deliveryReq/update-delivery-requests/${id}`, {
      method: "PUT",
    }).then(() => {
      setPendingRequests((prev) => prev.filter((req) => req._id !== id));
      setCompletedDeliveries((prev) => [...prev, { _id: id, status: "completed" }]);
      window.location.reload();
    });
  };

  const handleDelete = (id) => {
    fetch(`${API_URL}/api/deliveryReq/delete-delivery-request/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setPendingRequests((prev) => prev.filter((req) => req._id !== id));
      })
      .catch((err) => console.error("Error deleting request:", err.message || err));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-r from-green-50 via-white to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-4 mb-6 justify-center">
            <button
              onClick={handlePickupRequestClick}
              className="px-6 py-2 rounded-lg font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
            >
              Pickup Requests
            </button>
            <button
              onClick={handleDeliveryRequestClick}
              className="px-6 py-2 rounded-lg font-medium transition-colors bg-white border border-green-600 text-green-600 hover:bg-green-50"
            >
              Delivery Requests
            </button>
          </div>

          <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">Truck Driver Dashboard</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pending Requests */}
            <div className="bg-white p-4 shadow-md rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-blue-700 text-center border-b pb-2">Pending Requests</h3>
              {pendingRequests.map((req) => (
                <div key={req._id} className="mb-4 p-4 bg-blue-50 border rounded-lg shadow-sm">
                  <p><strong>Farmer ID:</strong> {req.farmerId}</p>
                  <p><strong>District:</strong> {req.district}</p>
                  <p><strong>Waste Type:</strong> {req.wasteType}</p>
                  <div className="mt-3 flex gap-2 justify-center">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
                      onClick={() => handleViewDetails(req)}
                    >
                      View Details
                    </button>
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded"
                      onClick={() => handleAccept(req._id)}
                    >
                      Accept
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
                      onClick={() => handleDelete(req._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Accepted Deliveries */}
            <div className="bg-white p-4 shadow-md rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-green-700 text-center border-b pb-2">Accepted Deliveries</h3>
              {acceptedRequests.map((req) => (
                <div key={req._id} className="mb-4 p-4 bg-green-50 border rounded-lg shadow-sm">
                  <p><strong>Farmer ID:</strong> {req.farmerId}</p>
                  <p><strong>District:</strong> {req.district}</p>
                  <p><strong>Waste Type:</strong> {req.wasteType}</p>
                  <div className="mt-3 flex justify-center">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-4 py-1 rounded"
                      onClick={() => handleCompleted(req._id)}
                    >
                      Mark as Done
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Completed Deliveries */}
            <div className="bg-white p-4 shadow-md rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-700 text-center border-b pb-2">Completed Deliveries</h3>
              {completedDeliveries.map((req) => (
                <div key={req._id} className="mb-4 p-4 bg-gray-100 border rounded-lg shadow-sm">
                  <p><strong>Farmer ID:</strong> {req.farmerId}</p>
                  <p><strong>District:</strong> {req.district}</p>
                  <p><strong>Waste Type:</strong> {req.wasteType}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Modal */}
          {isModalOpen && selectedRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white w-full max-w-2xl p-6 rounded shadow-lg overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">Request Details</h3>
                <p><strong>Farmer ID:</strong> {selectedRequest.farmerId}</p>
                <p><strong>District:</strong> {selectedRequest.district}</p>
                <p><strong>Waste Type:</strong> {selectedRequest.wasteType}</p>
                <p><strong>Pickup Date:</strong> {new Date(selectedRequest.pickupDate).toDateString()}</p>
                <p><strong>Emergency Contact:</strong> {selectedRequest.emergencyContact}</p>
                <p className="mt-4"><strong>Location:</strong></p>

                <LoadScript googleMapsApiKey="AIzaSyBvdWTRDRIKWd11ClIGYQrSfc883IEkRiw">
                  <GoogleMap
                    id="map"
                    mapContainerStyle={{ width: "100%", height: "400px" }}
                    center={location}
                    zoom={12}
                  >
                    <Marker position={location} />
                  </GoogleMap>
                </LoadScript>

                <button
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TruckDriverDashboard;
