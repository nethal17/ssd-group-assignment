import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Navbar } from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { apiService, API_URL } from "../utils/api";

export const ProductListingForm = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("Please login to list agri-waste");
    navigate("/login");
  }
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = userData.role;
  if (userRole !== "farmer") {
    toast.error("Only farmers can list agri-waste");
    navigate("/");
  }
  const [formData, setFormData] = useState({
    wasteCategory: "",
    wasteType: "",
    wasteItem: "",
    province: "",
    district: "",
    city: "",
    quantity: "",
    price: "",
    description: "",
    expireDate: "",
    image: null,
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    branch: "",
  });

  const [wasteTypes, setWasteTypes] = useState([]);
  const [wasteItems, setWasteItems] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    const verifyToken = () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log("Token payload:", payload);
        
        if (!payload.userId && !payload._id && !payload.id) {
          console.error("Token is missing user identification");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    };

    verifyToken();
  }, []);

  // Fetch Provinces 
  useEffect(() => {
    const provinces = [
      "Northern Province",
      "North Central Province",
      "North Western Province",
      "Western Province",
      "Central Province",
      "Sabaragamuwa Province",
      "Southern Province",
      "Uva Province",
      "Eastern Province",
    ];
    setProvinces(provinces);
  }, []);

  // Fetch Waste Types 
  useEffect(() => {
    if (formData.wasteCategory) {
      fetch(`${API_URL}/api/product-listing/waste-types/${formData.wasteCategory}`)
        .then((res) => res.json())
        .then((data) => setWasteTypes(data))
        .catch(() => toast.error("Failed to fetch waste types"));
    }
  }, [formData.wasteCategory]);

  // Fetch Waste Items 
  useEffect(() => {
    if (formData.wasteType) {
      fetch(`${API_URL}/api/product-listing/waste-items/${formData.wasteType}`)
        .then((res) => res.json())
        .then((data) => setWasteItems(data))
        .catch(() => toast.error("Failed to fetch waste items"));
    }
  }, [formData.wasteType]);

  // Fetch Districts based on Province
  useEffect(() => {
    if (formData.province) {
      fetch(`${API_URL}/api/product-listing/districts/${formData.province}`)
        .then((res) => res.json())
        .then((data) => setDistricts(data))
        .catch(() => toast.error("Failed to fetch districts"));
    }
  }, [formData.province]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "file" ? e.target.files?.[0] || null : value,
    }));
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userData?._id) {
        toast.error("User information is missing. Please log in again.");
        return;
    }

    // Price Validate
    const price = parseFloat(formData.price);
    if (isNaN(price)) {
      toast.error("Price must be a valid number");
      return;
    }
    if (price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    // Quantity Validate
    const quantity = parseInt(formData.quantity, 10);
    if (isNaN(quantity)) {
      toast.error("Quantity must be a valid number");
      return;
    }
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    // Validate expire date 
    const today = new Date();
    const expireDate = new Date(formData.expireDate);
    if (expireDate <= today) {
      toast.error("Expire date must be in the future");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You are not authenticated. Please log in.");
      return;
    }

    try {
      let photo = "";
      if (formData.image) {
        // Convert image to base64
        const base64Image = await convertToBase64(formData.image);
        
        // Upload to Cloudinary
        const uploadData = new FormData();
        uploadData.append("file", base64Image);
        uploadData.append("upload_preset", "agri_waste");

        const cloudinaryResponse = await fetch("https://api.cloudinary.com/v1_1/dm8vchgk9/image/upload", {
          method: "POST",
          body: uploadData,
        });

        const cloudinaryData = await cloudinaryResponse.json();
        photo = cloudinaryData.secure_url;
      }

      const payload = {
        wasteCategory: formData.wasteCategory,
        wasteType: formData.wasteType,
        wasteItem: formData.wasteItem,
        province: formData.province,
        district: formData.district,
        city: formData.city,
        quantity,
        price,
        description: formData.description,
        expireDate: formData.expireDate,
        photo,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountHolderName: formData.accountHolderName,
        branch: formData.branch,
      };

      // First create the product listing
      const response = await apiService.post("/api/product-listing/create", payload, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const responseData = response.data;
      
      if (!response.status || response.status >= 400) {
        console.error("Backend error response:", responseData);
        throw new Error(responseData.message || responseData.error?.message || "Submission failed");
      }

      if (response.ok) {
        toast.success("Product listed successfully! Your Listings will be reviewed shortly.");
        // Reset form after successful submission
        setFormData({
          wasteCategory: "",
          wasteType: "",
          wasteItem: "",
          province: "",
          district: "",
          city: "",
          quantity: "",
          price: "",
          description: "",
          expireDate: "",
          image: null,
          bankName: "",
          accountNumber: "",
          accountHolderName: "",
          branch: "",
        });
      }
    } catch (error) {
      console.error(error);
      console.error("Submission error:", error);
      toast.error(error.message || "Submission failed. Please try again.");
    }
};    
      

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-green-50 to-gray-50">
        <div className="w-full max-w-3xl p-8 bg-white rounded-2xl shadow-xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800">Add New Product Listing</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Waste Category */}
            <div className="p-6 bg-gray-50 rounded-xl">
              <label className="block mb-3 text-lg font-semibold text-gray-700">Waste Category</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="wasteCategory"
                    value="Organic Waste"
                    checked={formData.wasteCategory === "Organic Waste"}
                    onChange={handleChange}
                    className="w-6 h-6 text-green-600 border-2 border-gray-300 focus:ring-green-500"
                    required
                  />
                  <span className="text-gray-700">Organic Waste</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="wasteCategory"
                    value="Inorganic Waste"
                    checked={formData.wasteCategory === "Inorganic Waste"}
                    onChange={handleChange}
                    className="w-6 h-6 text-green-600 border-2 border-gray-300 focus:ring-green-500"
                    required
                  />
                  <span className="text-gray-700">Non-Organic Waste</span>
                </label>
              </div>
            </div>

            {/* Waste Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <label className="block mb-3 text-lg font-semibold text-gray-700">Waste Type</label>
                <select
                  name="wasteType"
                  value={formData.wasteType}
                  onChange={handleChange}
                  className="w-full p-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Waste Type</option>
                  {wasteTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Waste Item */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <label className="block mb-3 text-lg font-semibold text-gray-700">Waste Item</label>
                <select
                  name="wasteItem"
                  value={formData.wasteItem}
                  onChange={handleChange}
                  className="w-full p-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Waste Item</option>
                  {wasteItems.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="mb-4 text-xl font-semibold text-gray-800">Location Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Province */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Province</label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Province</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">District</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Enter your city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Quantity & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <label className="block mb-3 text-lg font-semibold text-gray-700">Quantity (Kg)</label>
                <input
                  type="text"
                  name="quantity"
                  placeholder="Enter quantity in kilograms"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full p-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <label className="block mb-3 text-lg font-semibold text-gray-700">Price (Per Kg)</label>
                <input
                  type="text"
                  name="price"
                  placeholder="Enter price per kilogram"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full p-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <label className="block mb-3 text-lg font-semibold text-gray-700">Description</label>
              <textarea
                name="description"
                placeholder="Enter a detailed description about your waste product..."
                value={formData.description}
                onChange={handleChange}
                className="w-full p-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                rows={5}
              />
            </div>

            {/* Expire Date & Image Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <label className="block mb-3 text-lg font-semibold text-gray-700">Expire Date</label>
                <input
                  type="date"
                  name="expireDate"
                  value={formData.expireDate}
                  onChange={handleChange}
                  className="w-full p-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <label className="block mb-3 text-lg font-semibold text-gray-700">Product Image (Optional)</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-gray-100 rounded-lg cursor-pointer transition-all duration-200">
                    <div className="flex flex-col items-center justify-center pt-7">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8 text-gray-400 group-hover:text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                        {formData.image ? formData.image.name : 'Attach a photo'}
                      </p>
                    </div>
                    <input
                      type="file"
                      name="image"
                      onChange={handleChange}
                      className="opacity-0"
                      accept="image/*"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Banking Details */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="mb-4 text-xl font-semibold text-gray-800">Banking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    placeholder="Enter your bank name"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Branch</label>
                  <input
                    type="text"
                    name="branch"
                    placeholder="Enter branch name"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Account Holder Name</label>
                  <input
                    type="text"
                    name="accountHolderName"
                    placeholder="Enter account holder's name"
                    value={formData.accountHolderName}
                    onChange={handleChange}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Account Number</label>
                  <input
                    type="text"
                    name="accountNumber"
                    placeholder="Enter account number"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Submit Listing
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
