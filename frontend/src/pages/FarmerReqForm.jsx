import { API_URL } from "../utils/api";
import { useState, useEffect } from "react";


const FarmerReqForm = () => {
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updatedFarmer, setUpdatedFarmer] = useState({});

  useEffect(() => {
    fetch(`${API_URL}/api/deliveryReq/get-delivery-requests`)
      .then((res) => res.json())
      .then((data) => setFarmers(data))
      .catch((err) => console.error("Error fetching farmers:", err));
  }, []);

  const handleUpdateFarmer = (farmer) => {
    if (farmer.status !== 'Pending') {
      alert("Truck driver has accepted the booking. You can't change this now.");
      return;
    }

    setSelectedFarmer(farmer);
    setUpdatedFarmer(farmer);
    setIsUpdateModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedFarmer((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = () => {
    fetch(`${API_URL}/api/deliveryReq/update-farmer/${selectedFarmer._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFarmer),
    })
      .then((res) => res.json())
      .then(() => {
        setIsUpdateModalOpen(false);
        window.location.reload();
      })
      .catch((err) => console.error("Error updating farmer:", err));
  };

  const handleDeleteFarmer = (id) => {
    if (window.confirm("Are you sure you want to delete this farmer?")) {
      fetch(`${API_URL}/api/deliveryReq/delete-farmer/${id}`, { method: "DELETE" })
        .then(() => {
          setFarmers((prev) => prev.filter((farmer) => farmer._id !== id));
          window.location.reload();
        })
        .catch((err) => console.error("Error deleting farmer:", err));
    }
  };

  const getStatusClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active') return 'bg-green-100 text-green-700';
    if (statusLower === 'inactive') return 'bg-gray-200 text-gray-700';
    if (statusLower === 'pending') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">All Delivery Requests</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-red-100 shadow rounded-xl">
          <h3 className="text-sm text-gray-500">Total Farmers</h3>
          <p className="text-xl font-semibold">{farmers.length}</p>
        </div>

        <div className="p-4 bg-green-100 shadow rounded-xl">
          <h3 className="text-sm text-gray-700">Active Frmers</h3>
          <p className="text-xl font-semibold">{3}
          </p>
        </div>
        
        <div className="p-4 bg-yellow-100 shadow rounded-xl">
          <h3 className="text-sm text-gray-700">Pending Verification</h3>
          <p className="text-xl font-semibold">
            {farmers.filter((f) => f.status?.toLowerCase() === 'pending').length}
          </p>
        </div>
        <div className="p-4 bg-blue-100 shadow rounded-xl">
          <h3 className="text-sm text-gray-700">Districts</h3>
          <p className="text-xl font-semibold">
            {new Set(farmers.map((f) => f.district)).size}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 text-left text-gray-600 text-l">
            <tr>
              <th className="px-4 py-3">Farmer ID</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">District</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="text-m text-gray-700">
            {farmers.length > 0 ? (
              farmers.map((farmer) => (
                <tr key={farmer._id} className="border-t">
                  <td className="px-4 py-3 flex items-center gap-2">
                    <span>👨‍🌾</span>
                    <span>{farmer.farmerId}</span>
                  </td>
                  <td className="px-4 py-3">{farmer.farmerPhone}</td>
                  <td className="px-4 py-3">{farmer.district}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-s font-medium ${getStatusClass(farmer.status)}`}>
                      {farmer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleUpdateFarmer(farmer)}
                      className="px-4 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDeleteFarmer(farmer._id)}
                      className="px-4 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                  No farmers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-800">
              Update Farmer Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Farmer ID</label>
                <input
                  type="text"
                  name="farmerId"
                  value={updatedFarmer.farmerId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="farmerPhone"
                  value={updatedFarmer.farmerPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">District</label>
                <input
                  type="text"
                  name="district"
                  value={updatedFarmer.district}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-gray-50"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleUpdateSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Update
              </button>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerReqForm;
