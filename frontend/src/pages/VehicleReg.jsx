import React, { useState } from "react";
import { apiService, API_URL } from "../utils/api";

const VehicleReg = () => {
  const [form, setForm] = useState({
    nic: "",
    licenseNumber: "",
    licenseExpiry: "",
    address: "",
    preferredDistrict: "",
    vehicleType: "",
    vehicleNumber: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const districts = ["Colombo", "Gampaha", "Kandy", "Kalutara", "Galle"];
  const vehicleTypes = ["Lorry", "Truck", "Mini Truck"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Frontend validation
    const requiredFields = {
      nic: form.nic,
      licenseNumber: form.licenseNumber,
      licenseExpiry: form.licenseExpiry,
      address: form.address,
      preferredDistrict: form.preferredDistrict,
      vehicleType: form.vehicleType,
      vehicleNumber: form.vehicleNumber
    };

    // Check for empty fields
    const emptyFields = Object.entries(requiredFields)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (emptyFields.length > 0) {
      setError(`Please fill in all required fields: ${emptyFields.join(', ')}`);
      return;
    }

    // Validate NIC format (12 digits or 9 digits + V)
    const nicRegex = /^(\d{12}|\d{9}[Vv])$/;
    if (!nicRegex.test(form.nic)) {
      setError("Please enter a valid NIC number (12 digits or 9 digits + V)");
      return;
    }

    // Validate license number format (at least 5 characters)
    if (form.licenseNumber.length < 5) {
      setError("License number must be at least 5 characters long");
      return;
    }

    // Validate license expiry date (must be in the future)
    const today = new Date();
    const expiryDate = new Date(form.licenseExpiry);
    if (expiryDate <= today) {
      setError("License expiry date must be in the future");
      return;
    }

    // Validate vehicle number format (at least 4 characters)
    if (form.vehicleNumber.length < 4) {
      setError("Vehicle number must be at least 4 characters long");
      return;
    }

    try {
      await apiService.post(
        `${API_URL}/api/vehicle-reg/register`,
        form
      );

      setMessage("Vehicle registration successful!");
      
      // Reset form
      setForm({
        nic: "",
        licenseNumber: "",
        licenseExpiry: "",
        address: "",
        preferredDistrict: "",
        vehicleType: "",
        vehicleNumber: "",
      });
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error.response?.data?.msg || 
        "Registration failed. Please check your details and try again."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg p-8 bg-white rounded-lg shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Vehicle Registration
        </h2>
        {message && <div className="mb-4 text-green-600">{message}</div>}
        {error && <div className="mb-4 text-red-600">{error}</div>}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">NIC Number</label>
          <input
            type="text"
            name="nic"
            value={form.nic}
            onChange={handleChange}
            required
            placeholder="Enter NIC number"
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">License Number</label>
          <input
            type="text"
            name="licenseNumber"
            value={form.licenseNumber}
            onChange={handleChange}
            required
            placeholder="Enter license number"
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">License Expiry Date</label>
          <input
            type="date"
            name="licenseExpiry"
            value={form.licenseExpiry}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            placeholder="Enter address"
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500"
            rows="3"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Preferred District</label>
          <select
            name="preferredDistrict"
            value={form.preferredDistrict}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Vehicle Type</label>
          <select
            name="vehicleType"
            value={form.vehicleType}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select Vehicle Type</option>
            {vehicleTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Vehicle Number</label>
          <input
            type="text"
            name="vehicleNumber"
            value={form.vehicleNumber}
            onChange={handleChange}
            required
            placeholder="Enter vehicle number"
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:ring-2 focus:ring-green-500"
        >
          Register Vehicle
        </button>
      </form>
    </div>
  );
};

export default VehicleReg; 