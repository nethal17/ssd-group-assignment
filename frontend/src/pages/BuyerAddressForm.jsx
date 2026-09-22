import React, { useState, useEffect } from "react";
import { apiService, API_URL } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { toast } from "react-hot-toast";

export const BuyerAddressForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    buyerId: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    saveInfo: false,
  });

  const [errors, setErrors] = useState({
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await apiService.get(`/api/address/get-address/${userData._id}`);
        if (response.data) {
          setFormData({
            buyerId: userData._id,
            address: response.data.address,
            city: response.data.city,
            postalCode: response.data.postalCode,
            phone: response.data.phone,
            saveInfo: true
          });
          setIsEditing(true);
        } else {
          setFormData(prev => ({ ...prev, buyerId: userData._id }));
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          toast.error("Failed to fetch address data");
        }
        setFormData(prev => ({ ...prev, buyerId: userData._id }));
      }
    };

    if (userData._id) {
      fetchAddress();
    }
  }, [userData._id]);

  const validatePhone = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Validate length (must be exactly 10 digits)
    if (cleaned.length !== 10 && cleaned.length > 0) {
      return "Phone number must be 10 digits";
    }
    
    return "";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for phone number input
    if (name === "phone") {
      // Only allow numbers and limit to 10 characters
      const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
      
      setFormData({
        ...formData,
        [name]: cleanedValue,
      });
      
      // Validate phone number
      setErrors({
        ...errors,
        phone: validatePhone(cleanedValue),
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate all fields before submission
    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      setErrors({ ...errors, phone: phoneError });
      setLoading(false);
      return;
    }

    if (!formData.saveInfo) {
      toast.error("You must agree to save the information");
      setLoading(false);
      return;
    }

    try {
      let response;
      if (isEditing) {
        response = await apiService.put(
          `${API_URL}/api/address/add/${formData.buyerId}`,
          formData
        );
      } else {
        response = await apiService.post(
          `${API_URL}/api/address/add`,
          formData
        );
      }

      if (response.status === 200 || response.status === 201) {
        toast.success("Address saved successfully!");
        navigate("/checkout");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-extrabold text-center text-green-700">
          Shipping Address
        </h1>
  
        <form
          onSubmit={handleSubmit}
          className="p-8 bg-white rounded-3xl shadow-2xl border border-gray-200"
        >
          <div className="mb-6">
            <label className="block mb-2 text-lg font-semibold text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500"
              required
              placeholder="Street address or P.O. Box"
            />
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-2 text-lg font-semibold text-gray-700">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500"
                required
                placeholder="City"
              />
            </div>
  
            <div>
              <label className="block mb-2 text-lg font-semibold text-gray-700">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500"
                placeholder="Optional"
              />
            </div>
          </div>
  
          <div className="mb-2">
            <label className="block mb-2 text-lg font-semibold text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none ${
                errors.phone ? "border-red-500" : "border-gray-300 focus:border-green-500"
              }`}
              required
              placeholder="10 digit phone number"
              pattern="[0-9]{10}"
              maxLength="10"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Enter a 10-digit phone number (numbers only)
            </p>
          </div>
  
          <div className="flex items-center mb-8">
            <input
              type="checkbox"
              name="saveInfo"
              checked={formData.saveInfo}
              onChange={handleChange}
              className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              id="saveInfo"
            />
            <label htmlFor="saveInfo" className="ml-3 text-gray-700 text-base">
              Save this information for next time
            </label>
          </div>
  
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 text-gray-700 border border-gray-400 rounded-xl hover:bg-gray-100 transition duration-300"
            >
              Back
            </button>
  
            <button
              type="submit"
              disabled={loading || errors.phone}
              className={`px-8 py-3 text-lg font-semibold rounded-xl text-white transition duration-300 ${
                loading || errors.phone
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Saving..." : "Continue to Checkout"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};