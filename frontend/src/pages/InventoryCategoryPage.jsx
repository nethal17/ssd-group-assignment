import { useState, useEffect } from "react";
import { FiBell, FiSearch } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { apiService } from "../utils/api";

const WASTE_CATEGORIES = {
  'Organic Waste': ['Crop Residues', 'Fruit & Vegetable Waste', 'Plantation Waste', 'Nut & Seed Waste', 'Livestock & Dairy Waste', 'Forestry Waste'],
  'Inorganic Waste': ['Chemical Waste', 'Plastic Waste', 'Metal Waste', 'Fabric & Textile Waste', 'Glass & Ceramic Waste', 'Rubber Waste']
};

export const InventoryCategoryPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [approvedListings, setApprovedListings] = useState([]);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to view this page");
      navigate("/login");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = userData.role;

    if (userRole !== "admin") {
      toast.error("Only Admin can view this page");
      navigate("/");
    }
  }, [navigate]);

  // Fetch approved product listings
  useEffect(() => {
    const fetchApprovedListings = async () => {
      try {
        setLoading(true);
        const response = await apiService.get(`/api/product-listing/listings/approved`);
        setApprovedListings(response.data);
        
        // Calculate quantities
        const calculatedQuantities = {};
        
        // Initialize all waste types with zero quantities
        Object.keys(WASTE_CATEGORIES).forEach(category => {
          WASTE_CATEGORIES[category].forEach(type => {
            calculatedQuantities[type] = {
              totalItems: 0,
              totalQuantity: 0
            };
          });
        });
        
        // Calculate actual quantities from approved listings
        response.data.forEach(listing => {
          if (calculatedQuantities[listing.wasteType]) {
            calculatedQuantities[listing.wasteType].totalItems += 1;
            calculatedQuantities[listing.wasteType].totalQuantity += listing.quantity || 0;
          }
        });
        
        setQuantities(calculatedQuantities);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch inventory data:", err);
        setLoading(false);
      }
    };

    fetchApprovedListings();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen text-xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Waste Inventory Dashboard</h1>
            <p className="text-gray-600">Manage and track waste categories</p>
            <p className="text-sm text-green-600 mt-1">
              Showing data for {approvedListings.length} approved listings
            </p>
          </div>
          
        </div>

        {/* Organic Waste Section */}
        <div className="mb-12">
          <div className="flex items-center mb-4">
            <div className="w-3 h-6 bg-green-500 rounded mr-2"></div>
            <h2 className="text-xl font-bold text-gray-800">Organic Waste</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {WASTE_CATEGORIES['Organic Waste'].map((type) => (
              <div 
                key={type} 
                className="p-4 rounded-lg shadow-sm border border-gray-200 bg-green-50 hover:shadow-md transition-all h-full flex flex-col"
              >
                <h3 className="text-md font-semibold text-gray-800 mb-3">{type}</h3>
                <div className="mt-auto space-y-2">
                  <div>
                    <p className="text-xs text-gray-600">Total Listings</p>
                    <p className="text-xl font-bold text-gray-800">
                      {quantities[type]?.totalItems || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Quantity</p>
                    <p className="text-xl font-bold text-green-600">
                      {quantities[type]?.totalQuantity || 0} KG
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inorganic Waste Section */}
        <div className="mb-12">
          <div className="flex items-center mb-4">
            <div className="w-3 h-6 bg-blue-500 rounded mr-2"></div>
            <h2 className="text-xl font-bold text-gray-800">Inorganic Waste</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {WASTE_CATEGORIES['Inorganic Waste'].map((type) => (
              <div 
                key={type} 
                className="p-4 rounded-lg shadow-sm border border-gray-200 bg-blue-50 hover:shadow-md transition-all h-full flex flex-col"
              >
                <h3 className="text-md font-semibold text-gray-800 mb-3">{type}</h3>
                <div className="mt-auto space-y-2">
                  <div>
                    <p className="text-xs text-gray-600">Total Listings</p>
                    <p className="text-xl font-bold text-gray-800">
                      {quantities[type]?.totalItems || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Quantity</p>
                    <p className="text-xl font-bold text-blue-600">
                      {quantities[type]?.totalQuantity || 0} KG
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Waste Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <h3 className="font-medium text-green-800 mb-3">Organic Waste Totals</h3>
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-green-700">Total Listings</p>
                  <p className="text-2xl font-bold text-green-600">
                    {WASTE_CATEGORIES['Organic Waste'].reduce((sum, type) => sum + (quantities[type]?.totalItems || 0), 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-700">Total Quantity</p>
                  <p className="text-2xl font-bold text-green-600">
                    {WASTE_CATEGORIES['Organic Waste'].reduce((sum, type) => sum + (quantities[type]?.totalQuantity || 0), 0)} KG
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-3">Inorganic Waste Totals</h3>
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-blue-700">Total Listings</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {WASTE_CATEGORIES['Inorganic Waste'].reduce((sum, type) => sum + (quantities[type]?.totalItems || 0), 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-700">Total Quantity</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {WASTE_CATEGORIES['Inorganic Waste'].reduce((sum, type) => sum + (quantities[type]?.totalQuantity || 0), 0)} KG
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};